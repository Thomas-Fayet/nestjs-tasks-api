# Tasks API

A RESTful API built with [NestJS](https://nestjs.com/) and TypeScript, demonstrating production-ready patterns including JWT authentication, refresh tokens, rate limiting, serialization, and full test coverage.

## Tech Stack

- **Framework** — NestJS (TypeScript)
- **Database** — PostgreSQL via TypeORM (Active Record pattern)
- **Authentication** — JWT (access + refresh tokens) with Passport.js
- **Validation** — class-validator / class-transformer
- **Documentation** — Swagger / OpenAPI
- **Testing** — Jest (unit + e2e with Supertest)

## Features

### Authentication & Security

- **JWT access token** (15 min expiry) — used on all protected routes via `Authorization: Bearer <token>`
- **Refresh token** (7 day expiry) — stored hashed (bcrypt) in database, used to renew the access token without re-login
- **Logout** — invalidates the refresh token in database, making it immediately unusable even before expiry
- **Password hashing** — bcrypt with salt rounds
- **Password policy** — minimum 8 characters, requires uppercase, number and special character
- **Serialization** — `password` and `refreshToken` fields are automatically excluded from all responses via `ClassSerializerInterceptor`

### Rate Limiting

- **Global** — 100 requests per minute on all routes
- **Login route** — stricter limit of 10 requests per minute to protect against brute force attacks
- Returns `429 Too Many Requests` when exceeded

### Authorization

- All task routes require a valid JWT token
- Tasks are scoped per user — a user can only read, update or delete their own tasks
- Attempting to access another user's task returns `404 Not Found` (not 401, to avoid leaking resource existence)

### Validation

- Request bodies validated via DTOs with class-validator decorators
- Invalid or missing fields return `400 Bad Request` with explicit error messages
- Route parameters typed and parsed (e.g. `ParseIntPipe` on `:id`)

### API Documentation

Interactive Swagger UI available at `/api-docs` when the server is running.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Installation

```bash
npm install
```

### Environment

Create a `.env` file at the root with the following variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_NAME=nestjs_tasks

JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d
```

### Running

```bash
# development
npm run start:dev

# production
npm run start:prod
```

## API Routes

### Auth

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/users` | Register a new user | Public |
| POST | `/auth/login` | Login — returns `access_token` + `refresh_token` | Public |
| POST | `/auth/refresh` | Get a new access token (Bearer = refresh_token) | Refresh token |
| POST | `/auth/logout` | Invalidate the refresh token | Access token |

### Tasks

All task routes require `Authorization: Bearer <access_token>`.

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/tasks` | List all tasks of the authenticated user |
| POST | `/tasks` | Create a task |
| GET | `/tasks/:id` | Get a task by id |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

Task status must be one of: `pending`, `in_progress`, `completed`.

## Authentication Flow

```
1. POST /users          → create account
2. POST /auth/login     → { access_token, refresh_token }
3. Use access_token     → Authorization: Bearer <access_token>
4. POST /auth/refresh   → { access_token }   (when access_token expires)
5. POST /auth/logout    → invalidate refresh_token
```

## Testing

```bash
# Unit tests (services)
npm run test

# e2e tests (requires a running PostgreSQL test database: nestjs_tasks_test)
npm run test:e2e

# Coverage
npm run test:cov
```

### Test strategy

- **Unit tests** — all service methods tested in isolation with mocked database calls (Jest + spyOn)
- **e2e tests** — full HTTP stack tested against a dedicated test database, covering auth flows, authorization, validation, and ownership checks
