# ForenSOC Release & QA Checklist

## Current Status
- Frontend build: ✅ passed (`npm run build` in `frontend-react`)
- Frontend lint: ✅ passed with warnings only (`npm run lint`)
- Backend tests: ✅ passed with Python 3.12 and `backend/requirements-dev.txt`

## Recommended Local Environment
### Frontend
- Node 18+ / NPM
- `cd frontend-react`
- `npm install`
- `npm run build`
- `npm run lint`

### Backend
- Python 3.12 is required for the current test environment
- `cd backend`
- `py -3.12 -m pip install -r requirements-dev.txt`
- `py -3.12 -m pytest -q`

> Note: `requirements-dev.txt` includes test helper dependencies not present in production `requirements.txt`.

## Build & Test Commands
### Frontend
```bash
cd frontend-react
npm install
npm run build
npm run lint
```

### Backend
```bash
cd backend
py -3.12 -m pip install -r requirements-dev.txt
py -3.12 -m pytest -q
```

## Production Readiness Checklist
### Configuration
- [ ] Create `.env` from `.env.example`
- [ ] Set `SECRET_KEY` to a strong random value
- [ ] Set `POSTGRES_PASSWORD` to a secure password
- [ ] Set `ALLOWED_ORIGINS_STR` to the deployed frontend URL(s)
- [ ] Set `VITE_API_BASE_URL` for the frontend to point to the deployed backend
- [ ] Ensure `JWT` expiry and CORS are configured for production

### Deployment
- [ ] Deploy backend using Docker Compose, Render, or other production host
- [ ] Deploy frontend using Vercel, Netlify, or static hosting behind HTTPS
- [ ] Verify HTTPS / TLS is enabled for both UI and API
- [ ] Confirm reverse proxy or cloud origin settings are secure

### Functional Verification
- [ ] Login as admin and verify dashboard loads
- [ ] Create and manage a case successfully
- [ ] Upload evidence and verify SHA-256 hashing
- [ ] Run a YARA scan or file analysis workflow
- [ ] Generate / download a report
- [ ] Use the public search portal and validate results

### Security Verification
- [ ] Confirm default credentials are changed
- [ ] Verify CORS is not open to `*`
- [ ] Test access control for all roles
- [ ] Validate JWT expiration and logout flow
- [ ] Confirm evidence downloads require authorization

### Known Notes & Next Work
- `frontend-react` lint warnings remain for React hook dependency arrays. These are not blocking but should be reviewed.
- The backend requires `geocoder` and `python-magic` support for full local tests.
- This repository does not yet contain a dedicated CI config for running the backend tests in the same environment.

## What to do next by yourself
1. Use `RELEASE_CHECKLIST.md` as your verification guide.
2. Confirm `.env` values and deployment URLs before going live.
3. Run both frontend and backend test commands on the target machine.
4. Review and resolve frontend lint warnings as part of final QA.
5. Add CI/CD automation for these validation steps if not already present.
