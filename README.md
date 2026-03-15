# ConSafe

ConSafe is an AI-powered construction safety platform for PPE compliance analytics and worker attendance monitoring.

It includes:
- A Python backend for computer-vision analysis and reporting
- A Next.js frontend for dashboards, protected workflows, and admin operations

## Features

- PPE compliance video analysis using YOLO and tracking
- Worker attendance and face-verification workflows
- Safety scoring and worker risk insights
- Role-oriented frontend modules for admin, workers, attendance, PPE, and reports
- Email report delivery via environment-configured EmailJS credentials
- Health and analysis API routes in the frontend app

## Tech Stack

### Backend
- Python 3
- Flask
- Streamlit
- Ultralytics YOLO
- OpenCV
- PyTorch
- DeepSORT (deep-sort-realtime)

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Zustand
- React Query
- PNPM

## Repository Structure

```text
ConSafe/
|-- ai_backend/
|   |-- app.py
|   |-- requirements.txt
|   |-- requirements.core.txt
|   |-- .env.example
|   |-- ppe_app/
|   |-- templates/
|   |-- static/
|   |-- Face Verification/
|
|-- frontend/
|   |-- frontend/
|       |-- app/
|       |-- components/
|       |-- api/
|       |-- hooks/
|       |-- store/
|       |-- package.json
|       |-- pnpm-lock.yaml
|
|-- .github/workflows/ci.yml
|-- docs/screenshots/
|-- .gitignore
|-- LICENSE
|-- README.md
```

## Prerequisites

- Python 3.10+
- Node.js 20+
- PNPM

## Installation

### 1. Clone

```bash
git clone https://github.com/Ayush-Chugani/Consafe.git
cd Consafe
```

### 2. Backend Setup

```bash
cd ai_backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Update values in `.env` before running.

### 3. Frontend Setup

```bash
cd ..\frontend\frontend
pnpm install
copy .env.example .env.local
```

## Run the Project

### Start Backend

```bash
cd ai_backend
# activate virtual env first
python app.py
```

### Start Frontend

```bash
cd frontend\frontend
pnpm dev
```

Frontend default URL is typically `http://localhost:3000`.

## Files You Should Commit

- Source code in `ai_backend/` and `frontend/frontend/`
- Dependency manifests:
  - `ai_backend/requirements.txt`
  - `ai_backend/requirements.core.txt`
  - `frontend/frontend/package.json`
  - `frontend/frontend/pnpm-lock.yaml`
- Framework/config files:
  - `frontend/frontend/tsconfig.json`
  - `frontend/frontend/next.config.mjs`
  - `frontend/frontend/postcss.config.mjs`
  - `frontend/frontend/components.json`
- Documentation:
  - `README.md`
  - module-specific READMEs
- Safe env templates:
  - `ai_backend/.env.example`
  - `frontend/frontend/.env.example`

## Contribution Guidelines

1. Create a branch from `main`.
2. Keep commits focused and descriptive.
3. Run checks before opening a PR.
4. Do not commit secrets or generated artifacts.
5. Open a PR with clear test notes.

## License

This project is licensed under the MIT License. See `LICENSE`.

## Security Notes

- Never commit `.env` files with real credentials.
- Rotate any leaked or previously committed key.
- Use `.env.example` templates for sharing configuration.
- Avoid committing biometric image datasets or generated attendance backups.
