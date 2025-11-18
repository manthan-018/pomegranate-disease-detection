# PomoCare – Smart Fruit Health System

PomoCare is an interactive web application that detects pomegranate fruit diseases using a deep-learning image classifier. Farmers can upload fruit images, receive real-time predictions with confidence scores, and read actionable guidance tailored to each disease category.

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Project Structure](#project-structure)  
4. [Prerequisites](#prerequisites)  
5. [Local Development](#local-development)  
6. [Environment Variables](#environment-variables)  
7. [Key Routes & APIs](#key-routes--apis)  
8. [Deployment (Render)](#deployment-render)  
9. [Dataset & Model](#dataset--model)  
10. [Contributing](#contributing)

---

## Features

- 🌱 **AI-powered classification** of five pomegranate fruit conditions (Alternaria, Anthracnose, Bacterial Blight, Cercospora, Healthy).  
- 📸 **Drag‑and‑drop uploader** with square preview, animations, and real-time feedback.  
- 📊 **Confidence breakdown** plus disease-specific educational content (≈20 lines per disease).  
- 🔐 **Authentication & admin tools** with SQLAlchemy-backed user storage and secure password hashing.  
- ⚙️ **Render-ready deployment** via `render.yaml`, `Procfile`, `requirements.txt`, and deployment docs.

## Tech Stack

- **Backend:** Flask, SQLAlchemy, TensorFlow/Keras, Gunicorn  
- **Frontend:** HTML5, modern CSS, vanilla JavaScript  
- **Database:** SQLite (via SQLAlchemy; easily swappable)  
- **Auth & Security:** Werkzeug password hashing, session cookies, admin-token gated export  
- **Deployment:** Render Blueprint (`render.yaml`) + gunicorn web process

## Project Structure

```
project01/
├── app.py                # Flask application & API endpoints
├── requirements.txt      # Python dependencies (incl. gunicorn for deployment)
├── Procfile              # Render/Heroku-style process definition
├── render.yaml           # Render Blueprint configuration
├── RENDER_DEPLOYMENT.md  # Detailed steps for going live on Render
├── templates/            # Jinja2 HTML templates (login, register, admin, main UI)
├── static/
│   ├── css/style.css     # Farmer-themed styling + responsive layout
│   └── js/
│       ├── app.js        # Frontend logic for uploads & predictions
│       └── auth.js       # Auth forms, admin JSON viewer, clipboard helpers
├── dataset_of_img1/      # Sample dataset folders (Alternaria/Anthracnose/…/Healthy)
├── fruit_health_model.*  # Pretrained TensorFlow models (.keras / .h5)
└── users.db              # SQLite database (auto-created in production)
```

## Prerequisites

- Python **3.10+**  
- Pip / virtual environment tooling  
- (Optional) Git for cloning & deployment  
- For TensorFlow on Windows: ensure MSVC runtime + AVX-capable CPU

## Local Development

```bash
git clone https://github.com/manthan-018/pomegranate-disease-detection.git
cd pomegranate-disease-detection
python -m venv .venv
.venv\Scripts\activate          # (Linux/macOS: source .venv/bin/activate)
pip install -r requirements.txt

# set environment variables (PowerShell example)
$env:FRUIT_GUARDIAN_SECRET = "change-me"
$env:ADMIN_ACCESS_TOKEN = "your-admin-token"

python app.py
```

Visit `http://127.0.0.1:5000/auth` to register/log in, then proceed to `/` for the classifier interface.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FRUIT_GUARDIAN_SECRET` | ✅ | Flask secret key for session signing |
| `ADMIN_ACCESS_TOKEN` | ✅ | Token required to fetch `/admin/users` |

Both variables are intentionally set as `sync: false` in `render.yaml` so you can inject them safely from the Render dashboard.

## Key Routes & APIs

| Route | Method(s) | Description |
|-------|-----------|-------------|
| `/auth` | GET | Redirects to `/login` unless already authenticated |
| `/login` | GET/POST | Login form + JSON API (`identifier`, `password`) |
| `/register` | GET/POST | Registration form + API (auto-login on success) |
| `/` | GET | Protected classifier UI; requires valid session |
| `/predict` | POST | Accepts `multipart/form-data` with `image`; returns JSON predictions |
| `/admin/users` | GET | Admin-only export of registered users (`token` query param) |
| `/logout` | POST | Clears the session and redirects to `/login` |

## Deployment (Render)

Everything needed for Render is already included:

- `requirements.txt` (now with `gunicorn`)  
- `Procfile` (`web: gunicorn app:app`)  
- `render.yaml` (Python service blueprint)

Quick summary:

1. Push code to GitHub (`main` branch).  
2. In Render → **New → Blueprint Deploy**, select this repo.  
3. Set `FRUIT_GUARDIAN_SECRET` and `ADMIN_ACCESS_TOKEN`.  
4. Render runs the build/start commands and exposes a URL.  
5. Detailed walkthrough: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

## Dataset & Model

- `dataset_of_img1/` houses categorized sample images for Alternaria, Anthracnose, Bacterial Blight, Cercospora, and Healthy fruit.  
- `fruit_health_model.keras` / `.h5` are the trained TensorFlow models loaded by `app.py`.  
- You can swap in your own weights by replacing the files and keeping the same filenames.

## Contributing

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feature/amazing`).  
3. Commit your changes (`git commit -am 'Add amazing feature'`).  
4. Push the branch and open a Pull Request.  

Issues and suggestions are welcome!

