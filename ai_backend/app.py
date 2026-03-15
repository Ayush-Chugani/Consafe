from __future__ import annotations

import base64
import json
import os
import pickle
import re
import tempfile
import threading
import time
from collections import Counter
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import cv2
import numpy as np
from flask import Flask, Response, flash, jsonify, redirect, render_template, request, send_file, url_for
from werkzeug.utils import secure_filename

try:
    import face_recognition
except Exception:
    face_recognition = None

from ppe_app.config import MODEL_PATH
from ppe_app.email_service import send_report_via_emailjs
from ppe_app.model import load_model
from ppe_app.reporting import build_analysis_report
from ppe_app.safety_scoring import compute_worker_safety_scores, parse_worker_int_map
from ppe_app.video_processing import DeepSort, process_video


app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 1024 * 1024 * 1024  # 1GB upload cap
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-only-secret-change-me")

# Maps download ids to generated annotated output paths.
DOWNLOADS: dict[str, str] = {}
JOBS: dict[str, dict] = {}

APP_ROOT = Path(__file__).resolve().parent
FACE_VERIFICATION_DIR = APP_ROOT / "Face Verification"
FACE_VERIFICATION_DATA_DIR = FACE_VERIFICATION_DIR / "data"
FACE_VERIFICATION_IMAGES_DIR = FACE_VERIFICATION_DATA_DIR / "images"
FACE_VERIFICATION_BACKUPS_DIR = FACE_VERIFICATION_DATA_DIR / "backups"
FACE_VERIFICATION_ENCODINGS_PATH = FACE_VERIFICATION_DATA_DIR / "encodings.pickle"
FACE_VERIFICATION_NAMES_PATH = FACE_VERIFICATION_DATA_DIR / "names.pickle"
ATTENDANCE_DB_PATH = FACE_VERIFICATION_DATA_DIR / "attendance.json"
FACE_MODEL = "cnn"
FACE_MATCH_TOLERANCE = 0.45
PROCESS_FRAME_SCALE = 0.5


def _ensure_attendance_storage() -> None:
    FACE_VERIFICATION_DATA_DIR.mkdir(parents=True, exist_ok=True)
    FACE_VERIFICATION_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    FACE_VERIFICATION_BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
    if not ATTENDANCE_DB_PATH.exists():
        ATTENDANCE_DB_PATH.write_text(json.dumps({"workers": {}, "events": []}, indent=2), encoding="utf-8")


def _load_face_verification_data() -> tuple[list, list]:
    _ensure_attendance_storage()
    try:
        with FACE_VERIFICATION_ENCODINGS_PATH.open("rb") as f:
            encodings = pickle.load(f)
        with FACE_VERIFICATION_NAMES_PATH.open("rb") as f:
            names = pickle.load(f)
    except Exception:
        encodings, names = [], []
    return encodings, names


def _save_face_verification_data(encodings: list, names: list) -> None:
    _ensure_attendance_storage()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    with (FACE_VERIFICATION_BACKUPS_DIR / f"encodings_{timestamp}.pickle").open("wb") as f:
        pickle.dump(encodings, f)
    with (FACE_VERIFICATION_BACKUPS_DIR / f"names_{timestamp}.pickle").open("wb") as f:
        pickle.dump(names, f)

    with FACE_VERIFICATION_ENCODINGS_PATH.open("wb") as f:
        pickle.dump(encodings, f)
    with FACE_VERIFICATION_NAMES_PATH.open("wb") as f:
        pickle.dump(names, f)


def _load_attendance_db() -> dict:
    _ensure_attendance_storage()
    try:
        return json.loads(ATTENDANCE_DB_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {"workers": {}, "events": []}


def _save_attendance_db(db: dict) -> None:
    _ensure_attendance_storage()
    ATTENDANCE_DB_PATH.write_text(json.dumps(db, indent=2), encoding="utf-8")


def _extract_face_encoding(frame) -> list[float] | None:
    if frame is None or frame.size == 0:
        return None
    if face_recognition is None:
        return None

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    locations = face_recognition.face_locations(rgb, model=FACE_MODEL)
    if not locations:
        return None

    top, right, bottom, left = max(locations, key=lambda loc: (loc[2] - loc[0]) * (loc[1] - loc[3]))
    encodings = face_recognition.face_encodings(rgb, known_face_locations=[(top, right, bottom, left)])
    if not encodings:
        return None
    return [float(x) for x in encodings[0].tolist()]


def _decode_data_url_image(data_url: str):
    if not data_url or "," not in data_url:
        return None
    try:
        _, payload = data_url.split(",", 1)
        raw = base64.b64decode(payload)
        arr = np.frombuffer(raw, dtype=np.uint8)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        return frame
    except Exception:
        return None


def _extract_face_location_and_encoding(frame):
    if frame is None or frame.size == 0 or face_recognition is None:
        return None, None

    small_frame = cv2.resize(frame, (0, 0), fx=PROCESS_FRAME_SCALE, fy=PROCESS_FRAME_SCALE)
    rgb_small = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
    locations = face_recognition.face_locations(rgb_small, model=FACE_MODEL)
    if len(locations) != 1:
        return None, None

    top, right, bottom, left = locations[0]
    top = int(top / PROCESS_FRAME_SCALE)
    right = int(right / PROCESS_FRAME_SCALE)
    bottom = int(bottom / PROCESS_FRAME_SCALE)
    left = int(left / PROCESS_FRAME_SCALE)
    rgb_full = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    encodings = face_recognition.face_encodings(rgb_full, [(top, right, bottom, left)])
    if not encodings:
        return None, None
    return (top, right, bottom, left), [float(x) for x in encodings[0].tolist()]


def _record_attendance_for_names(names: list[str]) -> None:
    db = _load_attendance_db()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    workers = db.setdefault("workers", {})
    events = db.setdefault("events", [])

    for name in names:
        entry = workers.setdefault(name, {"attendance_count": 0, "last_marked_at": "-"})
        entry["attendance_count"] = int(entry.get("attendance_count", 0)) + 1
        entry["last_marked_at"] = now
        events.append({"name": name, "time": now, "source": "cnn-face-verification"})

    db["events"] = events[-300:]
    _save_attendance_db(db)


def _attendance_view_data() -> dict:
    encodings, known_names = _load_face_verification_data()
    db = _load_attendance_db()
    workers = []
    attendance_workers = db.get("workers", {})
    for name in sorted(set(known_names)):
        stats = attendance_workers.get(name, {})
        workers.append(
            {
                "worker_id": name,
                "name": name,
                "attendance_count": int(stats.get("attendance_count", 0)),
                "last_marked_at": stats.get("last_marked_at", "-"),
            }
        )

    events = sorted(db.get("events", []), key=lambda x: x.get("time", ""), reverse=True)

    return {
        "workers": workers,
        "events": events[:30],
        "registered_count": len(encodings),
    }


def _build_admin_dashboard_data() -> dict:
    db = _load_attendance_db()
    workers = db.get("workers", {})
    events = db.get("events", [])

    attendance_by_day: Counter[str] = Counter()
    source_counts: Counter[str] = Counter()
    for event in events:
        raw_time = str(event.get("time", ""))
        day_key = raw_time[:10] if len(raw_time) >= 10 else "Unknown"
        attendance_by_day[day_key] += 1
        source_counts[str(event.get("source", "unknown"))] += 1

    sorted_days = sorted(attendance_by_day.items(), key=lambda x: x[0])[-14:]
    trend_labels = [item[0] for item in sorted_days]
    trend_values = [item[1] for item in sorted_days]

    worker_rows = []
    for name, details in workers.items():
        worker_rows.append(
            {
                "name": name,
                "attendance_count": int(details.get("attendance_count", 0)),
                "last_marked_at": str(details.get("last_marked_at", "-")),
            }
        )
    worker_rows.sort(key=lambda x: x["attendance_count"], reverse=True)

    completed_jobs = 0
    active_jobs = 0
    failed_jobs = 0
    latest_analysis = None
    for _, job in JOBS.items():
        status = job.get("status")
        if status == "completed":
            completed_jobs += 1
            if job.get("analysis_result") is not None:
                latest_analysis = job.get("analysis_result")
        elif status in {"queued", "running"}:
            active_jobs += 1
        elif status == "error":
            failed_jobs += 1

    class_counts_labels = []
    class_counts_values = []
    risk_distribution = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
    latest_worker_summary = []

    if latest_analysis:
        for label, value in latest_analysis.get("class_counts", []):
            class_counts_labels.append(str(label))
            class_counts_values.append(int(value))

        for row in latest_analysis.get("worker_rows", []):
            risk_level = str(row.get("risk_level", "MEDIUM")).upper()
            if risk_level not in risk_distribution:
                risk_level = "MEDIUM"
            risk_distribution[risk_level] += 1
            latest_worker_summary.append(
                {
                    "worker": row.get("worker", "-"),
                    "missing_items": row.get("missing_items", "None"),
                    "frames_seen": row.get("frames_seen", 0),
                    "missing_events": row.get("missing_events", 0),
                    "detection_accuracy_percent": row.get("detection_accuracy_percent", "0.0"),
                }
            )

    return {
        "kpis": {
            "total_workers": len(workers),
            "attendance_events": len(events),
            "completed_jobs": completed_jobs,
            "active_jobs": active_jobs,
            "failed_jobs": failed_jobs,
            "downloadable_reports": len(DOWNLOADS),
        },
        "attendance_trend": {
            "labels": trend_labels,
            "values": trend_values,
        },
        "source_distribution": {
            "labels": list(source_counts.keys()),
            "values": [int(v) for v in source_counts.values()],
        },
        "class_counts": {
            "labels": class_counts_labels,
            "values": class_counts_values,
        },
        "risk_distribution": risk_distribution,
        "top_workers": worker_rows[:10],
        "latest_worker_summary": latest_worker_summary[:12],
    }


def _defaults() -> dict:
    return {
        "conf": 0.30,
        "iou": 0.45,
        "draw_points": True,
        "live_preview_stride": 3,
        "live_preview_width": 680,
        "stationary_seconds_threshold": 3,
        "late_arrivals_text": "",
        "absence_text": "",
        "recipient_email": "",
    }


def _parse_form() -> dict:
    def _get_float(name: str, fallback: float, lo: float, hi: float) -> float:
        try:
            value = float(request.form.get(name, fallback))
        except Exception:
            return fallback
        return max(lo, min(hi, value))

    def _get_int(name: str, fallback: int, lo: int, hi: int) -> int:
        try:
            value = int(request.form.get(name, fallback))
        except Exception:
            return fallback
        return max(lo, min(hi, value))

    return {
        "conf": _get_float("conf", 0.30, 0.05, 0.95),
        "iou": _get_float("iou", 0.45, 0.10, 0.90),
        "draw_points": bool(request.form.get("draw_points")),
        "live_preview_stride": _get_int("live_preview_stride", 3, 1, 30),
        "live_preview_width": _get_int("live_preview_width", 680, 480, 680),
        "stationary_seconds_threshold": _get_int("stationary_seconds_threshold", 3, 1, 30),
        "late_arrivals_text": request.form.get("late_arrivals_text", "").strip(),
        "absence_text": request.form.get("absence_text", "").strip(),
        "recipient_email": request.form.get("recipient_email", "").strip(),
    }


def _check_runtime() -> tuple[bool, str | None]:
    if not MODEL_PATH.exists():
        return False, f"Model not found at: {MODEL_PATH}"
    if DeepSort is None:
        return False, "DeepSORT dependency is missing. Install with: pip install deep-sort-realtime"
    return True, None


def _check_face_runtime() -> tuple[bool, str | None]:
    if face_recognition is None:
        return (
            False,
            "CNN face recognition dependency is missing. Install with: pip install face-recognition",
        )
    return True, None


def _run_detection_job(job_id: str, form: dict, video_path: str):
    job = JOBS.get(job_id)
    if not job:
        return

    try:
        model = load_model(str(MODEL_PATH))
        job["status"] = "running"

        def _progress_callback(frame_index: int, total_frames: int):
            with job["lock"]:
                job["frame_index"] = frame_index
                job["total_frames"] = total_frames

        def _preview_callback(frame, frame_worker_rows, preview_width: int):
            with job["lock"]:
                width = min(int(preview_width), 680)
                if frame is not None and frame.shape[1] > 0 and frame.shape[1] != width:
                    target_h = max(1, int(frame.shape[0] * (width / frame.shape[1])))
                    frame = cv2.resize(frame, (width, target_h), interpolation=cv2.INTER_AREA)
                ok, encoded = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
                if ok:
                    job["frame_jpeg"] = encoded.tobytes()
                job["live_workers"] = frame_worker_rows[:8] if frame_worker_rows else []

        (
            output_path,
            class_counts,
            missing_frames,
            max_people,
            frames_done,
            worker_rows,
            total_workers_tracked,
        ) = process_video(
            model=model,
            video_path=video_path,
            conf=form["conf"],
            iou=form["iou"],
            draw_points=form["draw_points"],
            live_preview_stride=form["live_preview_stride"],
            live_preview_width=form["live_preview_width"],
            stationary_seconds_threshold=form["stationary_seconds_threshold"],
            progress_callback=_progress_callback,
            preview_callback=_preview_callback,
        )

        late_arrivals_map = parse_worker_int_map(form["late_arrivals_text"])
        absence_map = parse_worker_int_map(form["absence_text"])
        safety_rows = compute_worker_safety_scores(worker_rows, late_arrivals_map, absence_map)

        safe_workers = [x for x in safety_rows if x["risk_level"] == "Low"][:5]
        risk_workers = [
            row
            for row in sorted(safety_rows, key=lambda r: (r["score"], -r["violations"]))
            if row["risk_level"] != "Low"
        ][:5]

        report_text = build_analysis_report(
            frames_done=frames_done,
            missing_frames=missing_frames,
            total_workers_tracked=total_workers_tracked,
            max_people=max_people,
            class_counts=class_counts,
            worker_rows=worker_rows,
            safety_rows=safety_rows,
        )

        auto_email_status = None
        recipient = form["recipient_email"]
        if recipient:
            try:
                send_result = send_report_via_emailjs(
                    recipient_email=recipient,
                    subject="PPE Video Analysis Report",
                    report_body=report_text,
                )
                auto_email_status = {
                    "ok": True,
                    "recipient": recipient,
                    "status_code": send_result["status_code"],
                    "body": send_result["body"],
                }
            except Exception as ex:
                auto_email_status = {
                    "ok": False,
                    "recipient": recipient,
                    "error": str(ex),
                }
        else:
            auto_email_status = {
                "ok": False,
                "recipient": "",
                "error": "Recipient Email was empty, so auto-send was skipped.",
            }

        download_id = uuid4().hex
        DOWNLOADS[download_id] = output_path

        analysis_result = {
            "download_id": download_id,
            "class_counts": sorted(class_counts.items(), key=lambda x: x[1], reverse=True),
            "missing_frames": missing_frames,
            "max_people": max_people,
            "total_workers_tracked": total_workers_tracked,
            "frames_done": frames_done,
            "worker_rows": worker_rows,
            "safe_workers": safe_workers,
            "risk_workers": risk_workers,
            "report_text": report_text,
            "auto_email_status": auto_email_status,
        }

        with job["lock"]:
            job["status"] = "completed"
            job["analysis_result"] = analysis_result
            job["frame_index"] = frames_done
    except Exception as ex:
        with job["lock"]:
            job["status"] = "error"
            job["error"] = str(ex)
    finally:
        try:
            if Path(video_path).exists():
                os.remove(video_path)
        except Exception:
            pass


@app.get("/")
def landing():
    ok, message = _check_runtime()
    return render_template(
        "landing.html",
        runtime_ok=ok,
        runtime_error=message,
    )


@app.get("/evaluation")
def evaluation():
    ok, message = _check_runtime()
    return render_template(
        "index.html",
        form=_defaults(),
        analysis_result=None,
        active_job_id=None,
        runtime_ok=ok,
        runtime_error=message,
    )


@app.get("/attendance")
def attendance_page():
    ok, message = _check_runtime()
    face_ok, face_message = _check_face_runtime()
    view_data = _attendance_view_data()
    return render_template(
        "attendance.html",
        runtime_ok=ok,
        runtime_error=message,
        face_runtime_ok=face_ok,
        face_runtime_error=face_message,
        workers=view_data["workers"],
        events=view_data["events"],
    )


@app.get("/admin")
def admin_dashboard():
    ok, message = _check_runtime()
    face_ok, face_message = _check_face_runtime()
    dashboard_data = _build_admin_dashboard_data()
    return render_template(
        "admin.html",
        runtime_ok=ok,
        runtime_error=message,
        face_runtime_ok=face_ok,
        face_runtime_error=face_message,
        dashboard_data=dashboard_data,
    )


@app.get("/attendence")
def attendance_page_alias():
    return redirect(url_for("attendance_page"))


@app.post("/attendance/register")
def attendance_register():
    face_ok, _ = _check_face_runtime()
    if not face_ok:
        flash("CNN attendance is unavailable. Install face-recognition first.", "error")
        return redirect(url_for("attendance_page"))

    worker_name = request.form.get("worker_name", "").strip()
    captured_image = request.form.get("captured_image", "").strip()

    if not worker_name:
        flash("Worker name is required for registration.", "error")
        return redirect(url_for("attendance_page"))

    frame = _decode_data_url_image(captured_image)
    if frame is None:
        flash("Capture a live photo for registration.", "error")
        return redirect(url_for("attendance_page"))

    face_location, face_encoding = _extract_face_location_and_encoding(frame)
    if face_location is None or face_encoding is None:
        flash("Please ensure exactly one clear face is visible.", "error")
        return redirect(url_for("attendance_page"))

    known_encodings, known_names = _load_face_verification_data()
    if known_encodings:
        distances = face_recognition.face_distance(np.array(known_encodings), np.array(face_encoding, dtype="float64"))
        if len(distances) > 0:
            best_idx = int(np.argmin(distances))
            if float(distances[best_idx]) <= FACE_MATCH_TOLERANCE:
                flash(f"This face is already registered as '{known_names[best_idx]}'.", "error")
                return redirect(url_for("attendance_page"))

    top, right, bottom, left = face_location
    crop = frame[max(0, top):max(0, bottom), max(0, left):max(0, right)]
    safe_name = secure_filename(worker_name) or f"worker_{uuid4().hex[:8]}"
    image_path = FACE_VERIFICATION_IMAGES_DIR / f"{safe_name}.jpg"
    cv2.imwrite(str(image_path), crop if crop.size > 0 else frame)

    known_encodings.append(face_encoding)
    known_names.append(worker_name)
    _save_face_verification_data(known_encodings, known_names)
    flash(f"Registered worker: {worker_name}", "success")

    return redirect(url_for("attendance_page"))


@app.post("/attendance/mark")
def attendance_mark():
    face_ok, _ = _check_face_runtime()
    if not face_ok:
        flash("CNN attendance is unavailable. Install face-recognition first.", "error")
        return redirect(url_for("attendance_page"))

    captured_image = request.form.get("captured_image", "").strip()
    known_encodings, known_names = _load_face_verification_data()
    if not known_encodings:
        flash("No workers registered yet. Register workers first.", "error")
        return redirect(url_for("attendance_page"))

    frame = _decode_data_url_image(captured_image)
    if frame is None:
        flash("Capture a live photo for attendance marking.", "error")
        return redirect(url_for("attendance_page"))

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb, model=FACE_MODEL)
    if not face_locations:
        flash("No face detected in captured frame.", "error")
        return redirect(url_for("attendance_page"))

    face_encodings = face_recognition.face_encodings(rgb, face_locations)
    recognized_names: set[str] = set()
    known_encodings_np = np.array(known_encodings, dtype="float64")

    for encoding in face_encodings:
        distances = face_recognition.face_distance(known_encodings_np, np.array(encoding, dtype="float64"))
        if len(distances) == 0:
            continue
        best_idx = int(np.argmin(distances))
        if float(distances[best_idx]) <= FACE_MATCH_TOLERANCE:
            recognized_names.add(known_names[best_idx])

    if not recognized_names:
        flash("No registered workers recognized in captured frame.", "error")
        return redirect(url_for("attendance_page"))

    name_list = sorted(recognized_names)
    _record_attendance_for_names(name_list)
    flash(f"Attendance marked for: {', '.join(name_list)}", "success")

    return redirect(url_for("attendance_page"))


@app.get("/attendance/sample/<worker_id>")
def attendance_sample_face(worker_id: str):
    safe_name = secure_filename(worker_id)
    sample_path = FACE_VERIFICATION_IMAGES_DIR / f"{safe_name}.jpg"
    if not sample_path.exists():
        return "Sample face not found", 404
    return send_file(sample_path, mimetype="image/jpeg")


@app.post("/analyze")
def analyze():
    form = _parse_form()
    ok, message = _check_runtime()
    if not ok:
        return render_template(
            "index.html",
            form=form,
            analysis_result=None,
            active_job_id=None,
            runtime_ok=False,
            runtime_error=message,
        )

    upload = request.files.get("video_file")
    if upload is None or not upload.filename:
        flash("Please upload an MP4 video before running detection.", "error")
        return render_template(
            "index.html",
            form=form,
            analysis_result=None,
            active_job_id=None,
            runtime_ok=True,
            runtime_error=None,
        )

    suffix = Path(upload.filename).suffix.lower()
    if suffix != ".mp4":
        flash("Only MP4 files are supported.", "error")
        return render_template(
            "index.html",
            form=form,
            analysis_result=None,
            active_job_id=None,
            runtime_ok=True,
            runtime_error=None,
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_input:
        upload.save(temp_input.name)
    job_id = uuid4().hex
    JOBS[job_id] = {
        "status": "queued",
        "frame_index": 0,
        "total_frames": 0,
        "frame_jpeg": None,
        "live_workers": [],
        "analysis_result": None,
        "error": None,
        "form": form,
        "lock": threading.Lock(),
    }

    thread = threading.Thread(
        target=_run_detection_job,
        args=(job_id, form, temp_input.name),
        daemon=True,
    )
    thread.start()

    return render_template(
        "index.html",
        form=form,
        analysis_result=None,
        active_job_id=job_id,
        runtime_ok=True,
        runtime_error=None,
    )


@app.get("/result/<job_id>")
def result(job_id: str):
    job = JOBS.get(job_id)
    ok, message = _check_runtime()
    if not job:
        flash("Result session not found. Please run detection again.", "error")
        return redirect(url_for("evaluation"))

    with job["lock"]:
        status = job["status"]
        error = job["error"]
        form = job["form"]
        analysis_result = job["analysis_result"]

    if status == "completed" and analysis_result is not None:
        return render_template(
            "index.html",
            form=form,
            analysis_result=analysis_result,
            active_job_id=None,
            runtime_ok=ok,
            runtime_error=message,
        )

    if status == "error":
        flash(f"Detection failed: {error}", "error")
        return render_template(
            "index.html",
            form=form,
            analysis_result=None,
            active_job_id=None,
            runtime_ok=ok,
            runtime_error=message,
        )

    return render_template(
        "index.html",
        form=form,
        analysis_result=None,
        active_job_id=job_id,
        runtime_ok=ok,
        runtime_error=message,
    )


@app.get("/status/<job_id>")
def job_status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        return jsonify({"status": "error", "error": "Job not found"}), 404

    with job["lock"]:
        frame_index = int(job["frame_index"])
        total_frames = int(job["total_frames"])
        status = job["status"]
        error = job["error"]
        live_workers = job["live_workers"]

    progress_pct = 0.0
    if total_frames > 0:
        progress_pct = max(0.0, min(100.0, (frame_index / total_frames) * 100.0))

    return jsonify(
        {
            "status": status,
            "frame_index": frame_index,
            "total_frames": total_frames,
            "progress_pct": round(progress_pct, 2),
            "live_workers": live_workers,
            "error": error,
            "result_url": url_for("result", job_id=job_id),
        }
    )


@app.get("/stream/<job_id>")
def stream_video(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        return "Job not found", 404

    def _generate_frames():
        last_sent = None
        idle_ticks = 0
        while True:
            with job["lock"]:
                frame_jpeg = job["frame_jpeg"]
                status = job["status"]

            if frame_jpeg and frame_jpeg != last_sent:
                last_sent = frame_jpeg
                idle_ticks = 0
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + frame_jpeg + b"\r\n"
                )
            else:
                idle_ticks += 1
                time.sleep(0.08)

            if status in {"completed", "error"} and idle_ticks > 20:
                break

    return Response(_generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")


@app.get("/download/<download_id>")
def download_video(download_id: str):
    output_path = DOWNLOADS.get(download_id)
    if not output_path or not Path(output_path).exists():
        flash("Annotated video was not found. Please run detection again.", "error")
        return redirect(url_for("evaluation"))

    return send_file(
        output_path,
        as_attachment=True,
        download_name="annotated_output.mp4",
        mimetype="video/mp4",
    )


@app.get("/video/<download_id>")
def view_video(download_id: str):
    output_path = DOWNLOADS.get(download_id)
    if not output_path or not Path(output_path).exists():
        flash("Annotated video was not found. Please run detection again.", "error")
        return redirect(url_for("evaluation"))

    return send_file(
        output_path,
        as_attachment=False,
        mimetype="video/mp4",
        conditional=True,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8501, debug=False)
