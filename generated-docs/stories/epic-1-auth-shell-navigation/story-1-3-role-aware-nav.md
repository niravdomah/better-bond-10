# Story: Role-aware navigation links and active state

**Epic:** Auth, Shell, and Navigation Foundation | **Story:** 3 of 7 | **Wireframe:** [screen-2-dashboard.md](../../specs/wireframes/screen-2-dashboard.md) (top nav visible on every screen)

**Role:** All Roles (admin and viewer — with role-filtered link visibility)

**Requirements:** [R4](../../specs/feature-requirements.md#navigation), [R5](../../specs/feature-requirements.md#navigation), [R6](../../specs/feature-requirements.md#navigation), [R40](../../specs/feature-requirements.md#user-management-admin-only), [NFR1](../../specs/feature-requirements.md#non-functional-requirements), [NFR2](../../specs/feature-requirements.md#non-functional-requirements)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `N/A` (navigation component rendered by the shell) |
| **Target File** | `web/src/app/(protected)/layout.tsx` (and a dedicated `components/nav/TopNav.tsx` composition) |
| **Page Action** | `modify_existing` |

## User Story
**As an** authenticated admin or viewer **I want** the top navigation to show me exactly the screens I have access to, highlighting the one I am currently on **So that** I can move between my permitted screens without seeing or guessing at links I am not allowed to use.

## Acceptance Criteria

### Happy Path — shared links
- [ ] AC-1: Given I am signed in as an admin, when I look at the top nav, then I see links for Dashboard, Payment Management, Payments Made, and Users
- [ ] AC-2: Given I am signed in as a viewer, when I look at the top nav, then I see links for Dashboard and Payments Made only
- [ ] AC-3: Given I am signed in as a viewer, when I look at the top nav, then I do not see a Payment Management link at all (the link is hidden, not merely disabled)
- [ ] AC-4: Given I am signed in as a viewer, when I look at the top nav, then I do not see a Users link at all

### Active state
- [ ] AC-5: Given I am signed in, when I am on the Dashboard, then the Dashboard link is visually highlighted in the nav (e.g., distinct color, underline, or bold — in line with the MortgageMax palette)
- [ ] AC-6: Given I am signed in as an admin, when I am on the Payment Management screen, then the Payment Management link is visually highlighted in the nav
- [ ] AC-7: Given I am signed in, when I am on the Payments Made screen, then the Payments Made link is visually highlighted in the nav
- [ ] AC-8: Given I am signed in as an admin, when I am on the Users screen, then the Users link is visually highlighted in the nav

### Navigation behavior
- [ ] AC-9: Given I am signed in, when I click any nav link, then I navigate to that screen's route without a full-page reload
- [ ] AC-10: Given I am signed in, when I am on a screen and click its own nav link, then I stay on the same page without error

### Accessibility
- [ ] AC-11: Given I use only the keyboard, when I tab through the top nav, then I reach every visible link in reading order and can activate it with Enter
- [ ] AC-12: Given I use a screen reader, when I encounter the top nav, then each link announces its name (Dashboard, Payment Management, Payments Made, Users) and the currently active link is announced as the current page
- [ ] AC-13: Given I view the nav in either light or dark theme, when I look at the active link's highlight, then the highlight itself meets WCAG 2.1 AA contrast against the nav background (3:1 for the visual indicator, 4.5:1 for the text)

## API Endpoints (from OpenAPI spec)

No API calls — link visibility is derived entirely from the session's role claim established in Story 1.1.

## Implementation Notes

- **Depends on:** Story 1.1 (session exposes `role: "admin" | "viewer"`) and Story 1.2 (shell's top nav region exists).
- **Visibility vs. route guards:** Hiding links is a UX concern, not a security boundary. Story 1.4 enforces the actual access control at the middleware/layout level so that a viewer who guesses the URL still gets redirected. Do not rely on hidden links alone.
- **Active state detection:** Use Next.js's `usePathname` (client component for the nav) to compare the current route against each link's href. The link for the route that matches the pathname segment is the active one; `aria-current="page"` must be set on it.
- **Link list mapping:**
  - Dashboard → `/dashboard` — admin + viewer
  - Payment Management → `/payment-management` — admin only
  - Payments Made → `/payments-made` — admin + viewer
  - Users → `/users` — admin only
- **RoleGate reuse:** The template provides `web/src/components/RoleGate.tsx`. After Story 1.1 reduces the role enum to 2 values, reuse `RoleGate` (or an equivalent lightweight `useSession`-based check) to conditionally render admin-only links. Do not introduce a second role-check mechanism.
- **Wireframe reference:** `screen-2-dashboard.md` shows the intended link order (Dashboard, Payment Management, Payments Made, Users) and the active-state treatment.
