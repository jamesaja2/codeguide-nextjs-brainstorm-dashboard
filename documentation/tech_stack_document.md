# Tech Stack Document

This document explains the technology choices for the **codeguide-nextjs-brainstorm-dashboard** project in clear, everyday language. You’ll see why each tool was picked and how they work together to build a secure, responsive, and scalable web application.

## 1. Frontend Technologies

These are the pieces that run in your web browser and make the app look and feel great:

- **Next.js (App Router)**  
  A modern framework built on React that helps us organize pages, handle navigation, and even build backend APIs in the same project. It makes development faster and the final app snappier.

- **React**  
  A popular library for building interactive user interfaces. React breaks the page into small components, so we can reuse and maintain pieces like buttons, forms, and tables easily.

- **TypeScript**  
  A layer on top of JavaScript that checks our code as we write it, catching mistakes early. This is especially helpful when dealing with financial data and complex logic.

- **shadcn/ui**  
  A pre-built set of React components (tables, modals, inputs, buttons) that look clean and work on desktop or mobile out of the box. It speeds up building forms and data views without designing each element from scratch.

- **Tailwind CSS**  
  A utility-first styling tool that provides ready-to-use classes for colors, spacing, and layout. It lets us quickly customize the look to match your brand without writing long custom styles.

- **SWR**  
  A small library for fetching and caching data in the browser. It keeps lists and tables up to date, handles loading and error states, and automatically refreshes data in the background.

- **Chart.js (via `react-chartjs-2`)**  
  A simple, powerful charting library wrapped in React. We’ll use it to draw stock performance and portfolio graphs that update in real time.

- **Day.js**  
  A lightweight date library to format and display times, including the custom UTC+7 clock in the site header.

## 2. Backend Technologies

These tools run on the server and manage data, security, and core logic:

- **Next.js API Routes**  
  Built-in server functions where we write the logic for reading or updating the database, processing transactions, and replying to the frontend.

- **better-auth**  
  A ready-made authentication solution that handles sign-up, sign-in, session management, and JSON Web Tokens (JWTs). It makes sure only logged-in users can access private pages.

- **Drizzle ORM**  
  A type-safe layer between our code and PostgreSQL. We define database tables in code, and Drizzle turns them into SQL queries. This helps us avoid mistakes like typos in table or column names.

- **PostgreSQL**  
  A reliable relational database for storing users, news items, companies, transactions, and more. It handles relationships and complex queries efficiently.

- **Zod**  
  A validation library that checks all incoming data (for example, form submissions) against predefined rules. This keeps invalid or malicious data out of our system.

- **Formidable & xlsx**  
  Two small libraries to handle file uploads (`multipart/form-data`) and read Excel or CSV files. We’ll use them to import participant lists in bulk.

## 3. Infrastructure and Deployment

Here’s how we host, version, and deliver the application reliably:

- **Git & GitHub**  
  We track all code changes with Git and store the repository on GitHub. This lets multiple developers collaborate smoothly, review each other’s work, and roll back to earlier versions if needed.

- **Vercel (or similar)**  
  A cloud platform optimized for Next.js projects. Vercel automatically builds and deploys the app whenever we push to GitHub, giving us instant previews and production releases.

- **Docker**  
  A container tool we use for local development. It sets up the same environment (Node.js, PostgreSQL) on every developer’s machine, eliminating "it works on my computer" problems.

- **GitHub Actions**  
  An automated workflow that runs tests, lints code, and deploys to Vercel whenever changes are merged. It ensures we catch issues early and deploy a stable app.

## 4. Third-Party Integrations

We connect to or embed external services to speed up development and enhance functionality:

- **Chart.js**  
  For dynamic, interactive graphs inside React components.

- **ip-address**  
  A small utility to check if a visitor’s IP falls within allowed ranges (IP whitelisting).

- **WebSocket / Server-Sent Events**  
  For real-time features like the OBS overlay and "start/end day" bells. We can choose libraries like `ws` or `socket.io` for two-way communication or use built-in SSE on Next.js.

## 5. Security and Performance Considerations

We’ve built in several measures to keep the app safe and efficient:

- **Authentication & Role-Based Access Control (RBAC)**  
  - `better-auth` secures all sign-in and session logic.  
  - We add a `role` field (admin vs. participant) to user data and protect `/admin` pages and APIs so only admins can reach them.

- **IP Whitelisting**  
  A global middleware reads the visitor’s IP (from headers) and checks it against an `ALLOWED_CIDR` list. Unauthorized requests get a 403 response before hitting our API.

- **Input Validation**  
  Every API route checks incoming data with Zod to prevent malformed or malicious payloads.

- **Data Caching & Lazy Loading**  
  SWR speeds up repeated data fetches and reduces server load. Tailwind and shadcn/ui ensure we ship small CSS bundles for fast page loads.

- **Type Safety**  
  TypeScript and Drizzle make sure data shapes match from the database all the way to the UI, reducing runtime errors.

## 6. Conclusion and Overall Tech Stack Summary

In summary, this project combines a modern, full-stack framework (Next.js) with trusted libraries for UI (React, shadcn/ui, Tailwind), data (PostgreSQL, Drizzle ORM), and security (better-auth, Zod, IP whitelisting). Containerization (Docker) and automated workflows (GitHub Actions, Vercel) ensure every release is smooth and stable. Real-time features are ready to be added via WebSockets or SSE, and file imports are handled with Formidable and xlsx.

These choices align perfectly with the goal of building a secure, extendable Brainstorm Dashboard that serves both administrators and participants, provides real-time updates, and handles financial data with confidence and performance.