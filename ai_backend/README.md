# PPE Video Detection App (YOLOv11 + DeepSORT)

This project is now a Flask web app with an HTML/CSS/JS frontend that analyzes uploaded MP4 videos to detect workers and PPE violations using a trained YOLOv11 model and DeepSORT tracking.

## Features

- Upload an MP4 video and run frame-by-frame detection
- Detects people and PPE-related classes from your trained model
- Tracks workers across frames with stable IDs (`Worker-<id>`)
- Highlights missing PPE conditions (`NO-Hardhat`, `NO-Mask`, `NO-Safety Vest`)
- Live preview during processing
- Summary metrics and per-worker violation history
- Generates a full text report after analysis
- Sends the generated report to any user-provided email via EmailJS
- Download annotated output video

## Project Structure

- `app.py`: Flask backend + routes
- `requirements.txt`: Python dependencies
- `yolov11.pt`: YOLO model weights (required at runtime)
- `templates/index.html`: frontend page markup
- `static/css/styles.css`: frontend styles
- `static/js/app.js`: frontend interactions
- `output_annotated.mp4`: Generated processed video (created/overwritten by app)
- `ppe_app/`: Application package
  - `config.py`: constants and paths
  - `ui.py`: Streamlit UI and flow orchestration
  - `video_processing.py`: YOLO + DeepSORT frame pipeline
  - `model.py`: model loading and class-name mapping
  - `reporting.py`: report generation logic
  - `email_service.py`: EmailJS API integration
  - `drawing.py`: OpenCV text/box drawing helpers
  - `geometry.py`: bbox geometry helpers

### Module Tree

```text
WEB_UI/
  app.py
  requirements.txt
  yolov11.pt
  ppe_app/
    __init__.py
    config.py
    ui.py
    video_processing.py
    model.py
    reporting.py
    email_service.py
    drawing.py
    geometry.py
```

## Requirements

- Python 3.10+ recommended
- A valid model weights file named `yolov11.pt` in the project root

Install dependencies:

```powershell
pip install -r requirements.txt
```

## Run the App

From the project folder, start Flask:

```powershell
python app.py
```

Then open `http://localhost:8501`.

## How It Works

1. The app loads `yolov11.pt` once using Streamlit resource caching.
2. User uploads an MP4 file.
3. For each frame:
   - YOLO predicts bounding boxes and class labels.
   - Detections are split into:
     - person labels (`person`, `Person`)
     - missing PPE labels (`NO-Hardhat`, `NO-Mask`, `NO-Safety Vest`)
     - other objects
   - DeepSORT tracks detected persons over time.
   - Missing PPE boxes are assigned to workers using center-point-in-bbox matching.
   - The frame is annotated and written to output video.
4. Final metrics and tables are shown in UI.

## Code Organization

The project is intentionally split by responsibility:

- UI + user actions in `ppe_app/ui.py`
- Video inference and tracking in `ppe_app/video_processing.py`
- Pure helpers/utilities in separate modules (`drawing.py`, `geometry.py`, `model.py`)
- Reporting and email communication isolated in `reporting.py` and `email_service.py`

This structure keeps features easier to maintain, test, and extend.

## Refactor Note

The codebase was refactored from a single-file app into a modular package. The runtime behavior remains the same, but responsibilities are now split into focused modules and integrated through `ppe_app/ui.py`.

## Output in UI

- Processed Frames
- Frames With Missing PPE
- Max People In A Frame
- Detected Class Counts table
- Worker Missing Equipment Summary table
- Generated Analysis Report preview
- Send Report Email action (EmailJS)
- Download button for annotated MP4

## Frontend Features and Fields

The redesigned frontend keeps the existing functional fields:

- Inference settings:
  - Confidence Threshold
  - IOU Threshold
  - Draw Center Points
  - Live Preview Every N Frames
  - Live Preview Width
  - Stationary Worker Threshold (seconds)
- Safety score inputs:
  - Late Arrivals (Worker=count)
  - Absence (Worker=count)
- Email report settings:
  - Recipient Email
- Video input:
  - Upload MP4
  - Run Detection button

Result sections shown after run:

- Processed Frames
- Frames With Missing PPE
- Total Workers Tracked
- Peak People In Frame
- Detected Class Counts
- Worker Missing Equipment Summary
- Worker Safety Insights (Top Safe Workers / Workers At Risk)
- Generated Analysis Report
- Email Delivery Status
- Download Annotated Video

## Email Report (EmailJS)

After processing is complete, the app generates a detailed report and can email it.

In the sidebar, provide:

- Recipient Email

Then click **Send Report Email**.

EmailJS credentials are configured in backend config (`ppe_app/config.py`) and environment variables:

- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_PRIVATE_KEY`
- `EMAILJS_SERVICE_ID` (from environment variable)
- `EMAILJS_TEMPLATE_ID` (from environment variable)

Windows (PowerShell) example before running app:

```powershell
$env:EMAILJS_SERVICE_ID="service_xxxxx"
$env:EMAILJS_TEMPLATE_ID="template_xxxxx"
streamlit run app.py
```

EmailJS template parameters used by the app:

- `to_email`
- `to_name`
- `subject`
- `message`

Make sure your EmailJS template contains matching variables.

## Notes and Limitations

- Worker-to-PPE matching is geometry-based and may be less accurate in crowded scenes.
- `class_counts` are per-frame detection counts, not unique object counts.
- Output file name is fixed (`output_annotated.mp4`) and gets overwritten each run.
- The uploaded temp video file is created during processing.

## Troubleshooting

### Model file not found
If the app shows model missing, ensure `yolov11.pt` exists in the project root.

### DeepSORT missing
Install dependency:

```powershell
pip install deep-sort-realtime
```

### Video not opening
Use a valid MP4 file and verify codec compatibility.

## Dependency List

From `requirements.txt`:

- streamlit>=1.37.0
- ultralytics>=8.3.0
- opencv-python>=4.10.0
- numpy>=1.26.0
- torch>=2.4.0
- deep-sort-realtime>=1.3.2
- requests>=2.32.0
