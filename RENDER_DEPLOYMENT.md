# Deploying PomoCare to Render

This guide walks through everything required to deploy the **PomoCare – Smart Fruit Health System** to [Render](https://render.com) and keep it running in production.

## 1. Prerequisites

| Requirement | Notes |
|-------------|-------|
| Render account | Free tier is enough for testing |
| GitHub repository | `https://github.com/manthan-018/pomegranate-disease-detection.git` |
| Dataset / model files | Already tracked in this repo (`dataset_of_img1`, `fruit_health_model.keras`, etc.) |

## 2. Environment variables

Create the following variables in **Render → Service → Environment**:

| Key | Description |
|-----|-------------|
| `FRUIT_GUARDIAN_SECRET` | Flask `SECRET_KEY` used to sign sessions |
| `ADMIN_ACCESS_TOKEN` | Token required to call `/admin/users` (choose your own secure value) |

> ⚠️ Never store secrets directly in the repo. Use Render’s dashboard or `render.yaml` with `sync: false`.

## 3. Render service definition (render.yaml)

The repo includes a `render.yaml` that declares a single Python web service:

```yaml
services:
  - type: web
    name: pomocare
    env: python
    plan: free
    region: oregon
    buildCommand: pip install --upgrade pip && pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: FRUIT_GUARDIAN_SECRET
        sync: false
      - key: ADMIN_ACCESS_TOKEN
        sync: false
```

Render will automatically detect this file when creating a **Blueprint Deploy**.

## 4. Deployment steps

1. **Push** all local changes to the GitHub repository.
2. Log into [Render](https://dashboard.render.com) and click **New → Blueprint Deploy**.
3. Select your GitHub repo and branch (`main`).
4. Render reads `render.yaml` and creates the `pomocare` web service.
5. Provide values for the environment variables when prompted.
6. Click **Apply** and wait for Render to build the container (`pip install ...`) and start `gunicorn`.
7. When the status turns **Live**, open the generated URL to reach the application.

## 5. Post-deploy checklist

- ✅ Upload / register users via `/auth` before testing `/`.
- ✅ Exercise `/predict` (requires authentication) using the UI.
- ✅ Verify `/admin/users?token=<ADMIN_ACCESS_TOKEN>` returns JSON only with a valid token.
- ✅ Enable auto-deploys (Render dashboard → Deploys → Auto deploy) if desired.

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on TensorFlow | Ensure Render service uses a machine type with at least 2 GB RAM (the free tier currently meets this) |
| 500 errors on `/predict` | Check logs; most failures come from missing model files or unsupported image formats |
| Unauthorized on `/predict` | Users must log in first (`/login` or `/register`) |

For more details on the application itself, see `README.md`.

