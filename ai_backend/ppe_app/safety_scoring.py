def parse_worker_int_map(raw_text: str) -> dict:
    values = {}
    if not raw_text or not raw_text.strip():
        return values

    for chunk in raw_text.split(","):
        part = chunk.strip()
        if not part:
            continue
        if "=" not in part:
            continue

        worker, count_raw = part.split("=", 1)
        worker_name = worker.strip()
        try:
            count = max(0, int(count_raw.strip()))
        except ValueError:
            continue

        if worker_name:
            values[worker_name] = count

    return values


def compute_worker_safety_scores(worker_rows: list, late_arrivals_map: dict, absence_map: dict) -> list:
    safety_rows = []
    for row in worker_rows:
        worker = row["worker"]
        violations = int(row.get("missing_events", 0))
        frames_seen = max(1, int(row.get("frames_seen", 0)))
        late_arrivals = int(late_arrivals_map.get(worker, 0))
        absence = int(absence_map.get(worker, 0))

        compliance_rate = max(0.0, (frames_seen - violations) / frames_seen)
        compliance_bonus = round(compliance_rate * 10.0, 2)

        raw_score = 100 - (violations * 3) - (late_arrivals * 2) - (absence * 5) + compliance_bonus
        score = round(max(0.0, min(100.0, raw_score)), 2)

        if score >= 85:
            risk_level = "Low"
        elif score >= 70:
            risk_level = "Medium"
        else:
            risk_level = "High"

        safety_rows.append(
            {
                "worker": worker,
                "score": score,
                "violations": violations,
                "late_arrivals": late_arrivals,
                "absence": absence,
                "compliance_bonus": compliance_bonus,
                "risk_level": risk_level,
            }
        )

    safety_rows.sort(key=lambda x: (-x["score"], x["violations"], x["worker"]))
    return safety_rows
