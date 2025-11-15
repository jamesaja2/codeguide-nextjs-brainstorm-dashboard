# Backend Structure Document for codeguide-nextjs-brainstorm-dashboard

This document describes the backend setup for the Brainstorm Dashboard starter template. It covers the architecture, data storage, APIs, hosting, infrastructure, security, monitoring, and maintenance.

## 1. Backend Architecture

### Overall Design
- Built on Next.js App Router with file-based routing for pages and API endpoints.
- Uses Better Auth for authentication flows (sign-up, sign-in, session management).
- Drizzle ORM provides type-safe database access and schema definitions in TypeScript.
- Organized in logical layers:
  - **Routes** (Next.js `app/api` folder)
  - **Services/Business Logic** (handlers that talk to the ORM)
  - **Database Models** (Drizzle schema files under `db/schema`)
- Middleware handles cross-cutting concerns (authentication checks, IP whitelisting).

### Scalability, Maintainability, Performance
- **Modular Routing**: Separate `app/(admin)` and `app/(participant)` route groups make it easy to add new features without tangled code.
- **Type Safety**: TypeScript and Drizzle ORM reduce runtime errors and make refactoring safer.
- **Caching & Data Fetching**: SWR on client side for cached requests and automatic revalidation.
- **Server-Side Rendering & Static Generation**: Next.js optimizations for fast page loads and reduced server load.
- **Containerization**: Docker ensures consistent environments across developers and automated CI pipelines.

## 2. Database Management

### Technologies Used
- Relational database (SQL)
- PostgreSQL
- Drizzle ORM for schema definition, type-safe queries, and migrations via Drizzle Kit.
- Docker Compose setup for local PostgreSQL.

### Data Organization & Access
- Each domain entity lives in its own schema file (`db/schema/users.ts`, `news.ts`, `companies.ts`, etc.).
- Migrations and schema changes managed through Drizzle Kit commands (`generate:pg`, `push:pg`).
- Services call Drizzle query functions directly, benefiting from compiled SQL and TypeScript typings.
- Connection pooling handled by Drizzle’s underlying database driver.

## 3. Database Schema

### Human-Readable Overview
1. **Users**: Stores authentication credentials and role (`admin` or `participant`).
2. **News**: Title, content, and publication timestamp for in-app announcements.
3. **Companies**: Company details (name, ticker, description) and financial metrics.
4. **Participants**: Profile linked to a user account, tracking overall portfolio value.
5. **Transactions**: Records each buy/sell action with foreign keys to participants and companies.

### SQL Schema (PostgreSQL)
```sql
-- 1. Users
table users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','participant')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. News
table news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Companies
table companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ticker TEXT UNIQUE NOT NULL,
  description TEXT,
  financials JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Participants
table participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  portfolio_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Transactions
table transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  type TEXT NOT NULL CHECK (type IN ('buy','sell')),
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  total NUMERIC GENERATED ALWAYS AS (quantity * price) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 4. API Design and Endpoints

### Approach
- RESTful endpoints implemented as Next.js API routes in the `app/api` folder.
- Input validation with Zod on all POST/PUT requests.
- Authentication enforced via Better Auth middleware.

### Key Endpoints
- **Authentication**
  - `POST /api/auth/signup` – create new user.
  - `POST /api/auth/signin` – user login, returns session cookie or JWT.
  - `POST /api/auth/signout` – clear session.

- **Admin CRUD** (`/api/admin/{model}`)
  - `GET /api/admin/news`, `/companies`, `/participants`, `/transactions`
  - `POST /api/admin/news`, etc.
  - `PUT /api/admin/news/[id]`, etc.
  - `DELETE /api/admin/news/[id]`, etc.

- **Participant-Facing**
  - `GET /api/news` – fetch published news.
  - `GET /api/companies` – list companies.
  - `GET /api/portfolio` – fetch participant portfolio summary.
  - `GET /api/transactions` – transaction history.
  - `POST /api/transactions` – record a buy/sell.

- **File Import**
  - `POST /api/admin/participants/import` – CSV/Excel upload via Formidable + xlsx.

- **Real-Time (OBS Overlay)**
  - `GET /api/obs/events` – Server-Sent Events for live updates.
  - WebSocket endpoint (`/api/ws`) for start/end day bells using `ws` or `socket.io`.

## 5. Hosting Solutions

### Frontend & API Routes
- **Vercel**: Native support for Next.js, automatic deployments from Git, global CDN, built-in serverless functions.
  - Pros: Zero-config CI/CD, edge caching, auto-scaling, HTTPS by default.

### Database
- **Managed PostgreSQL** via providers like AWS RDS, Heroku Postgres, or Supabase.
  - Pros: Automated backups, high availability, point-in-time restores, read replicas.

### Local Development
- Docker Compose brings up PostgreSQL and the Next.js app for a reproducible dev environment.

## 6. Infrastructure Components

- **Load Balancer**: Provided by hosting (Vercel’s edge network) or AWS ALB in a DIY setup.
- **CDN**: Vercel Edge or Cloudflare for static assets and API caching.
- **Caching**:
  - Client-side: SWR for stale-while-revalidate.
  - Server-side: Optional Redis layer for heavy reads (e.g., news feed).
- **Containerization**: Docker + Docker Compose for local dev and can be extended for staging/production.
- **Environment Config**: `.env` files with variables like `DATABASE_URL`, `ALLOWED_CIDR`, `JWT_SECRET`.

## 7. Security Measures

- **Authentication & Authorization**
  - Better Auth manages sign-in/up and sessions.
  - Role-based access control: `role` field on users, enforced in middleware and at API handlers.
- **IP Whitelisting Middleware**
  - Global `middleware.ts` reads `X-Forwarded-For`, compares against `ALLOWED_CIDR` ranges, denies unauthorized IPs.
- **Data Validation**
  - Zod schemas validate all incoming JSON bodies.
- **Encryption**
  - TLS for all traffic (HTTPS).
  - Passwords hashed (e.g., bcrypt) before storage.
  - Database encryption at rest (managed provider feature).
- **Environment Variables**
  - Secrets never checked into source control.

## 8. Monitoring and Maintenance

- **Error Tracking**: Sentry or LogRocket to capture exceptions and performance issues.
- **Logs & Metrics**:
  - Hosted provider logs (Vercel) + optional centralized logs (Datadog, ELK stack).
  - Application metrics via Prometheus + Grafana or a managed APM solution.
- **Health Checks**:
  - Next.js API endpoints include heartbeat routes (e.g., `/api/health`).
  - Database connectivity monitored via periodic pings.
- **Automated Migrations**
  - Drizzle Kit migrations run at deploy time or via CI step.
- **Dependency Updates**
  - Dependabot or Renovate to keep libraries up-to-date.

## 9. Conclusion and Overall Backend Summary

This backend design delivers a solid, scalable, and secure foundation for the Brainstorm Dashboard:
- **Modular Architecture** with clear separation between admin and participant zones.
- **Type-Safe Database Layer** powered by Drizzle ORM and PostgreSQL.
- **Secure Authentication** via Better Auth and IP whitelisting.
- **Real-Time Capabilities** through SSE and WebSockets for OBS overlays.
- **Modern Dev Workflow** using Docker, automated migrations, and CI/CD on Vercel.

Together, these components meet the project’s needs for rapid feature development, robust security, and high performance, while remaining approachable for developers of varying backgrounds.