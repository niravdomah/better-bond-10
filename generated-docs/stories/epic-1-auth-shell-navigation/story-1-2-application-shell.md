# Story: Application shell and responsive layout

**Epic:** Auth, Shell, and Navigation Foundation | **Story:** 2 of 7 | **Wireframe:** [screen-2-dashboard.md](../../specs/wireframes/screen-2-dashboard.md) (shell visible on every authenticated screen)

**Role:** All Roles (admin and viewer)

**Requirements:** [R4](../../specs/feature-requirements.md#navigation), [NFR1](../../specs/feature-requirements.md#non-functional-requirements), [NFR2](../../specs/feature-requirements.md#non-functional-requirements), [NFR3](../../specs/feature-requirements.md#non-functional-requirements), [NFR4](../../specs/feature-requirements.md#non-functional-requirements), [NFR5](../../specs/feature-requirements.md#non-functional-requirements), [NFR10](../../specs/feature-requirements.md#non-functional-requirements)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `N/A` (shell component — applied to every route in the `(protected)` layout group) |
| **Target File** | `web/src/app/(protected)/layout.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As an** authenticated admin or viewer **I want** every screen I visit to share the same top navigation, main content region, and footer **So that** I always know where I am in the app and can move around consistently on any device.

## Acceptance Criteria

### Happy Path
- [ ] AC-1: Given I am signed in, when I visit any authenticated page, then I see a top navigation bar at the top, a main content region below it, and a footer at the bottom of the page
- [ ] AC-2: Given I am signed in, when I navigate between authenticated pages, then the top nav and footer remain in place and only the main content region changes
- [ ] AC-3: Given I am signed in, when I visit the Dashboard, then the Dashboard content renders inside the shell's main content region
- [ ] AC-4: Given I am signed in, when I look at the top nav, then I see the BetterBond branding on the left and a Sign Out control accessible within the top nav area

### Responsive layout
- [ ] AC-5: Given I view the app on a 375px-wide mobile viewport, when the shell renders, then the top nav collapses appropriately (e.g., menu button) and nothing overflows horizontally
- [ ] AC-6: Given I view the app on a 768px tablet viewport, when the shell renders, then the top nav, content, and footer are usable without horizontal scrolling
- [ ] AC-7: Given I view the app on a 1280px+ desktop viewport, when the shell renders, then the full navigation is visible inline without needing a menu expander

### Unauthenticated redirect
- [ ] AC-8: Given I am not signed in, when I try to visit any authenticated page directly (e.g., `/dashboard`), then I am redirected to the sign-in page instead of seeing the shell
- [ ] AC-9: Given I was redirected to sign-in from a protected page, when I successfully sign in, then I land on the Dashboard (not on the original protected page — the FRS specifies Dashboard as the post-sign-in destination)

### Browser support
- [ ] AC-10: Given I load the app on the latest stable Chrome, Edge, or Firefox, when the shell renders, then layout, typography, and interactive controls behave identically across all three

### Accessibility
- [ ] AC-11: Given I am on any authenticated page, when I use only the keyboard, then I can reach the top nav, content, and footer in a logical reading order without traps
- [ ] AC-12: Given I use a screen reader, when I visit any authenticated page, then the top nav is announced as a navigation landmark, the main content is announced as the main landmark, and the footer is announced as the content-info landmark
- [ ] AC-13: Given I view the shell in either light or dark theme, when I inspect nav text, footer text, and focus outlines, then contrast meets WCAG 2.1 AA (4.5:1 for text, 3:1 for UI components)

## API Endpoints (from OpenAPI spec)

No API calls originate from the shell itself — it is pure layout. Child routes (Dashboard, Payment Management, etc.) call their own endpoints.

## Implementation Notes

- **FRS over template:** The template provides a `(protected)` route group at `web/src/app/(protected)/layout.tsx`. Keep that structural pattern but replace whatever placeholder layout it currently renders with the BetterBond shell (top nav region, main region, footer region) matching the wireframes and the MortgageMax palette.
- **Shell structure only:** This story defines the shell — the empty top nav region, the main region, the footer region, and the responsive behavior. Populating the nav with role-aware links is Story 1.3. Populating the footer with the Reset Demo button is Story 1.7. Mounting the toast container into the shell is Story 1.6. Mounting the theme switcher into the top nav is Story 1.5.
- **Sign Out:** Since the shell always shows a way to sign out (AC-4), wire it to NextAuth's `signOut` helper in `web/src/lib/auth/auth.ts`. The control must be reachable on all viewport sizes.
- **Redirect behavior:** The existing `(protected)/layout.tsx` likely already checks session. Confirm it redirects unauthenticated visitors to `/auth/signin` and that post-sign-in lands on `/dashboard` per R2 — reconcile with the template's current behavior if it differs.
- **Responsive grid:** Use Tailwind CSS 4 breakpoints matching NFR4 (375px / 768px / 1280px+). Dense grids and filter bars on later screens will need mobile-friendly collapse, so the shell must leave room for those patterns (no hard-coded max widths that fight against card layouts on mobile).
- **Wireframe reference:** every screen wireframe under `generated-docs/specs/wireframes/` shows the shell as the outer frame; `screen-2-dashboard.md` is the clearest reference for proportions.
