# InternHub

A production-grade internship discovery, application tracking, recruiter management, and administration platform.

## Architecture

```
internhub/
├── client/          # React 18 + Vite 5 + Redux Toolkit + Tailwind CSS
├── server/          # Node.js + Express + Mongoose + JWT
└── docs/            # Architecture, tech stack, and development plan
```

## Roles

| Role | Description |
|---|---|
| `STUDENT` | Discover internships, apply, track applications |
| `RECRUITER` | Post internships, manage candidates, schedule interviews |
| `ADMIN` | Moderate platform content, manage users |
| `SUPER_ADMIN` | Full system access including admin management |

## Prerequisites

- Node.js 20 LTS
- npm 10+
- MongoDB Atlas account
- Cloudinary account

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd internhub
```

### 2. Install all dependencies

```bash
# Install root dev tools
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Configure environment variables

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your values

# Client
cp client/.env.example client/.env
# Edit client/.env with your values
```

### 4. Start development servers

```bash
# From the monorepo root — starts both client and server
npm run dev
```

- **API:** http://localhost:5000
- **Client:** http://localhost:5173
- **Health check:** http://localhost:5000/api/v1/health

## Available Scripts (root)

| Script | Description |
|---|---|
| `npm run dev` | Start client + server concurrently |
| `npm run lint` | ESLint across client and server |
| `npm run format` | Prettier format across client and server |
| `npm run test` | Run all tests |

## API

Base URL: `http://localhost:5000/api/v1`

### Health

```
GET /api/v1/health
```

```json
{
  "success": true,
  "message": "InternHub API is running",
  "environment": "development",
  "timestamp": "2026-08-23T21:00:00.000Z"
}
```

## Documentation

| Document | Description |
|---|---|
| [docs/TECH_STACK.md](./docs/TECH_STACK.md) | Technology decisions |
| [docs/PROJECT_ARCHITECTURE.md](./docs/PROJECT_ARCHITECTURE.md) | System design |
| [docs/DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md) | Phased implementation plan |

## Development Phases

- ✅ **Phase 0** — Architecture & Planning
- ✅ **Phase 1** — Foundation (current)
- ⬜ **Phase 2** — Core Backend APIs
- ⬜ **Phase 3** — Core Frontend (Student Flows)
- ⬜ **Phase 4** — Recruiter & Admin Panels
- ⬜ **Phase 5** — Advanced Features
- ⬜ **Phase 6** — Polish & Production

## Contributing

1. Branch from `main`
2. Follow the ESLint + Prettier config in each workspace
3. Write tests for all new services
4. Open a PR — CI must pass before merge

## License

MIT
