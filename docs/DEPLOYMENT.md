# InternHub — Production Deployment & Operations Guide

> **Last updated:** 2026-08-24  
> **Target Environments:** Vercel (Frontend), Render / Railway / AWS ECS (Backend), MongoDB Atlas (Database), Cloudinary (CDN Object Storage)

---

## Table of Contents

1. [Production Architecture Overview](#1-production-architecture-overview)
2. [Prerequisites & Account Requirements](#2-prerequisites--account-requirements)
3. [Environment Variables Reference](#3-environment-variables-reference)
4. [MongoDB Atlas Production Setup](#4-mongodb-atlas-production-setup)
5. [Cloudinary Object Storage Setup](#5-cloudinary-object-storage-setup)
6. [Backend Deployment (Render / Railway)](#6-backend-deployment-render--railway)
7. [Frontend Deployment (Vercel)](#7-frontend-deployment-vercel)
8. [Custom Domains, DNS & SSL Configuration](#8-custom-domains-dns--ssl-configuration)
9. [Health Probes & Uptime Monitoring](#9-health-probes--uptime-monitoring)
10. [Post-Deployment Verification Checklist](#10-post-deployment-verification-checklist)
11. [Zero-Downtime Rollouts & Rollback Strategy](#11-zero-downtime-rollouts--rollback-strategy)
12. [Disaster Recovery & Automated Backups](#12-disaster-recovery--automated-backups)

---

## 1. Production Architecture Overview

```mermaid
graph TD
  User((End Users)) -->|HTTPS / DNS| Edge[Cloudflare / Edge CDN]
  Edge -->|Static Assets / SPA Routing| Vercel[Vercel Serverless CDN (Frontend)]
  Edge -->|API Requests /api/v1/*| Render[Render Web Service (Node.js API)]
  Render -->|Encrypted TLS Connection| Mongo[(MongoDB Atlas M10+ Replica Set)]
  Render -->|Signed REST API| Cloudinary[(Cloudinary Storage CDN)]
  Render -->|SMTP TLS Port 587| Mail[SMTP / SendGrid / Postmark]
```

---

## 2. Prerequisites & Account Requirements

- **Domain Name:** `internhub.dev` (or your registered production domain)
- **Node.js Runtime:** Node.js 20 LTS (Active)
- **Database:** MongoDB Atlas Dedicated Cluster (M10+ recommended for production workloads)
- **Object Storage:** Cloudinary account with storage quota
- **Email Service Provider:** SMTP relay (SendGrid, Mailgun, AWS SES, or Gmail App Password)
- **Hosting Accounts:**
  - Frontend: [Vercel](https://vercel.com)
  - Backend: [Render](https://render.com) or [Railway](https://railway.app)

---

## 3. Environment Variables Reference

### Backend (`server/.env`)

| Variable | Description | Example / Production Value |
|---|---|---|
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | HTTP port | `5000` (or injected by hosting provider) |
| `CLIENT_URL` | Canonical frontend URL for CORS | `https://internhub.dev` |
| `MONGODB_URI` | MongoDB Atlas replica set URI | `mongodb+srv://admin:pass@cluster0.mongodb.net/internhub?retryWrites=true&w=majority` |
| `JWT_ACCESS_SECRET` | 64+ char random hex string | `e.g. 5d9f3... (generate via crypto.randomBytes(64))` |
| `JWT_REFRESH_SECRET` | 64+ char distinct random string | `e.g. 8a4c1... (generate via crypto.randomBytes(64))` |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRES_IN`| Refresh token lifespan | `7d` |
| `EMAIL_VERIFY_EXPIRES_IN`| Verification token expiry (hours) | `24` |
| `PASSWORD_RESET_EXPIRES_IN`| Reset token expiry (mins) | `15` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary tenant cloud name | `internhub-prod` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `abcdefghijklmnopqrstuv_wxyz` |
| `SMTP_HOST` | SMTP server hostname | `smtp.sendgrid.net` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | TLS mode | `false` (for port 587 STARTTLS) |
| `SMTP_USER` | SMTP username | `apikey` |
| `SMTP_PASS` | SMTP API password | `SG.your_sendgrid_api_key` |
| `EMAIL_FROM` | Dispatcher email | `noreply@internhub.dev` |
| `EMAIL_FROM_NAME` | Dispatcher name | `InternHub` |

### Frontend (`client/.env`)

| Variable | Description | Example / Production Value |
|---|---|---|
| `VITE_API_BASE_URL` | Production API gateway endpoint | `https://api.internhub.dev/api/v1` |
| `VITE_APP_NAME` | Application name branding | `InternHub` |

---

## 4. MongoDB Atlas Production Setup

1. **Cluster Tier:** Create an M10 or higher dedicated cluster with automated multi-region backup enabled.
2. **Network Access / IP Access List:**
   - Add your backend host's outbound static IPs.
   - For serverless/ephemeral hosts (Render/Railway), enable `0.0.0.0/0` access with strict password authentication.
3. **Database User:**
   - Create a dedicated database user (e.g. `internhub_api_user`) with `readWrite` privileges restricted to the `internhub` database.
4. **Index Verification:**
   - On initial connection in staging, ensure all compound and text indexes are created. In production, `autoIndex` is disabled by default (`config/db.js`) to avoid runtime collection locks.

---

## 5. Cloudinary Object Storage Setup

1. Navigate to **Cloudinary Console > Settings > Upload**.
2. Ensure **Auto-format (f_auto)** and **Auto-quality (q_auto)** transformations are enabled for image delivery.
3. In **Settings > Security**, restrict PDF delivery to secure authenticated or signed CDN delivery.

---

## 6. Backend Deployment (Render / Railway)

### Deploying to Render
1. Create a new **Web Service** on Render connected to your GitHub repository.
2. **Root Directory:** `server`
3. **Runtime:** `Node`
4. **Build Command:** `npm ci`
5. **Start Command:** `npm start` (runs `node server.js`)
6. **Environment Variables:** Populate all variables listed in the Backend section above.
7. **Health Check Path:** `/api/v1/health`

### Deploying via Docker (Optional)
If deploying via container orchestrators (AWS ECS, Google Cloud Run, DigitalOcean App Platform):
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

---

## 7. Frontend Deployment (Vercel)

1. Import the repository into **Vercel**.
2. **Framework Preset:** `Vite`
3. **Root Directory:** `client`
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Install Command:** `npm ci`
7. **Environment Variables:** Add `VITE_API_BASE_URL=https://api.internhub.dev/api/v1`.
8. **SPA Routing Rewrite Rule:** Ensure `vercel.json` or Vercel project settings routes all paths to `/index.html`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 8. Custom Domains, DNS & SSL Configuration

Configure your DNS provider (Cloudflare / Namecheap / Route 53) with the following records:

| Record Type | Host | Target | Proxy Status |
|---|---|---|---|
| `CNAME` | `@` (or `www`) | `cname.vercel-dns.com` | Proxied |
| `CNAME` | `api` | `internhub-api.onrender.com` | DNS Only / Proxied |

---

## 9. Health Probes & Uptime Monitoring

InternHub exposes a health endpoint:
```http
GET /api/v1/health
```

Configure external monitoring services (Better Uptime, Pingdom, UptimeRobot):
- **Interval:** Every 60 seconds
- **Expected Status:** `200 OK`
- **Expected Response JSON:** `{"database": {"isConnected": true}}`

---

## 10. Post-Deployment Verification Checklist

- [ ] `GET /api/v1/health` returns `200 OK` with active MongoDB connection.
- [ ] Public landing page loads at `https://internhub.dev` with fast First Contentful Paint (<1.2s).
- [ ] User registration and login succeeds; `refreshToken` cookie set with `Secure`, `HttpOnly`, `SameSite=Strict`.
- [ ] Student can browse `/internships`, search by keyword, and view detailed listings.
- [ ] Resume PDF upload succeeds and streams to Cloudinary CDN.
- [ ] Recruiter can log in, view dashboard analytics, and manage company postings.
- [ ] Admin panel access restricted to `ADMIN` / `SUPER_ADMIN` roles only.
- [ ] `robots.txt` and `sitemap.xml` are served with valid headers.

---

## 11. Zero-Downtime Rollouts & Rollback Strategy

1. **Rolling Deployments:** Render/Railway spins up the new container instance and verifies the `/api/v1/health` probe before routing traffic away from the legacy container.
2. **Instant Frontend Rollback:** Vercel allows instant 1-click rollbacks to any prior immutable deployment hash in under 5 seconds.
3. **Database Migration Safety:** Always use additive schema changes (add optional fields or new collections). Never drop fields or rename columns in the same release step.

---

## 12. Disaster Recovery & Automated Backups

- **Database Point-in-Time Recovery (PITR):** Enable MongoDB Atlas continuous cloud backups with 7-day retention.
- **Disaster Recovery Target:** RPO (Recovery Point Objective) < 5 minutes; RTO (Recovery Time Objective) < 30 minutes.
- **Static Assets:** Resumes and company media are redundantly stored across Cloudinary's multi-region S3 storage tier.
