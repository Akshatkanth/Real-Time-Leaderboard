# Real-Time Leaderboard API

A backend system that ranks users based on text analysis scores across multiple categories.

## How it works

Users submit paragraphs of text. The server analyzes each submission and computes scores across 4 categories — total characters, uppercase letters, emojis, and special characters. Scores accumulate across submissions. Rankings are served in real-time from Redis.

## Tech Stack

- **TypeScript + Node.js + Express** — HTTP server
- **PostgreSQL + Prisma** — persistent storage (users, scores, history)
- **Redis** — real-time leaderboard rankings via sorted sets
- **JWT + bcrypt** — authentication
- **Docker** — runs Postgres and Redis locally

## Architecture

```
Request → Routes → Middleware (JWT) → Controllers → Services → Postgres / Redis
```

- Postgres stores users, every score submission, and timestamps
- Redis sorted sets power live leaderboard queries
- Reports query Postgres (Redis has no timestamps)

## Setup

```bash
# Install dependencies
npm install

# Start Postgres and Redis
docker compose up -d

# Run migrations and seed
docker compose run --rm migrate

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
```

## Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /auth/register | No | Register a new user |
| POST | /auth/login | No | Login, returns JWT token |
| POST | /scores/submit | Yes | Submit text, compute scores |
| GET | /leaderboard/:category | Yes | Top 10 for a category |
| GET | /leaderboard/rank/:category | Yes | Your rank in a category |
| GET | /leaderboard/report | Yes | Top players by time period |

**Categories:** `total_characters` · `uppercase` · `emojis` · `special_characters` · `global`

**Report periods:** `7d` · `30d` · `1y`

```

## Notes

- Scores accumulate across submissions — the more you submit, the higher you climb
- Leaderboard queries hit Redis (microsecond speed)
- Report queries hit Postgres (timestamp filtering)
- Migrations run inside Docker due to a Prisma 7 + Windows networking issue
