# Land Acquisition Risk Intelligence & Predictive Decision Support System

MERN + FastAPI prototype for an SIH-style land acquisition delay prediction platform. The app is built around the demo story:

**Data -> Risk -> Prediction -> Explanation -> Recommendation -> Action**

All bundled records are synthetic demo data. The prediction engine is configurable prototype scoring logic and does not claim to be trained on official government data.

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@landrisk.demo` | `Admin@123` |
| Viewer | `viewer@landrisk.demo` | `Viewer@123` |

## Structure

- `frontend/` React, Vite, Tailwind CSS, Recharts, Leaflet, Lucide icons
- `backend/` Express, MongoDB/Mongoose, JWT auth, role authorization, REST APIs
- `ml-service/` FastAPI prototype prediction service ready to be replaced by a trained model

## Run Locally

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

ML service:

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Open `http://localhost:5173`.

## Implemented

- Professional role-based login and demo credentials
- Admin and Viewer experiences with different sidebars
- Read-only Viewer mode
- Protected admin routes with Access Denied page
- Dashboard KPIs, risk distribution, high-risk table and dynamic insight cards
- Project search/filter table
- Project intelligence page with lifecycle, risk score, delay probability, explainability and recommendations
- Add/Edit Project form that recalculates risk and updates analytics
- Compensation and landowner analytics with admin payment updates
- Rehabilitation, legal, risk analysis, delay prediction and analytics dashboards
- Leaflet GIS map with risk-colored project markers
- Alerts, reports, settings, user management and audit logs
- Admin data management tabs with add/edit/delete/import/export affordances
- Express API with JWT auth, role-based write protection and Mongo schemas
- FastAPI ML service with `/predict` and `/predict/stages`

## API Highlights

- `POST /api/auth/login`
- `POST /api/auth/register` admin only
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects` admin only
- `PUT /api/projects/:id` admin only
- `DELETE /api/projects/:id` admin only, soft delete
- `GET /api/risk/:projectId`
- `POST /api/risk/predict` admin only
- `GET /api/analytics/overview`
- `GET /api/analytics/compensation`
- `GET /api/analytics/delays`
- `GET /api/analytics/districts`
- `GET /api/analytics/states`
- `GET /api/landowners`
- `GET /api/compensation`
- `PUT /api/compensation/:id` admin only
- `GET /api/legal-cases`
- `GET /api/rehabilitation`
- `GET /api/alerts`
- `PUT /api/alerts/:id` admin only

## SIH Demo Flow

1. Login as Admin.
2. Open Data Management -> Landowners or Compensation.
3. Mark several pending payments as paid.
4. Return to the linked project or dashboard.
5. Risk score, delay probability, factors, recommendations and analytics update.
6. Logout and login as Viewer.
7. Viewer can monitor the updated information but cannot edit or access admin pages.

## Security Notes

- Demo frontend authentication is local for presentation speed.
- Backend implements actual JWT authentication and role authorization.
- Never commit `.env`, database credentials, JWT secrets or API keys.
- For production, connect frontend auth to the backend login endpoint and enforce HTTPS, stronger validation, centralized audit logging and hardened MongoDB access controls.
