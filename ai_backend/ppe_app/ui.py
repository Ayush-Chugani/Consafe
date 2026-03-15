import tempfile

import pandas as pd
import streamlit as st

from ppe_app.config import MODEL_PATH
from ppe_app.email_service import send_report_via_emailjs
from ppe_app.model import load_model
from ppe_app.reporting import build_analysis_report
from ppe_app.safety_scoring import compute_worker_safety_scores, parse_worker_int_map
from ppe_app.video_processing import DeepSort, process_video


def run_app():
    st.set_page_config(page_title="PPE Video Detector", layout="wide")
    st.title("PPE + Person Video Detection")
    st.write("Upload an MP4 file to detect people and PPE classes using your trained YOLOv11 model.")

    if "analysis_result" not in st.session_state:
        st.session_state["analysis_result"] = None

    if not MODEL_PATH.exists():
        st.error(f"Model not found at: {MODEL_PATH}")
        st.stop()

    if DeepSort is None:
        st.error("DeepSORT dependency is missing. Install with: pip install deep-sort-realtime")
        st.stop()

    model = load_model(str(MODEL_PATH))

    with st.sidebar:
        st.header("Inference Settings")
        conf = st.slider("Confidence Threshold", min_value=0.05, max_value=0.95, value=0.30, step=0.05)
        iou = st.slider("IOU Threshold", min_value=0.10, max_value=0.90, value=0.45, step=0.05)
        draw_points = st.checkbox("Draw Center Points", value=True)
        live_preview_stride = st.slider("Live Preview Every N Frames", min_value=1, max_value=30, value=3, step=1)
        live_preview_width = st.slider("Live Preview Width", min_value=480, max_value=680, value=680, step=20)
        stationary_seconds_threshold = st.number_input(
            "Stationary Worker Threshold (seconds)",
            min_value=1,
            max_value=30,
            value=3,
            step=1,
            help="If worker coordinates stay exactly same longer than this, detection accuracy becomes 85%.",
        )
        st.header("Safety Score Inputs")
        late_arrivals_text = st.text_input(
            "Late Arrivals (Worker=count)",
            placeholder="Worker-1=1, Worker-2=0",
        )
        absence_text = st.text_input(
            "Absence (Worker=count)",
            placeholder="Worker-1=0, Worker-2=1",
        )
        st.header("Email Report Settings")
        recipient_email = st.text_input("Recipient Email", placeholder="user@example.com")

    upload = st.file_uploader("Upload MP4", type=["mp4"])

    if upload is not None:
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        temp_input.write(upload.read())
        temp_input.flush()

        if st.button("Run Detection", type="primary"):
            with st.spinner("Running detection on video..."):
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
                    video_path=temp_input.name,
                    conf=conf,
                    iou=iou,
                    draw_points=draw_points,
                    live_preview_stride=live_preview_stride,
                    live_preview_width=live_preview_width,
                    stationary_seconds_threshold=int(stationary_seconds_threshold),
                )

            late_arrivals_map = parse_worker_int_map(late_arrivals_text)
            absence_map = parse_worker_int_map(absence_text)
            safety_rows = compute_worker_safety_scores(worker_rows, late_arrivals_map, absence_map)

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
            recipient = recipient_email.strip()
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

            st.session_state["analysis_result"] = {
                "output_path": output_path,
                "class_counts": class_counts,
                "missing_frames": missing_frames,
                "max_people": max_people,
                "total_workers_tracked": total_workers_tracked,
                "frames_done": frames_done,
                "worker_rows": worker_rows,
                "safety_rows": safety_rows,
                "report_text": report_text,
                "auto_email_status": auto_email_status,
            }

    analysis_result = st.session_state.get("analysis_result")
    if analysis_result:
        output_path = analysis_result["output_path"]
        class_counts = analysis_result["class_counts"]
        missing_frames = analysis_result["missing_frames"]
        max_people = analysis_result["max_people"]
        total_workers_tracked = analysis_result["total_workers_tracked"]
        frames_done = analysis_result["frames_done"]
        worker_rows = analysis_result["worker_rows"]
        safety_rows = analysis_result["safety_rows"]
        report_text = analysis_result["report_text"]
        auto_email_status = analysis_result.get("auto_email_status")

        st.success("Detection complete")

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Processed Frames", frames_done)
        c2.metric("Frames With Missing PPE", missing_frames)
        c3.metric("Total Workers Tracked", total_workers_tracked)
        c4.metric("Peak People In Frame", max_people)

        st.subheader("Worker Missing Equipment Summary")
        if worker_rows:
            st.table(worker_rows)
        else:
            st.info("No workers were tracked in this video.")

        st.subheader("Worker Safety Insights")
        if safety_rows:
            safe_workers = [x for x in safety_rows if x["risk_level"] == "Low"][:5]
            risk_workers = [
                row
                for row in sorted(safety_rows, key=lambda r: (r["score"], -r["violations"]))
                if row["risk_level"] != "Low"
            ][:5]

            def _format_safety_rows(rows):
                return [
                    {
                        "worker": row["worker"],
                        "score": row["score"],
                        "compliance_bonus": row["compliance_bonus"],
                        "risk_level": row["risk_level"],
                    }
                    for row in rows
                ]

            def _display_with_one_based_index(rows):
                df = pd.DataFrame(rows)
                df.index = range(1, len(df) + 1)
                st.table(df)

            s_col, r_col = st.columns(2)
            with s_col:
                st.markdown("**Top Safe Workers**")
                if safe_workers:
                    _display_with_one_based_index(_format_safety_rows(safe_workers))
                else:
                    st.info("No low-risk workers identified.")
            with r_col:
                st.markdown("**Workers At Risk**")
                if risk_workers:
                    _display_with_one_based_index(_format_safety_rows(risk_workers))
                else:
                    st.info("No at-risk workers identified.")
        else:
            st.info("No worker safety scores available.")

        st.subheader("Generated Analysis Report")
        st.text_area("Report Preview", report_text, height=280)

        st.subheader("Email Delivery Status")
        if auto_email_status and auto_email_status.get("ok"):
            st.success(
                f"Auto-send accepted for {auto_email_status['recipient']} "
                f"(status={auto_email_status['status_code']}, body={auto_email_status['body']})."
            )
            st.info(
                "If recipient still does not receive the email, check Spam/Promotions folders and EmailJS delivery logs "
                "for bounce/blocked reasons."
            )
        elif auto_email_status:
            st.error(f"Auto-send failed: {auto_email_status.get('error', 'Unknown error')}")

        with open(output_path, "rb") as file_obj:
            st.download_button(
                "Download Annotated Video",
                data=file_obj.read(),
                file_name="annotated_output.mp4",
                mime="video/mp4",
            )
