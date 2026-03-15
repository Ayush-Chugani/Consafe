import cv2
from uuid import uuid4

from ppe_app.config import MISSING_PPE_LABELS, OUTPUT_VIDEO_PATH, PERSON_LABELS
from ppe_app.drawing import draw_label_with_bg
from ppe_app.geometry import center_of_bbox, point_in_bbox
from ppe_app.model import class_name

try:
    from deep_sort_realtime.deepsort_tracker import DeepSort
except Exception:
    DeepSort = None


def _normalize_label(label: str) -> str:
    return "".join(ch for ch in str(label).lower() if ch.isalnum())


NORM_PERSON_LABELS = {_normalize_label(x) for x in PERSON_LABELS}
NORM_MISSING_PPE_LABELS = {_normalize_label(x) for x in MISSING_PPE_LABELS}


def _clean_missing_label(label: str) -> str:
    return label.replace("NO-", "")


def _frame_font_scale(frame_width: int) -> float:
    # Keep labels readable across low/high resolutions.
    return max(0.48, min(0.72, frame_width / 1700.0))


def _sanitize_fps(raw_fps: float) -> float:
    # Some videos report invalid/very low FPS values; clamp to a realistic playback range.
    if raw_fps is None or raw_fps <= 1.0 or raw_fps > 120.0:
        return 30.0
    return max(15.0, min(60.0, float(raw_fps)))


def _build_output_path() -> str:
    suffix = uuid4().hex[:8]
    return str(OUTPUT_VIDEO_PATH.with_name(f"output_annotated_{suffix}.mp4"))


def _frame_to_4_by_3(frame):
    target_ratio = 4.0 / 3.0
    h, w = frame.shape[:2]
    if h <= 0 or w <= 0:
        return frame

    current_ratio = w / float(h)
    if abs(current_ratio - target_ratio) < 1e-3:
        return frame

    if current_ratio > target_ratio:
        # Too wide: add top/bottom letterbox.
        target_h = int(round(w / target_ratio))
        pad_total = max(0, target_h - h)
        pad_top = pad_total // 2
        pad_bottom = pad_total - pad_top
        return cv2.copyMakeBorder(frame, pad_top, pad_bottom, 0, 0, cv2.BORDER_CONSTANT, value=(0, 0, 0))

    # Too tall: add left/right letterbox.
    target_w = int(round(h * target_ratio))
    pad_total = max(0, target_w - w)
    pad_left = pad_total // 2
    pad_right = pad_total - pad_left
    return cv2.copyMakeBorder(frame, 0, 0, pad_left, pad_right, cv2.BORDER_CONSTANT, value=(0, 0, 0))


def _is_stationary(prev_center, current_center, tolerance_px: int = 4) -> bool:
    if prev_center is None or current_center is None:
        return False
    dx = abs(int(current_center[0]) - int(prev_center[0]))
    dy = abs(int(current_center[1]) - int(prev_center[1]))
    return dx <= tolerance_px and dy <= tolerance_px


def process_video(
    model,
    video_path: str,
    conf: float,
    iou: float,
    draw_points: bool,
    live_preview_stride: int,
    live_preview_width: int,
    stationary_seconds_threshold: int,
    progress_callback=None,
    preview_callback=None,
):
    if DeepSort is None:
        raise RuntimeError("DeepSORT dependency is missing. Install with: pip install deep-sort-realtime")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError("Unable to open uploaded video file.")

    fps = _sanitize_fps(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    output_path = _build_output_path()
    writer = cv2.VideoWriter(
        output_path,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height),
    )
    if not writer.isOpened():
        raise RuntimeError("Unable to initialize output video writer.")

    class_counts = {}
    frames_with_missing_ppe = 0
    max_people_in_frame = 0
    worker_missing_history = {}

    tracker = DeepSort(max_age=30, n_init=3, nms_max_overlap=1.0, max_cosine_distance=0.2)
    stationary_threshold_frames = max(1, int(round(float(stationary_seconds_threshold) * fps)))

    frame_index = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break

        label_font_scale = _frame_font_scale(frame.shape[1])
        worker_msg_font_scale = max(0.46, label_font_scale - 0.06)

        results = model.predict(frame, conf=conf, iou=iou, verbose=False)
        result = results[0]

        missing_found = False
        person_boxes = []
        missing_boxes = []
        object_boxes = []

        if result.boxes is not None:
            for box in result.boxes:
                cls_id = int(box.cls.item())
                score = float(box.conf.item())
                label = class_name(model, cls_id)
                label_norm = _normalize_label(label)
                class_counts[label] = class_counts.get(label, 0) + 1
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                bbox = (x1, y1, x2, y2)

                if label_norm in NORM_PERSON_LABELS:
                    person_boxes.append((bbox, score, label))
                elif label_norm in NORM_MISSING_PPE_LABELS:
                    missing_boxes.append((bbox, score, label))
                else:
                    object_boxes.append((bbox, score, label))

        people_in_frame = 0

        det_for_tracker = []
        for bbox, score, _ in person_boxes:
            x1, y1, x2, y2 = bbox
            w = max(1, x2 - x1)
            h = max(1, y2 - y1)
            det_for_tracker.append(([x1, y1, w, h], score, "person"))

        active_tracks = tracker.update_tracks(det_for_tracker, frame=frame)
        confirmed_tracks = [trk for trk in active_tracks if trk.is_confirmed()]
        people_in_frame = len(confirmed_tracks)
        max_people_in_frame = max(max_people_in_frame, people_in_frame)

        frame_worker_rows = []
        for trk in confirmed_tracks:

            track_id = int(trk.track_id)
            x1, y1, x2, y2 = map(int, trk.to_ltrb())
            x1 = max(0, x1)
            y1 = max(0, y1)
            x2 = min(frame.shape[1] - 1, x2)
            y2 = min(frame.shape[0] - 1, y2)
            bbox = (x1, y1, x2, y2)
            score = 1.0

            current_missing = set()
            for mbox, _, mlabel in missing_boxes:
                mcx, mcy = center_of_bbox(mbox)
                if point_in_bbox((mcx, mcy), bbox):
                    current_missing.add(mlabel)

            history = worker_missing_history.get(
                track_id,
                {
                    "worker": f"Worker-{track_id}",
                    "missing_items_set": set(),
                    "frames_seen": 0,
                    "missing_events": 0,
                    "last_center": None,
                    "stationary_run_frames": 0,
                    "stationary_hits": 0,
                    "accuracy_percent": 100,
                    "accuracy_note": "Normal",
                },
            )
            history["frames_seen"] += 1

            center_point = center_of_bbox(bbox)
            is_stationary = _is_stationary(history["last_center"], center_point, tolerance_px=4)
            if is_stationary:
                history["stationary_run_frames"] += 1
            else:
                history["stationary_run_frames"] = 0
            history["last_center"] = center_point

            if (
                history["stationary_run_frames"] > 0
                and history["stationary_run_frames"] % stationary_threshold_frames == 0
            ):
                penalty = 15 if history["stationary_hits"] == 0 else 10
                history["accuracy_percent"] = max(0, int(history["accuracy_percent"]) - penalty)
                history["stationary_hits"] += 1
                history["accuracy_note"] = (
                    f"Reduced by stationary rule (hits={history['stationary_hits']}, "
                    f"threshold={stationary_seconds_threshold}s)"
                )

            if current_missing:
                missing_found = True
                history["missing_items_set"].update(current_missing)
                history["missing_events"] += 1

            worker_missing_history[track_id] = history

            color = (0, 0, 255) if current_missing else (0, 255, 0)
            tag = f"Worker-{track_id}"
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            draw_label_with_bg(
                frame,
                tag,
                (x1, max(y1 - 2, 14)),
                text_color=(255, 255, 255),
                bg_color=color,
                font_scale=label_font_scale,
                thickness=1,
            )

            if current_missing:
                clean_items = sorted(_clean_missing_label(item) for item in current_missing)
                msg = "PPE: " + ", ".join(clean_items)
                draw_label_with_bg(
                    frame,
                    msg,
                    (x1, min(y2 + 18, frame.shape[0] - 5)),
                    text_color=(255, 255, 255),
                    bg_color=(0, 0, 255),
                    font_scale=worker_msg_font_scale,
                    thickness=1,
                )

            if draw_points:
                cx, cy = center_of_bbox(bbox)
                cv2.circle(frame, (cx, cy), 4, color, -1)

            frame_worker_rows.append(
                {
                    "Worker": f"Worker-{track_id}",
                    "Missing in Frame": ", ".join(sorted(current_missing)) if current_missing else "None",
                }
            )

        for bbox, score, label in missing_boxes:
            x1, y1, x2, y2 = bbox
            # Draw missing PPE regions without extra text to avoid duplicate clutter.
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 1)

        for bbox, score, label in object_boxes:
            x1, y1, x2, y2 = bbox
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 0), 2)
            draw_label_with_bg(
                frame,
                f"{label} {score:.2f}",
                (x1, max(y1 - 2, 14)),
                text_color=(0, 0, 0),
                bg_color=(255, 255, 0),
                font_scale=worker_msg_font_scale,
                thickness=1,
            )
            if draw_points:
                cx, cy = center_of_bbox(bbox)
                cv2.circle(frame, (cx, cy), 4, (255, 255, 0), -1)

        if missing_found:
            frames_with_missing_ppe += 1

        overlay = f"People: {people_in_frame} | Missing PPE in frame: {'YES' if missing_found else 'NO'}"
        draw_label_with_bg(
            frame,
            overlay,
            (10, 28),
            text_color=(255, 255, 255),
            bg_color=(25, 25, 25),
            font_scale=label_font_scale,
            thickness=1,
        )

        writer.write(frame)
        frame_index += 1

        if preview_callback and frame_index % max(1, live_preview_stride) == 0:
            preview_width = min(int(live_preview_width), 680)
            preview_frame = _frame_to_4_by_3(frame)
            preview_callback(preview_frame, frame_worker_rows, preview_width)

        if progress_callback:
            progress_callback(frame_index, total_frames)

    cap.release()
    writer.release()
    worker_rows = []
    for track_id in sorted(worker_missing_history.keys()):
        row = worker_missing_history[track_id]
        worker_rows.append(
            {
                "worker": row["worker"],
                "missing_items": ", ".join(sorted(row["missing_items_set"])) if row["missing_items_set"] else "None",
                "frames_seen": row["frames_seen"],
                "missing_events": row["missing_events"],
                    "detection_accuracy_percent": row["accuracy_percent"],
                    "accuracy_note": row["accuracy_note"],
            }
        )

    total_workers_tracked = len(worker_rows)
    return (
        output_path,
        class_counts,
        frames_with_missing_ppe,
        max_people_in_frame,
        frame_index,
        worker_rows,
        total_workers_tracked,
    )
