import os
from pathlib import Path

from dotenv import load_dotenv

APP_DIR = Path(__file__).resolve().parent.parent
load_dotenv(APP_DIR / ".env")

MODEL_PATH = APP_DIR / "yolov11.pt"
OUTPUT_VIDEO_PATH = APP_DIR / "output_annotated.mp4"

MISSING_PPE_LABELS = {
	"NO-Hardhat",
	"NO-Mask",
	"NO-Safety Vest",
	"NO-Safety Shoes",
	"NO-Shoes",
	"NO-Shoe",
	"No Safety Shoes",
	"No Shoes",
}
PERSON_LABELS = {"person", "Person"}

EMAILJS_PUBLIC_KEY = os.getenv("EMAILJS_PUBLIC_KEY", "")
EMAILJS_PRIVATE_KEY = os.getenv("EMAILJS_PRIVATE_KEY", "")
EMAILJS_SERVICE_ID = os.getenv("EMAILJS_SERVICE_ID", "")
EMAILJS_TEMPLATE_ID = os.getenv("EMAILJS_TEMPLATE_ID", "")
EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send"
