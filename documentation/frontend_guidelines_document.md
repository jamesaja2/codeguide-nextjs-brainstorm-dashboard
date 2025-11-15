# Frontend Guideline Document for `codeguide-nextjs-brainstorm-dashboard`

This document outlines the frontend setup, design principles, and technologies used in the `codeguide-nextjs-brainstorm-dashboard` project. It’s written in everyday language so that anyone—technical or not—can understand how the frontend is organized and why it’s built this way.

## 1. Frontend Architecture

**Core Framework**
- We use **Next.js** (with the App Router) as our main framework. It handles page routing, server-side rendering, and API routes all in one place.

**UI Library and Styling**
- **shadcn/ui**: A component library providing ready-made, accessible UI bits like tables, inputs, dialogs, and buttons.
- **Tailwind CSS**: A utility-first CSS framework that helps us build custom designs quickly without writing long CSS files.

**Language and Type Safety**
- **TypeScript** powers our codebase. It ensures type safety from our database queries all the way to our component props, reducing bugs and making refactoring easier.

**Data and APIs**
- Frontend data calls our own Next.js API routes. We can extend these routes for anything from user login to transaction processing.

**How This Architecture Helps**
- **Scalability**: Route groups (`/admin`, `/dashboard`, `/obs`) and layouts mean we can add more sections without mix-ups.
- **Maintainability**: Components live in a clear folder structure, and TypeScript catches errors as we type.
- **Performance**: Next.js does code splitting automatically, and we use lazy loading for heavy components.

## 2. Design Principles

**Usability**
- We focus on clear labels, logical layouts, and straightforward navigation. Buttons and forms behave as users expect, with immediate feedback on errors or successes.

**Accessibility**
- All interactive elements use semantic HTML and proper ARIA attributes. Keyboard navigation and focus management are built into our components.

**Responsiveness**
- Mobile-first design: We start with small screens and scale up. Tailwind’s responsive utilities make it easy to adapt layouts across devices.

**Consistency**
- A shared design system (shadcn/ui + Tailwind) ensures the same look and behavior everywhere: form fields, dialogs, tables, and charts all follow the same rules.

## 3. Styling and Theming

**Styling Approach**
- **Utility-First CSS (Tailwind)**: Instead of writing long class names in CSS files, we compose small utility classes in our JSX (e.g., `px-4 py-2 bg-primary text-white`).

**Theme Management**
- A central Tailwind configuration (`tailwind.config.js`) defines colors, fonts, and spacing scales. If we ever need a light/dark switch, we’ll use Tailwind’s `dark:` variants.

**Visual Style**
- **Style**: Modern flat design with subtle shadows for depth and occasional glassmorphism-like translucent panels in modals.
- **Font**: Inter (a clean, versatile sans-serif) loaded via Google Fonts.

**Color Palette**
- Primary: #4F46E5 (Indigo)
- Secondary: #10B981 (Emerald)
- Accent: #F59E0B (Amber)
- Background: #F9FAFB (Gray-50)
- Text: #111827 (Gray-900)

## 4. Component Structure

**Folder Organization**
- `/components/ui/`: Reusable UI pieces (wrappers around shadcn/ui or custom ones).
- `/components/layout/`: Header, sidebar, footers, and page shells.
- `/components/features/`: Page-specific components like `TransactionForm`, `StockChart`, or `ParticipantTable`.

**Why Component-Based?**
- **Reusability**: Build once, use many times.
- **Isolation**: Each component has its own styles and logic, so changes don’t ripple unexpectedly.
- **Readability**: Smaller files and clear names make it easy to find and update code.

## 5. State Management

**Local State**
- For form inputs and UI toggles, we rely on React’s `useState` or `useReducer`.

**Data Fetching & Cache**
- **SWR**: Our go-to for fetching data from API routes. It handles caching, revalidation, and error states out of the box.

**Global State**
- We use **React Context** sparingly—for example, to share the authenticated user’s session across the app.

**Why This Approach?**
- Keeps data fetching logic separate from UI logic.
- Simple local state for UI, robust SWR for remote data, and minimal global state prevents over-engineering.

## 6. Routing and Navigation

**Next.js App Router**
- Routes are file-based under `/app`. We group pages:
  - `/app/admin/...` for admin panel.
  - `/app/dashboard/...` for participant dashboard.
  - `/app/obs` for the OBS overlay.

**Layouts and Middleware**
- Each route group has its own `layout.tsx`, which wraps pages in the right header, sidebar, and checks user roles.
- A global `middleware.ts` enforces IP whitelisting and blocks requests outside our allowed network.

**Navigation Components**
- We use `next/link` for internal links and dynamic imports for heavy components (e.g., chart library).

## 7. Performance Optimization

**Automatic Code Splitting**
- Next.js splits code by route so users only download what they need.

**Dynamic Imports**
- We lazy-load big libs (like `react-chartjs-2`) or heavy components with `next/dynamic`.

**Asset Optimization**
- Images via `next/image` for resized, lazy-loaded graphics.
- Tailwind in JIT mode removes unused CSS.

**Caching and Revalidation**
- SWR’s built-in caching reduces network calls and speeds up repeated data requests.

## 8. Testing and Quality Assurance

**Linting and Formatting**
- **ESLint** + **Prettier** enforce code style across the team.
- **Husky** + **lint-staged** run checks before each commit.

**Unit & Integration Tests**
- **Jest** with **React Testing Library** for components and hooks.
- Mock API calls in tests to validate UI behavior without a real server.

**End-to-End (E2E)**
- **Cypress** (or **Playwright**) for testing key user flows like sign-up, login, and transactions.

**Type Checking**
- `tsc --noEmit` runs in CI to catch type errors early.

## 9. Conclusion and Overall Frontend Summary

This frontend setup combines the best of Next.js, TypeScript, shadcn/ui, and Tailwind CSS to deliver a modern, scalable, and maintainable Brainstorm Dashboard starter kit. We focus on:

- Clear component boundaries and folder structure.
- Strong design principles: usability, accessibility, and responsiveness.
- A consistent, modern look with a well-defined color palette and font.
- Robust data fetching and caching with SWR.
- Secure, role-based routing and IP whitelisting via middleware.
- Performance tactics like code splitting, dynamic imports, and image optimization.
- A solid testing pipeline to keep quality high.

With these guidelines, any developer can jump in and confidently extend the dashboard, knowing they’re following a clear, proven pattern aligned with the project’s goals.