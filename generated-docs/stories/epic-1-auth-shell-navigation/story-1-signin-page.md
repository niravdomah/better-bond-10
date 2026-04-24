# Story: Sign-in page and NextAuth session

**Epic:** Auth, Shell, and Navigation Foundation | **Story:** 1 of 7 | **Wireframe:** [screen-1-sign-in.md](../../specs/wireframes/screen-1-sign-in.md)

**Role:** N/A (public sign-in page — no authenticated role required to reach it)

**Requirements:** [R1](../../specs/feature-requirements.md#authentication--session), [R2](../../specs/feature-requirements.md#authentication--session), [R3](../../specs/feature-requirements.md#authentication--session), [R41](../../specs/feature-requirements.md#user-management-admin-only), [NFR1](../../specs/feature-requirements.md#non-functional-requirements), [NFR2](../../specs/feature-requirements.md#non-functional-requirements), [NFR3](../../specs/feature-requirements.md#non-functional-requirements), [NFR7](../../specs/feature-requirements.md#non-functional-requirements), [NFR10](../../specs/feature-requirements.md#non-functional-requirements), [CR1](../../specs/feature-requirements.md#compliance--regulatory-requirements), [CR2](../../specs/feature-requirements.md#compliance--regulatory-requirements), [CR3](../../specs/feature-requirements.md#compliance--regulatory-requirements)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/auth/signin` |
| **Target File** | `web/src/app/auth/signin/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As a** BetterBond payments administrator or real estate agency viewer **I want** to sign in with credentials an admin provisioned for me **So that** I can reach the Dashboard and the other screens my role is allowed to see.

## Acceptance Criteria

### Happy Path
- [x] AC-1: Given I am not signed in, when I open the application, then I land on the sign-in page instead of any other screen
- [x] AC-2: Given I am on the sign-in page, when it loads, then I see the BetterBond branding, an email field, a password field, and a Sign In button
- [x] AC-3: Given I am on the sign-in page, when I enter valid credentials for an admin user and click Sign In, then I am taken to the Dashboard
- [x] AC-4: Given I am on the sign-in page, when I enter valid credentials for a viewer user and click Sign In, then I am taken to the Dashboard
- [x] AC-5: Given I have signed in, when I look at the page header, then my email or display name is visible so I can confirm which account I am using
- [x] AC-6: Given I have signed in as an admin, when the app makes any request that needs to record who initiated it, then my email or display name is used as the "last changed by" value (so that audit information is captured on batch creation in a later epic)

### Edge Cases
- [x] AC-7: Given I am already signed in, when I navigate to the sign-in URL directly, then I am redirected to the Dashboard instead of seeing the sign-in form again
- [x] AC-8: Given I have signed in, when I close the browser and reopen the app later, then my session is still active and I land directly on the Dashboard (no auto-timeout for this POC)
- [x] AC-9: Given I have signed in, when I click Sign Out, then my session ends and I am returned to the sign-in page

### Error Handling
- [x] AC-10: Given I am on the sign-in page, when I submit an empty email or password, then I see an inline validation message telling me which field is required
- [x] AC-11: Given I am on the sign-in page, when I enter incorrect credentials and click Sign In, then I see an inline error message on the form telling me the credentials were invalid, and I remain on the sign-in page
- [x] AC-12: Given I am on the sign-in page, when the authentication request fails because the server is unreachable, then I see an inline error telling me sign-in could not be completed and the form stays filled in so I can retry

### Accessibility
- [x] AC-13: Given I am on the sign-in page, when I use only the keyboard, then I can reach every field, the Sign In button, and any "show password" toggle, and activate them with Enter or Space
- [x] AC-14: Given I am on the sign-in page, when I use a screen reader, then each field has a clear label announced (email, password) and the Sign In button announces its purpose
- [x] AC-15: Given I view the sign-in page in either light or dark mode, when I look at field labels, input borders, and button text, then the contrast meets WCAG 2.1 AA

### Role model reconciliation
- [x] AC-16: Given the application is built, when any role-aware behavior runs, then only two roles exist in the codebase — admin and viewer — with no references to the template's four-role enum (ADMIN, POWER_USER, STANDARD_USER, READ_ONLY)

## API Endpoints (from OpenAPI spec)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| (NextAuth internal) | `/api/auth/callback/credentials` | NextAuth credentials provider callback — not a BetterBond backend endpoint |

**Note:** Sign-in itself does not call a BetterBond API in this POC — credentials are validated by NextAuth's credentials provider against admin-provisioned user records. No public self-signup endpoint is exposed (R41).

## Implementation Notes

- **FRS over template:** The template ships a multi-step sign-in page (`web/src/app/auth/signin/page.tsx`) and NextAuth config (`web/src/lib/auth/auth.ts`, `auth.config.ts`) with a 4-role enum in `web/src/types/roles.ts`. This story keeps NextAuth but replaces the template sign-in UI with BetterBond branding and reduces the role enum to exactly two roles: `admin` and `viewer` per R1 and the FRS User Roles table. Every downstream consumer (RoleGate, middleware, role checks) must be updated to the 2-role model in this story so later stories in the epic can rely on it.
- **Session shape:** The NextAuth session callback must expose the authenticated user's `role` (`"admin" | "viewer"`) and either `email` or a `displayName` that can be used as the `LastChangedUser` value. Epic 3 Story "Initiate Payment" depends on this value — do not leave it to Epic 3 to re-engineer.
- **User store:** Since the FRS and API spec do not describe a BetterBond users endpoint for authentication, credentials are validated against a local seed of admin-provisioned users for the POC. Seed at least one admin and one viewer account so reviewers can exercise role-based behavior end-to-end.
- **No session timeout:** Per NFR7, set the NextAuth session `maxAge` to a value that effectively disables auto-timeout for the POC (e.g., 30+ days). Explicit sign-out is the only way a session ends.
- **Responsive + themed:** The sign-in page uses the MortgageMax palette and must work in both themes. The theme switcher is introduced in Story 1.5; on the sign-in page, honor the persisted theme from localStorage (or default to light) so there is no flash of wrong theme.
- **Wireframe reference:** `generated-docs/specs/wireframes/screen-1-sign-in.md`.
