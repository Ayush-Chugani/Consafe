from datetime import datetime

import requests

from ppe_app.config import (
    EMAILJS_API_URL,
    EMAILJS_PRIVATE_KEY,
    EMAILJS_PUBLIC_KEY,
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
)


def send_report_via_emailjs(
    *,
    recipient_email: str,
    subject: str,
    report_body: str,
):
    if not EMAILJS_SERVICE_ID or not EMAILJS_TEMPLATE_ID:
        raise RuntimeError("EmailJS service/template is not configured in environment.")

    payload = {
        "service_id": EMAILJS_SERVICE_ID,
        "template_id": EMAILJS_TEMPLATE_ID,
        "user_id": EMAILJS_PUBLIC_KEY,
        "accessToken": EMAILJS_PRIVATE_KEY,
        "template_params": {
            "title": subject,
            "name": "PPE Video Detector",
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "to_email": recipient_email,
            "to_name": recipient_email,
            "email": recipient_email,
            "user_email": recipient_email,
            "reply_to": recipient_email,
            "from_name": "PPE Video Detector",
            "subject": subject,
            "message": report_body,
        },
    }
    response = requests.post(EMAILJS_API_URL, json=payload, timeout=20)
    if response.status_code not in (200, 201):
        raise RuntimeError(
            f"EmailJS send failed with status {response.status_code}: {response.text.strip()}"
        )
    return {
        "status_code": response.status_code,
        "body": response.text.strip() or "OK",
    }
