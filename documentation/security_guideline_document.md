# Security Guidelines for codeguide-nextjs-brainstorm-dashboard

## 1. Introduction
This document outlines the security best practices and controls to be applied throughout the development, deployment, and operation of the `codeguide-nextjs-brainstorm-dashboard` project. It aligns with core security principles—security by design, least privilege, defense in depth—and provides actionable guidance tailored to this Next.js starter template.

---

## 2. Core Security Principles
- **Security by Design:** Plan and review security at every phase: design, implementation, testing, and deployment.  
- **Least Privilege:** Grant only the minimum permissions needed (database users, API keys, environment variables).  
- **Defense in Depth:** Layer controls (network ACLs, middleware, authentication, input validation) so no single failure leads to compromise.  
- **Fail Securely:** On errors or timeouts, return safe defaults and avoid leaking stack traces or sensitive data.  
- **Secure Defaults:** Out-of-the-box configurations should be locked down (e.g., CORS, cookies, TLS).  
- **Keep It Simple:** Favor clear, maintainable security mechanisms over complex, brittle solutions.

---

## 3. Authentication & Access Control
1. **Better Auth Configuration**  
   - Enforce strong password policies: minimum 12 characters, mixed case, digits, symbols.  
   - Use Argon2 or bcrypt with unique per-user salts for storing credentials.  
   - Ensure JWT tokens use a secure algorithm (e.g., HS256, RS256) and validate `exp`, `iat`, `aud`, and `iss` claims.  
   - Rotate signing keys regularly and keep them in a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault).  
2. **Session Management**  
   - Set `Secure`, `HttpOnly`, and `SameSite=Strict` on cookies.  
   - Enforce idle and absolute timeouts.  
   - Invalidate sessions on logout or password change.  
3. **Role-Based Access Control (RBAC)**  
   - Extend the user schema with a `role` enum (`admin` | `participant`).  
   - Implement server-side authorization checks on every `/api/admin/*` route and `/admin` pages.  
   - Create higher-order middleware to guard route groups (`/(admin)`, `/(participant)`).

---

## 4. Network Security & IP Whitelisting
- **Global Middleware**  
  - Deploy a `middleware.ts` that reads `X-Forwarded-For` (or `req.ip`) and validates against `ALLOWED_CIDR` via a vetted library (e.g., `ip-cidr`).  
  - Deny requests failing the check with a `403 Forbidden`.  
- **Defense in Depth**  
  - Complement application-level whitelisting with network controls (VPC security groups, firewall rules) in production.

---

## 5. Input Handling & Validation
- **Server-Side Validation**  
  - Use Zod schemas in API routes for strong type-safe input validation.  
  - Reject unknown or extra properties (`strict()` mode).  
- **Prevent Injection**  
  - All database access via Drizzle ORM’s parameterized queries.  
  - Sanitize any dynamic SQL or raw queries.  
- **File Uploads**  
  - Validate file type, size, and content for CSV/Excel imports with `formidable` + `xlsx`.  
  - Store uploads outside the webroot or with restrictive ACLs.  
  - Scan files for malware if feasible.

---

## 6. Data Protection & Privacy
- **Encryption In Transit**  
  - Enforce HTTPS with TLS 1.2+ and HSTS (`Strict-Transport-Security` header).  
- **Encryption At Rest**  
  - Enable database-level encryption for sensitive columns (e.g., PII).  
- **Secrets Management**  
  - Do not commit secrets or credentials.  
  - Use environment variables in CI/CD, backed by a secret store.  
- **Data Minimization & Masking**  
  - Return only necessary fields in API responses.  
  - Mask or omit PII in logs and error messages.

---

## 7. API & Service Security
- **HTTPS Everywhere**  
  - Redirect all HTTP requests to HTTPS.  
  - Use HSTS with an appropriate `max-age`.  
- **Rate Limiting & Throttling**  
  - Apply per-IP and per-user rate limits on sensitive endpoints (e.g., login, transaction creation).  
- **CORS**  
  - Restrict `Access-Control-Allow-Origin` to trusted frontend domains.  
  - Avoid wildcard origins on production.  
- **HTTP Verbs & Versioning**  
  - Enforce correct HTTP methods (GET, POST, PUT, DELETE).  
  - Implement API versioning in the URL path (`/api/v1/...`).

---

## 8. Web Application Security Hygiene
- **CSRF Protection**  
  - Use anti-CSRF tokens for all state-changing forms and API calls.  
- **Security Headers**  
  - `Content-Security-Policy` to restrict scripts, frames, and AJAX sources.  
  - `X-Content-Type-Options: nosniff` to prevent MIME sniffing.  
  - `X-Frame-Options: DENY` or CSP `frame-ancestors` to prevent clickjacking.  
  - `Referrer-Policy: strict-origin-when-cross-origin`.  
- **Subresource Integrity (SRI)**  
  - Pin critical CDN assets (e.g., Chart.js) with SRI hashes.  
- **Client-Side Storage**  
  - Avoid storing tokens or sensitive data in `localStorage` or `sessionStorage`.

---

## 9. Infrastructure & Configuration Management
- **Docker Security**  
  - Use minimal base images and regularly update to patch vulnerabilities.  
  - Run containers as non-root users.  
- **Server Hardening**  
  - Disable unused ports and services in production VMs or containers.  
  - Disable debug/verbose logging in production.  
- **TLS Configuration**  
  - Enforce modern cipher suites and disable weak protocols (SSLv3, TLS 1.0/1.1).  
- **Logging & Monitoring**  
  - Centralize logs and mask PII.  
  - Monitor authentication failures, high error rates, and abnormal traffic patterns.

---

## 10. Dependency Management
- **Lockfiles**  
  - Commit `package-lock.json` or `yarn.lock` for deterministic installs.  
- **Vulnerability Scanning**  
  - Integrate SCA tools (e.g., Dependabot, Snyk) in CI/CD to catch known CVEs.  
- **Minimal Footprint**  
  - Remove unused packages and audit transitive dependencies regularly.

---

## 11. Actionable Roadmap & Next Steps
1. **Implement Global Middleware** for IP whitelisting and RBAC checks.  
2. **Define Zod Schemas** for every API route; adopt strict validation.  
3. **Configure HTTPS & HSTS** at the edge (load balancer or reverse proxy).  
4. **Enable Rate Limiting** via middleware or API gateway.  
5. **Integrate Secrets Manager** (e.g., AWS Secrets Manager) in CI/CD pipelines and runtime.  
6. **Audit and Harden** the Docker images and host OS regularly.  
7. **Deploy Security Headers & CSP** in Next.js custom server or via CDN.  

By following these guidelines, the `codeguide-nextjs-brainstorm-dashboard` starter kit will form a strong, secure foundation for building and scaling your Brainstorm Dashboard application.