from datetime import datetime


def build_analysis_report(
    frames_done: int,
    missing_frames: int,
    total_workers_tracked: int,
    max_people: int,
    class_counts: dict,
    worker_rows: list,
    safety_rows: list,
) -> str:
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    missing_ratio = (missing_frames / frames_done * 100.0) if frames_done > 0 else 0.0

    lines = [
        "PPE Video Analysis Report",
        "=" * 28,
        f"Generated At: {generated_at}",
        "",
        "Summary Metrics",
        "-" * 15,
        f"Processed Frames: {frames_done}",
        f"Frames With Missing PPE: {missing_frames}",
        f"Missing PPE Frame Ratio: {missing_ratio:.2f}%",
        f"Total Workers Tracked (Unique): {total_workers_tracked}",
        f"Peak People In Frame (Confirmed): {max_people}",
        "",
        "Detected Class Counts",
        "-" * 21,
    ]

    if class_counts:
        for label, count in sorted(class_counts.items(), key=lambda x: x[1], reverse=True):
            lines.append(f"- {label}: {count}")
    else:
        lines.append("- No classes detected")

    lines.extend(["", "Worker Missing Equipment Summary", "-" * 32])
    if worker_rows:
        for row in worker_rows:
            lines.append(
                f"- {row['worker']}: missing_items={row['missing_items']}, "
                f"frames_seen={row['frames_seen']}, missing_events={row['missing_events']}, "
                f"detection_accuracy_percent={row.get('detection_accuracy_percent', 100)}, "
                f"accuracy_note={row.get('accuracy_note', 'Normal')}"
            )
    else:
        lines.append("- No workers were tracked")

    lines.extend(["", "Worker Safety Score Ranking", "-" * 28])
    if safety_rows:
        for row in safety_rows:
            lines.append(
                f"- {row['worker']}: score={row['score']}, violations={row['violations']}, "
                f"late_arrivals={row['late_arrivals']}, absence={row['absence']}, "
                f"compliance_bonus={row['compliance_bonus']}, risk={row['risk_level']}"
            )
    else:
        lines.append("- No safety score data available")

    return "\n".join(lines)
