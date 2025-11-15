# Project Requirements Document (PRD)

## 1. Project Overview

**Brainstorm Dashboard** is a full-stack web application built on Next.js, tailored to power a financial competition platform. It provides two main user roles—**Admin** and **Participant**—each with dedicated interfaces. Admins can manage news, companies, participants, and transactions via CRUD panels, plus upload participant lists through CSV/Excel imports. Participants can view a personalized dashboard: real-time stock charts, transaction forms, portfolio summaries, and a live OBS overlay for competition updates.

This project addresses the need for a secure, type-safe, and fast-to-market solution. It leverages a pre-built Next.js starter with authentication, a protected `/dashboard`, and Postgres integration through Drizzle ORM. Key objectives include: 1) Role-based access control with IP whitelisting, 2) Real-time updates for participants via SSE or WebSockets, 3) A sleek, responsive UI with shadcn/ui and Tailwind CSS. Success is measured by a fully functional MVP where admins can manage all data and participants can trade virtually with live feedback.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (v1)
- User authentication with **Better Auth** (sign-up, sign-in, JWT sessions).
- Role-based dashboards: `/admin` for Admins, `/dashboard` for Participants.
- IP whitelisting middleware using `ALLOWED_CIDR` and `X-Forwarded-For` header.
- Admin CRUD APIs and UI for News, Companies, Participants, Transactions (with Zod validation).
- CSV/Excel import endpoint for bulk participant uploads (using Formidable + xlsx).
- Participant dashboard pages: Home (charts + news), Transactions (form + real-time calculations), Portfolio (tables).
- Real-time competition overlay: Server-Sent Events (SSE) or WebSockets for live notifications and "Start/End Day" signals.
- Type-safe data modeling with **Drizzle ORM** on **PostgreSQL**.
- Responsive UI built with **shadcn/ui** components and **Tailwind CSS**.
- Docker setup for local Postgres and Next.js environment.

### Out-of-Scope (v1)
- Mobile (React Native or native) clients.
- Payment or billing integration.
- Advanced analytics dashboards or machine learning.
- Multi-tenant architecture or white-labeling.
- Third-party exchange integrations for real money trading.

## 3. User Flow

When a **new Participant** arrives, they sign up via email and password on `/auth/signup`. After verifying their session, they land on `/dashboard/home` where they see a UTC+7 clock, latest news feed, and a real-time line chart of stock prices. They navigate to `/dashboard/transactions` via the side menu, fill out buy/sell quantities, watch live total calculations, and submit trades. Their portfolio updates instantly on `/dashboard/portfolio`. A server-sent overlay feed pushes competition updates to their OBS application via a `/obs` endpoint.

An **Admin** logs in through `/auth/signin`, lands on `/admin/home`, then navigates to subpages: `/admin/news`, `/admin/companies`, `/admin/participants`, and `/admin/transactions`. They can click “Add” or “Edit” to open modal forms, with validation via Zod. Bulk participant CSV uploads happen at `/admin/participants/import`. All admin routes are protected by RBAC checks in the layout middleware and API route handlers.

## 4. Core Features

- **Authentication & RBAC**: Secure sign-up/sign-in, JWT sessions, `role` field (`admin` | `participant`).
- **IP Whitelisting**: Global middleware reading `ALLOWED_CIDR` and incoming IP via `X-Forwarded-For`.
- **Admin Panel**:
  - CRUD APIs (`/api/admin/[model]`) for News, Companies, Participants, Transactions.
  - Zod schema validation on all inputs.
  - CSV/Excel import endpoint (Formidable + xlsx).
- **Participant Dashboard**:
  - Home: stock charts (Chart.js + react-chartjs-2), news feed (SWR).
  - Transactions: dynamic form with real-time calculations.
  - Portfolio: table listing holdings and P/L.
- **Real-Time Overlay**:
  - SSE or WebSockets for push notifications and event signals.
  - `/obs` endpoint to consume live streams in OBS.
- **Type-Safe ORM**: Drizzle ORM models for Users, News, Companies, Participants, Transactions.
- **UI Components**: shadcn/ui + Tailwind CSS (Tables, Inputs, Modals).

## 5. Tech Stack & Tools

- **Frontend**: Next.js (App Router), React, TypeScript.
- **UI**: shadcn/ui component library, Tailwind CSS.
- **Auth**: Better Auth (JWT-based).
- **ORM & DB**: Drizzle ORM, PostgreSQL (Docker).
- **Data Fetching**: SWR for client-side hooks.
- **Date/Time**: Day.js for UTC+7 clock.
- **Charting**: Chart.js + react-chartjs-2.
- **File Handling**: Formidable (multipart parsing), xlsx (Excel/CSV parsing).
- **Real-Time**: Server-Sent Events or Socket.IO (`ws` or `socket.io`).
- **Validation**: Zod for request schemas.
- **Middleware**: Next.js `middleware.ts` for IP filtering.
- **Dev Tools**: Docker, VS Code (with Cursor/Windsurf plugins optional).

## 6. Non-Functional Requirements

- **Performance**: Page load ≤ 2s; API responses ≤ 100ms under normal load.
- **Security**: TLS for all endpoints; JWT session tokens; RBAC checks; OWASP Top 10 compliance.
- **Scalability**: Modular route groups; ability to add more models and pages.
- **Usability**: Responsive breakpoints (mobile, tablet, desktop); accessible components (ARIA, keyboard navigation).
- **Reliability**: 99.9% uptime; retry logic for SSE/WebSocket reconnects.

## 7. Constraints & Assumptions

- Next.js App Router is used (no pages directory).
- `Better Auth` must support role-based JWT claims.
- Postgres runs in Docker locally; migrations via Drizzle Kit.
- Network traffic passes through a proxy injecting `X-Forwarded-For`.
- SSE/WebSocket support is permitted on the hosting platform.
- Environment variables (`DATABASE_URL`, `ALLOWED_CIDR`, `JWT_SECRET`) are correctly set.

## 8. Known Issues & Potential Pitfalls

- **IP Whitelisting Accuracy**: Reliant on correct `X-Forwarded-For` parsing; mitigate by using proven libraries like `ip-address` and extensive testing.
- **Drizzle Migrations**: Schema changes require careful `generate:pg` and `push:pg` commands; versioning must be kept consistent.
- **CSV/Excel Edge Cases**: Malformed files may crash the import; add robust error handling and user feedback.
- **SSE/WS Scaling**: Connection limits on serverless environments; consider fallback polling or a dedicated WebSocket server.
- **Stale SWR Data**: Ensure correct revalidation triggers after writes; use `mutate()` calls post-submission.
- **CORS & Headers**: API routes and OBS endpoint must allow correct origin headers; configure in `next.config.js`.

---

This PRD serves as the single source of truth for all subsequent technical documents: Tech Stack, Frontend Guidelines, Backend Structure, and more. It leaves no ambiguity about scope, user journeys, features, or constraints, ensuring a smooth transition to implementation.