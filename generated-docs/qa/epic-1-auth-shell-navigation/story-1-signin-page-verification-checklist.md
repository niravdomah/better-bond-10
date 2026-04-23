# Manual verification checklist — Story 1.1 (Sign-in page and NextAuth session)

**Route:** `/auth/signin`
**Starting command:** `cd web && npm run dev` then open `http://localhost:3000/`

All the steps below reflect the BA-approved behaviors: Option A audit identity (email),
Option A password-clear after failed sign-in, Option C dark-mode-on-first-visit, and
Option B user-menu dropdown for Sign Out.

## Demo credentials (admin-provisioned, POC only)

| Role   | Email                               | Password    |
|--------|-------------------------------------|-------------|
| Admin  | `alice.admin@betterbond.example`    | `Admin123!` |
| Viewer | `vera.viewer@agency.example`        | `Viewer123!`|

## Unauthenticated landing (AC-1)

- [ ] Open `http://localhost:3000/` in a clean browser profile (no existing session). You should land on the sign-in page at `/auth/signin`, not the dashboard or the template home page.
- [ ] The page shows BetterBond branding, an Email field, a Password field, and a Sign In button (AC-2).
- [ ] There is no "Sign up" or "Create account" link anywhere on the page (R41, no public self-signup).

## Dark-mode on first visit (BA-3 Option C)

- [ ] Clear your browser's localStorage for `localhost:3000` (DevTools → Application → Local Storage → clear).
- [ ] Reload the sign-in page. The page loads in **dark mode** — dark background, light text — regardless of your operating system theme.

## Admin sign-in (AC-3)

- [ ] Enter `alice.admin@betterbond.example` and `Admin123!`, click Sign In.
- [ ] You are taken to `/dashboard`.
- [ ] The page header shows your email address — this is the identity used for audit/"last changed by" values (BA-1 Option A).
- [ ] The URL bar reads `/dashboard`.

## Viewer sign-in (AC-4)

- [ ] Sign out (see below), then sign in with `vera.viewer@agency.example` / `Viewer123!`.
- [ ] You are taken to `/dashboard`.
- [ ] The page header shows the viewer's email.

## Invalid credentials (AC-11, BA-2 Option A)

- [ ] From the sign-in page, enter a valid email but a wrong password, click Sign In.
- [ ] You stay on `/auth/signin` — no redirect.
- [ ] A plain-English error appears: "The email or password is incorrect."
- [ ] The **Email field still contains what you typed** (preserved so you can retry).
- [ ] The **Password field is empty** (cleared for safety — BA-2 Option A).

## Empty submission (AC-10)

- [ ] Refresh the sign-in page. Without typing anything, click Sign In.
- [ ] An inline validation message indicates that Email and Password are required. No network request is made.

## Server unreachable (AC-12)

- [ ] Stop the backend process (or block `/api/auth/*` with DevTools → Network → Request Blocking). Try to sign in with any credentials.
- [ ] A plain-English error appears: "Sign-in could not be completed. Please try again."
- [ ] Email is preserved, password is cleared, and you remain on `/auth/signin`.

## Already-signed-in revisit (AC-7)

- [ ] While signed in, manually type `/auth/signin` in the URL bar and press Enter. You are redirected to `/dashboard` without seeing the sign-in form again.

## Session persists across restart (AC-8, NFR7)

- [ ] While signed in, close the browser window (or tab group) completely. Reopen it, navigate to `http://localhost:3000/`, and you land directly on `/dashboard` — no sign-in prompt.

## Sign Out from the user menu (AC-9, BA-4 Option B)

- [ ] On `/dashboard`, locate the user menu trigger in the top-right header (shows your name or email).
- [ ] Click it — a dropdown opens exposing a "Sign Out" item.
- [ ] Click "Sign Out". You are returned to `/auth/signin` and the session is cleared.
- [ ] Navigating back to `/dashboard` now redirects you to `/auth/signin` (session is gone).

## Keyboard-only flow (AC-13)

- [ ] From a clean load of `/auth/signin`, use Tab to move focus. You can reach the Email field, the Password field, and the Sign In button without a mouse.
- [ ] With focus on the Password field, pressing Enter submits the form.

## Screen reader labels (AC-14)

- [ ] Using a screen reader (NVDA on Windows, VoiceOver on Mac), confirm that the Email field announces "Email", the Password field announces "Password, protected", and the Sign In button announces its name.

## Contrast in both themes (AC-15)

- [ ] In dark mode, visually confirm labels, input borders, and the Sign In button's text remain readable against their backgrounds.
- [ ] (Optional, once Story 1.5 ships a toggle) Switch to light mode and repeat.

## Role model reconciliation (AC-16)

- [ ] In the running app, there are no references to legacy four-role values. Only admin and viewer behaviors exist. This is covered by an automated codebase-wide test (`src/__tests__/codebase/role-model-reconciliation.test.ts`) — rerun `npm test` and confirm it passes.
