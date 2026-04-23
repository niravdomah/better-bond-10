# Epic 1: Auth, Shell, and Navigation Foundation

## Description

Delivers the authenticated, role-aware shell that every subsequent epic builds on: the sign-in page wired to NextAuth with a 2-role model (admin, viewer), the responsive top navigation bar with role-filtered links and active-state highlighting, route guards that enforce admin-only screens at the middleware/layout level, the light/dark theme switcher with MortgageMax palette and localStorage persistence, the global toast infrastructure used by every API error/success flow, and the admin-only Reset Demo button in the footer. After Epic 1 ships, any authenticated user can sign in, land on a placeholder Dashboard, see the correct nav links for their role, toggle themes, and (if admin) reset demo data — with every other screen protected and toast-ready.

## Stories

1. **Sign-in page and NextAuth session** - Replace template sign-in with BetterBond-branded page using NextAuth credentials against admin-provisioned users, expose role and email/display-name on the session, redirect to Dashboard on success, and reconcile the 4-role template enum down to the FRS 2-role model (admin, viewer). | File: `story-1-1-signin-page.md` | Status: Pending
2. **Application shell and responsive layout** - Build the persistent authenticated shell — top navigation bar, main content region, and footer — that every authenticated page renders inside. Responsive from 375px mobile to 1280px+ desktop, WCAG 2.1 AA compliant in both themes, and unauthenticated access redirects to sign-in. | File: `story-1-2-application-shell.md` | Status: Pending
3. **Role-aware navigation links and active state** - Populate the shell's top navigation with role-filtered links (Dashboard and Payments Made for everyone; Payment Management and Users for admins only), highlight the active route, and make every link keyboard- and screen-reader-accessible. | File: `story-1-3-role-aware-nav.md` | Status: Pending
4. **Route guards for admin-only pages** - Enforce admin-only access to Payment Management and Users at the middleware/layout level so that viewers are redirected to the Dashboard even if they bookmark or type the URL directly, and unauthenticated users land on sign-in. | File: `story-1-4-route-guards.md` | Status: Pending
5. **Theme switcher with persistence** - Add the light/dark theme toggle to the top nav using the MortgageMax palette, persist the choice in localStorage with no flash of wrong theme on reload, and keep both themes WCAG 2.1 AA compliant including the teal accent on dark. | File: `story-1-5-theme-switcher.md` | Status: Pending
6. **Global toast notification infrastructure** - Mount a single toast container at the shell, expose a simple API (success/error/info) used by every subsequent feature, render toasts non-blocking at the corner/bottom, and satisfy screen-reader live-region requirements. | File: `story-1-6-toast-infrastructure.md` | Status: Pending
7. **Admin-only Reset Demo button** - Add the admin-only Reset Demo button to the footer, require a confirmation modal before calling `POST /demo/reset-demo`, show a success toast and refresh on success, show an error toast on failure, and hide the button entirely for viewers. | File: `story-1-7-reset-demo.md` | Status: Pending

## Dependencies

This epic has no upstream dependencies — it is the foundation. Every other epic (2-5) depends on its output: the authenticated session, the shell, the route guards, the toast infrastructure, and the theme switcher.

**Within the epic**, stories can be worked in the listed order but 1.5 (theme) and 1.6 (toast) are independent of each other and could parallel if needed. 1.7 (Reset Demo) depends on 1.6 (toast infrastructure) for success/error feedback. 1.3 (nav links) depends on 1.2 (shell) providing the nav region. 1.4 (route guards) depends on 1.1 (session + role) and 1.2 (shell).
