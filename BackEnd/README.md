# CLARITY Backend

FastAPI backend powering the CLARITY multi-modal emotion recognition and CBT-guided assistant.

## Quick Start

1. Create a Python 3.10+ environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` (or edit the existing file) and update:
   - `GEMINI_API_KEY`
   - `MONGODB_URI` (local) and `MONGODB_ATLAS_URI` (future Atlas cluster)
   - `MONGO_DB_NAME` (defaults to `emowell_insights`)
   - `JWT_SECRET_KEY` / `ACCESS_TOKEN_EXPIRE_MINUTES`
4. Place your trained model artifacts in `models_saved/` matching the paths set in `config.py`.
5. Launch MongoDB locally (e.g., `mongod --dbpath <path>`).
6. Launch the API:
   ```bash
   python main.py
   ```
   or
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Overview

All emotion-, assistant-, dashboard-, and admin-related endpoints now require a Bearer token obtained via `/auth/login`.

- `POST /auth/register` — Submit a new account for admin approval.
- `POST /auth/login` — Exchange approved credentials for a JWT.
- `GET /auth/me` — Fetch the current user profile.
- `GET /dashboard/overview` — Summarised behaviour insights for the authenticated user.
- `GET /emotion/image|audio|text` — Predict multi-modal emotions while logging behaviour history.
- `POST /assistant/chat` — Converse with the CBT assistant while capturing timeline entries.
- `POST /assistant/chat/clear/{id}` — Clear cached assistant history for the session.
- `GET /admin/users/pending` — (Admin) List waiting registrations.
- `POST /admin/users/{id}/decision` — (Admin) Approve or reject a registration.
- `GET /health` — Verify model/Gemini readiness.
- `GET /` — Basic service metadata.

## Seed data & demo credentials

`data/demo_seed.json` keeps the human-readable credentials that are inserted on startup. Initial accounts include:

- Admin: `admin@emowell.com` / `AdminAccess#2025`
- Demo user: `demo@emowell.com` / `DemoUser#2025`
- Pending user: `insights@emowell.com` / `Insights#2025`

Behaviour logs for the demo user are also pre-populated so that dashboard charts show realistic activity immediately.
