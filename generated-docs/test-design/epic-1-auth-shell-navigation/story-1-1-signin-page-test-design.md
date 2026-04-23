# Test Design: Sign-in page and NextAuth session

## Story Summary

**Epic:** 1 — Auth, Shell, and Navigation Foundation
**Story:** 1 — Sign-in page and NextAuth session

**As a** BetterBond payments administrator or real estate agency viewer
**I want to** sign in with credentials an admin provisioned for me
**So that** I can reach the Dashboard and the other screens my role is allowed to see.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- An unauthenticated visitor is always routed to the sign-in page before they can reach any authenticated screen.
- The sign-in page shows BetterBond branding, an email field, a password field, and a Sign In button.
- Valid admin credentials sign the user in and land them on the Dashboard.
- Valid viewer credentials sign the user in and land them on the Dashboard.
- The signed-in user's identity is visible in the app (so they can confirm who they are signed in as) and is captured for later use as the `LastChangedUser` audit value on batch creation.
- Invalid or incomplete credentials keep the user on the sign-in page with a plain-English error message and no session created.
- Signing out ends the session and returns the user to the sign-in page.
- A signed-in user who revisits the sign-in URL is silently sent to the Dashboard instead of being asked to sign in again.
- The session persists across browser restarts — for this POC there is no auto-timeout.
- The sign-in page must work on keyboard alone, be understandable by screen readers, and meet WCAG AA contrast in both light and dark themes.
- The codebase only recognizes two roles: admin and viewer. The starter template's four-role model is retired as part of this story.

## Key Decisions Surfaced by AI

The FRS is clear on the high-level auth model, but some reviewer-visible behaviors are not fully nailed down. These are flagged explicitly below so the BA can choose rather than leaving them to an implementer's default. No behavior in this document has been invented silently.

- Where the signed-in user's identity is displayed inside the app header.
- What exactly happens after a wrong password is submitted (inline error vs. toast, "Password" field cleared or preserved).
- Where the Sign Out control lives and how it looks.
- What password-field affordances are shown (e.g., show/hide toggle, auto-focus order, auto-complete attributes).
- What the sign-in page looks like on first visit when the user has never set a theme preference.

## Test Scenarios / Review Examples

### 1. Unauthenticated visitor is routed to sign-in on first visit

| Setup | Value |
| --- | --- |
| Active session | None |
| URL visited | `/` |

| Expected | Value |
| --- | --- |
| Landing page | Sign-in page |
| Visible elements | BetterBond branding, Email field, Password field, Sign In button |
| Current URL | `/auth/signin` |

---

### 2. Admin signs in with valid credentials

| Setup | Value |
| --- | --- |
| Active session | None |
| Provisioned user | `alice.admin@betterbond.example` / role = admin |

| Input | Value |
| --- | --- |
| Email | `alice.admin@betterbond.example` |
| Password | (correct password for Alice) |
| Action | Click Sign In |

| Expected | Value |
| --- | --- |
| Destination | Dashboard (`/dashboard`) |
| Session role | admin |
| Session identity | `alice.admin@betterbond.example` (or Alice's display name if configured) |
| Identity visible in header | Yes |

---

### 3. Viewer signs in with valid credentials

| Setup | Value |
| --- | --- |
| Active session | None |
| Provisioned user | `vera.viewer@agency.example` / role = viewer |

| Input | Value |
| --- | --- |
| Email | `vera.viewer@agency.example` |
| Password | (correct password for Vera) |
| Action | Click Sign In |

| Expected | Value |
| --- | --- |
| Destination | Dashboard (`/dashboard`) |
| Session role | viewer |
| Session identity | `vera.viewer@agency.example` (or Vera's display name if configured) |

---

### 4. Signed-in user's identity is captured as the audit value for batch creation

This scenario records the hand-off to Epic 3 (Initiate Payment). It verifies the session carries the identity Epic 3 will use.

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |

| Input | Value |
| --- | --- |
| Action | Any code path that records "last changed by" reads the session identity |

| Expected | Value |
| --- | --- |
| Identity value exposed on session | `alice.admin@betterbond.example` (email or configured display name — see BA-1) |

> **BA decision resolved — Option A (BA-1):** When both email and a separate display name are available for a user, which value should be exposed as the session's "LastChangedUser" audit identity?
>
> Options:
> - Option A: Always use the email address (simple, unambiguous, guaranteed unique).
> - Option B: Prefer the display name when present, fall back to the email when not.
> - Option C: Always use the display name — require every provisioned user to have one.
> Resolution: Option A approved 2026-04-23 by user.

---

### 5. Invalid credentials keep the user on the sign-in page

| Setup | Value |
| --- | --- |
| Active session | None |

| Input | Value |
| --- | --- |
| Email | `alice.admin@betterbond.example` |
| Password | (wrong password) |
| Action | Click Sign In |

| Expected | Value |
| --- | --- |
| Current URL | `/auth/signin` (unchanged) |
| Error message visible | "The email or password is incorrect" (plain English, on the form) |
| Session | None created |
| Email field value | `alice.admin@betterbond.example` (preserved so the user can retry) |
| Password field value | See BA-2 |

> **BA decision resolved — Option A (BA-2):** After a failed sign-in, should the Password field be cleared or left as the user typed it?
>
> Options:
> - Option A: Clear the password after a failed attempt (safer if someone glances at the screen).
> - Option B: Leave the password populated (friendlier — the user can correct a typo without retyping).
> Resolution: Option A approved 2026-04-23 by user.

---

### 6. Empty form submission shows field-level validation

| Setup | Value |
| --- | --- |
| Active session | None |

| Input | Value |
| --- | --- |
| Email | (blank) |
| Password | (blank) |
| Action | Click Sign In |

| Expected | Value |
| --- | --- |
| Current URL | `/auth/signin` (unchanged) |
| Email field | Shows "Email is required" next to it |
| Password field | Shows "Password is required" next to it |
| No sign-in request made | (no authentication attempt against the credentials store) |

---

### 7. Authentication request fails due to server being unreachable

| Setup | Value |
| --- | --- |
| Active session | None |
| Auth backend | Unreachable (simulated network failure) |

| Input | Value |
| --- | --- |
| Email | `alice.admin@betterbond.example` |
| Password | (any) |
| Action | Click Sign In |

| Expected | Value |
| --- | --- |
| Current URL | `/auth/signin` (unchanged) |
| Error message visible | "Sign-in could not be completed. Please try again." (plain English, on the form) |
| Email field value | Preserved |
| Password field value | See BA-2 (same rule as invalid credentials) |

---

### 8. Already-signed-in user who revisits the sign-in URL is redirected to the Dashboard

| Setup | Value |
| --- | --- |
| Active session | `alice.admin@betterbond.example` (admin) |

| Input | Value |
| --- | --- |
| URL visited | `/auth/signin` |

| Expected | Value |
| --- | --- |
| Current URL | `/dashboard` |
| Sign-in form rendered | No (user is redirected before the form appears) |

---

### 9. Session persists across browser restart (no auto-timeout)

| Setup | Value |
| --- | --- |
| Initial state | User has signed in as `vera.viewer@agency.example` and closed the browser |
| Browser reopened | A later session on the same machine |

| Input | Value |
| --- | --- |
| URL visited | `/` |

| Expected | Value |
| --- | --- |
| Landing page | Dashboard (`/dashboard`) — no sign-in prompt |
| Session still active | Yes |
| Session role | viewer |

---

### 10. Signing out ends the session and returns the user to sign-in

| Setup | Value |
| --- | --- |
| Active session | `alice.admin@betterbond.example` (admin) |

| Input | Value |
| --- | --- |
| Action | Click Sign Out |

| Expected | Value |
| --- | --- |
| Destination | Sign-in page (`/auth/signin`) |
| Session after | None |
| Revisiting `/dashboard` now | Redirects back to sign-in (session gone) |

## Edge and Alternate Examples

### Role model reconciliation (codebase-wide check)

| Input | Value |
| --- | --- |
| Search the codebase for role literals | `ADMIN`, `POWER_USER`, `STANDARD_USER`, `READ_ONLY`, `admin`, `viewer` |

| Expected | Value |
| --- | --- |
| Remaining role values | `admin`, `viewer` only |
| Remaining template roles | None — `POWER_USER`, `STANDARD_USER`, `READ_ONLY` are removed or renamed |
| RoleGate / role check sites | All reference only `admin` or `viewer` |

### Keyboard-only sign-in

| Input | Value |
| --- | --- |
| Device | Keyboard only (no mouse) |
| Action | Tab to Email → type → Tab to Password → type → Tab to Sign In → press Enter |

| Expected | Value |
| --- | --- |
| Flow completes | Yes — user signs in successfully |
| Focus indicator | Visible at every step |
| No step requires mouse | Confirmed |

### Screen reader labeling

| Input | Value |
| --- | --- |
| Assistive tech | Screen reader (e.g., NVDA, VoiceOver) |
| Fields encountered | Email, Password, Sign In |

| Expected | Value |
| --- | --- |
| Email field | Announced as "Email, edit text" (or equivalent) |
| Password field | Announced as "Password, edit text, protected" (or equivalent) |
| Sign In button | Announced as "Sign In, button" |
| Form errors | Announced when shown |

### WCAG 2.1 AA contrast in both themes

| Input | Value |
| --- | --- |
| Element | Email label on its background |
| Theme A | Light |
| Theme B | Dark |

| Expected | Value |
| --- | --- |
| Light-mode contrast | ≥ 4.5:1 |
| Dark-mode contrast | ≥ 4.5:1 |
| Sign In button text | ≥ 4.5:1 in both themes |
| Focus outline visible | Yes, ≥ 3:1 in both themes |

### First-ever visit: what theme loads on the sign-in page?

| Setup | Value |
| --- | --- |
| localStorage | Empty (user has never visited before) |
| OS preference | (variable — user's system setting) |

| Expected | Value |
| --- | --- |
| Theme applied on first paint | See BA-3 |

> **BA decision resolved — Option C (BA-3):** For a first-time visitor with no saved theme preference, which theme should the sign-in page (and the rest of the app) default to?
>
> Options:
> - Option A: Always light mode (predictable, matches the MortgageMax primary brand).
> - Option B: Follow the user's OS preference (light/dark) on first visit, then persist once they interact with the toggle.
> - Option C: Always dark mode.
> Resolution: Option C approved 2026-04-23 by user.

### Where is Sign Out exposed?

> **BA decision resolved — Option B (BA-4):** Where does the Sign Out control live in the authenticated shell?
>
> Options:
> - Option A: A dedicated "Sign Out" link/button visible in the top nav on every page.
> - Option B: Inside a user menu (avatar or name) that opens a dropdown containing Sign Out.
> - Option C: Only in the footer, alongside the Reset Demo button.
>
> This choice also governs AC-9 ("Given I have signed in, when I click Sign Out, then my session ends and I am returned to the sign-in page"): wherever the control lives, it must work from every authenticated page.
> Resolution: Option B approved 2026-04-23 by user.

## Out of Scope / Not For This Story

- Password reset, forgot password, or email verification flows.
- Public self-signup — explicitly not offered (R41).
- Multi-factor authentication, remember-me toggles, or session revocation UI.
- Rate limiting or lockout after N failed attempts.
- Auditing of sign-in events — only batch creation requires an audit value (captured here), not sign-in itself.
- Any Dashboard, Payment Management, Payments Made, or Users content — only the redirect destination is in scope. The actual content of those screens belongs to later epics.
- Choosing or populating the first Dashboard data set after sign-in.
