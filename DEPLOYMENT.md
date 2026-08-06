# Deployment

Hosting/reverse-proxy setup isn't decided yet — this covers what's
configurable today: required environment variables, fail-fast startup
checks, and how to produce a production frontend build. Update this file
once the hosting shape (single origin vs. separate origins, Windows
service vs. IIS, etc.) is settled.

## Backend

Copy `Backend/.env.example` to `Backend/.env` and fill in real values.

| Variable | Required in production | Notes |
|---|---|---|
| `DB_SERVER`, `DB_NAME` | yes | SQL Server connection (Windows auth via ODBC) |
| `NODE_ENV` | yes — set to `production` | Enables the checks below and hides internal error messages from API responses |
| `JWT_SECRET` | yes | Server refuses to start in production if this is still the placeholder value. Generate one: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CORS_ORIGINS` | yes | Comma-separated list of allowed frontend origins. No `localhost` fallback in production — server refuses to start without it |
| `PORT` | no | Defaults to 3000 |
| `JWT_EXPIRES_IN` | no | Defaults to `8h` |

Startup validation lives in `Backend/src/config/env.js` — it exits with a
clear error instead of starting with insecure/missing config.

Run with `npm start` (`node index.js`). There's no process manager or
Windows service wrapper configured yet — whatever keeps it running
(PM2, NSSM, IIS+iisnode, etc.) is still to be decided.

## Frontend

Vite bakes `VITE_API_URL` into the build at build time. Create a local
`Frontend/.env.production` (gitignored) with the real backend URL, then:

```
npm run build
```

The output in `Frontend/dist/` is static files — serve them with
whatever the chosen hosting setup ends up being (IIS, Nginx, or the
backend's own static middleware if it's later added).

## CORS / origin

Frontend and backend origin(s) aren't finalized yet. Once they are:

- **Same origin** (reverse proxy serves the frontend build and proxies
  `/api` to the backend): CORS becomes a non-issue; `CORS_ORIGINS` can
  still be set defensively but won't be exercised for same-origin calls.
- **Separate origins**: set `CORS_ORIGINS` on the backend to the
  frontend's real URL(s), and `VITE_API_URL` on the frontend to the
  backend's real URL — both exactly, including scheme (`https://`).
