# ProEase Global — Backend Deployment

Express + MongoDB API. Set up to run as **Vercel serverless** (`api/index.js`
re-exports the Express app; `server.js` only calls `listen` when not on Vercel).
It also runs fine on a normal Node host (Render, Railway, a VPS) via `npm start`.

## Deploy on Vercel (recommended)
1. **New Project** → import the `proeaseglobal-be` repo.
2. Framework preset: **Other**. Root directory: repo root. No build command needed.
3. Add the **Environment Variables** below (Project → Settings → Environment Variables).
4. Deploy. Your API base URL will be `https://<project>.vercel.app`
   (e.g. test it: `https://<project>.vercel.app/` → "API Working").

## Required environment variables
| Variable | Notes |
|---|---|
| `MONGODB_URI` | MongoDB Atlas SRV string (without trailing `/`; the code appends `/e-commerce`). |
| `JWT_SECRET` | Any long random string. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin-panel login credentials. |
| `CLOUDINARY_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_SECRET_KEY` | For image uploads (banners, logo, products). |
| `GOOGLE_CLIENT_ID` | OAuth client ID for "Sign in with Google" (same value as the storefront). |
| `STRIPE_SECRET_KEY` | Optional — only if using Stripe checkout. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Optional — only if using Razorpay. |

See `.env.example` for the full list.

## Important: MongoDB Atlas network access
Serverless functions use **dynamic IPs**, so in Atlas → **Network Access**, add
`0.0.0.0/0` (allow from anywhere) — otherwise the API can't reach the database.
(Locally the code forces public DNS for Atlas SRV; on Vercel that's skipped automatically.)

## CORS
`cors()` is enabled for all origins, so the storefront and admin can call the API
from their own domains out of the box.

## Notes
- File uploads use multer to a temp dir, then upload to Cloudinary within the
  request — works on serverless (`/tmp`).
- Deploy the backend **first**, then put its URL into the storefront/admin
  `VITE_BACKEND_URL`.
