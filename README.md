# NestJS Backend Template

A production-oriented **NestJS** backend template built to be cloned and extended into a new project. It comes with authentication, authorization, caching, background jobs, file serving and Docker-based infrastructure already wired up, so you can focus on writing your own feature modules instead of boilerplate.

## Features

- **Authentication** — sign-up with email verification, login with JWT (httpOnly cookies + refresh token), logout with token blacklist, password reset.
- **Authorization** — Role-Based Access Control data model (`User` / `Role` / `Permission`) with **CASL** abilities for fine-grained permission checks.
- **Reusable CRUD layer** — controller, service and repository factories (`CrudBaseController`, `CrudBaseService`, `BaseRepository`) that generate standard endpoints with dynamic filtering and pagination out of the box.
- **Transactions & soft deletes** — `UnitOfWorkBuilder` for safe database transactions and a `BaseModel` with soft-delete support.
- **Background jobs** — **BullMQ** queue with **Nodemailer** (EJS templates) for async email sending.
- **Caching & rate limiting** — Redis-backed cache and **Throttler** guards to protect endpoints.
- **File storage** — an abstraction over local filesystem or an external service, with an endpoint to stream files.
- **Infrastructure** — **TypeORM** with migrations, scheduled cleanup jobs, and a **Docker Compose** setup (Postgres + Redis + app).

## Architecture

The app follows NestJS conventions and is organised around a few reusable building blocks under `src/`.

### How a request flows

```
Request
   │
   ▼
Middleware (reads JWT cookie → stores userId in AsyncLocalStorage)
   │
   ▼
Guards (ThrottlerGuard → AuthGuard, global by default)
   │
   ▼
Controller (declarative CRUD, or custom endpoint)
   │
   ▼
Service (business logic; `CrudBaseService` when a simple CRUD is enough)
   │
   ▼
Repository (`BaseRepository`, dynamic filters + pagination)
   │
   ▼
PostgreSQL (via TypeORM)
```

Global setup in `src/main.ts` adds the `/api` prefix, CORS, `helmet`, cookie parsing, a whitelisting `ValidationPipe` and a global error filter.

### Project structure

```
src/
├── main.ts                  # Bootstrap: global prefix, CORS, helmet, pipes, filters
├── app.module.ts            # Root module: wires up config + feature modules
│
├── common/                  # Reusable building blocks
│   ├── controllers/         #   CrudBaseController factory
│   ├── services/            #   CrudBaseService, UnitOfWorkBuilder
│   ├── repositories/        #   BaseRepository (criteria-based queries)
│   ├── criteria/            #   CriteriaDto for filtering/pagination
│   ├── decorators/          #   @Public, @JWT, @JWTPayload, @FileInBody, @VerifyToken
│   ├── cookies/             #   Cookie helpers for auth tokens
│   ├── filters/             #   Global exception filter
│   ├── model/               #   BaseModel (soft delete)
│   ├── pipes/               #   DTO validation pipe
│   └── utils/               #   JWT helpers
│
├── config/                  # Module configurations
│   ├── database.config.ts   #   TypeORM
│   ├── jwt.config.ts        #   JWT
│   ├── cache.config.ts      #   Redis cache
│   ├── bullMQ.config.ts     #   BullMQ
│   └── throttler.config.ts  #   Rate limiting
│
├── database/                # Data source + TypeORM migrations
│
├── integrations/            # Cross-cutting concerns
│   ├── als/                 #   AsyncLocalStorage (per-request context, userId)
│   └── casl/                #   CASL authorization factory
│
├── modules/                 # Feature modules — add new ones here
│   ├── auth/                #   Authentication, guards, refresh, reset password
│   └── users/               #   User/Role/Permission models, CRUD endpoints
│
├── mailer/                  # BullMQ + Nodemailer email queue
│
├── fileStreamer/            # File storage abstraction + streaming endpoint
│
└── types/                   # Shared TypeScript type declarations
```

### How it's meant to be used

The template is designed so that a simple feature module can be created **declaratively** by combining the existing factories:

1. Define a **model** (extending `BaseModel` for soft deletes) in a new module folder, e.g. `src/modules/foo/models/foo.model.ts`.
2. Extend **`BaseRepository`** for that model.
3. Extend **`CrudBaseService`** with your repository.
4. Create a **controller** extending **`CrudBaseController`**, passing the prefix, DTO and entity for serialization.

This gives you a full set of standard endpoints (`GET` with pagination/filters, `GET :id`, `POST`, `PATCH :id`, `DELETE :id`, `DELETE` many) with validation, transactions and CASL checks already applied. Only add custom logic where your feature needs it.

Finally, register the module in `src/app.module.ts` (and its entities in the TypeORM data source for migrations).

Features are protected by default — mark public routes with `@Public()` (e.g. `login`, `sign-up`).

## Getting started

### Prerequisites

- Node.js and `pnpm`
- Docker (for Postgres, Redis and the containerised app)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
#    fill in DB_*, JWT_SECRET, MAILER_*, REDIS_*, FRONT_BASE_URL, THROTTLER_*, etc.

# 3. Start infrastructure (Postgres + Redis) and the app
docker compose up --build

# 4. Apply database migrations
pnpm run migration:run
```

### Running without Docker

If you already have Postgres and Redis running, use the `start` scripts directly instead of `docker compose`.

## Project scripts

| Command | Description |
| --- | --- |
| `pnpm run start` | Start in development mode |
| `pnpm run start:dev` | Start in watch mode |
| `pnpm run start:prod` | Start the compiled app (`dist/main.js`) |
| `pnpm run build` | Build the project |
| `pnpm run lint` | Lint and auto-fix |
| `pnpm run format` | Format with Prettier |
| `pnpm run test` | Run unit tests |
| `pnpm run test:e2e` | Run end-to-end tests |
| `pnpm run test:cov` | Run tests with coverage |
| `pnpm run migration:run` | Run pending migrations |
| `pnpm run migration:generate` | Generate a migration from entity changes |
| `pnpm run migration:revert` | Revert the last migration |
| `pnpm run migration:create` | Create an empty migration |

## License

This project is licensed under the [UNLICENSED](LICENSE) license.
