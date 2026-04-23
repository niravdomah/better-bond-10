# Test Design: Application shell and responsive layout

## Story Summary

**Epic:** 1 — Auth, Shell, and Navigation Foundation
**Story:** 2 — Application shell and responsive layout

**As an** authenticated admin or viewer
**I want to** have every screen I visit share the same top navigation, main content region, and footer
**So that** I always know where I am in the app and can move around consistently on any device.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- Every authenticated screen renders inside a common frame with three visible regions: a top navigation bar, a main content region, and a footer.
- The top nav and footer stay in place when the user moves between authenticated screens — only the main content region changes.
- The BetterBond branding is visible on the left side of the top nav on every authenticated screen.
- A Sign Out control is reachable from the authenticated shell on every screen and every viewport size (its precise placement was decided in Story 1.1 — BA-4: Option B, inside a user menu).
- The shell adapts to three viewport breakpoints: 375px mobile, 768px tablet, 1280px+ desktop. Nothing overflows horizontally at any of them.
- On mobile, the top nav collapses to a menu button (hamburger-style affordance) so navigation still fits without horizontal scrolling.
- On tablet and desktop, the nav items are visible inline without a menu expander being required.
- Unauthenticated visitors who try to reach any protected route (e.g., `/dashboard`) are redirected to the sign-in page instead of being allowed to see the shell.
- After signing in from the redirect, the user lands on the Dashboard (`/dashboard`) regardless of which protected URL they originally tried to open. This is a deliberate FRS rule, not a "return to origin" flow.
- The shell renders identically on the latest stable Chrome, Edge, and Firefox on desktop.
- The shell is fully keyboard-operable: tab order moves through nav → main → footer in a logical reading order with no traps.
- The top nav is announced as a `navigation` landmark, the main region as a `main` landmark, and the footer as a `contentinfo` landmark by screen readers.
- Nav text, footer text, and focus outlines meet WCAG 2.1 AA contrast in both light and dark themes.
- This story sets up the empty regions only. Populating the nav with role-aware links (Story 1.3), the footer with Reset Demo (Story 1.7), the toast container (Story 1.6), and the theme switcher (Story 1.5) happens in later stories.

## Key Decisions Surfaced by AI

The FRS and story are clear on the shell regions and breakpoints, but some reviewer-visible behaviors are not fully nailed down. These are flagged explicitly below so the BA can choose rather than leaving them to an implementer's default.

- On mobile (375px), how does the collapsed nav open — a tap of a menu button that opens a dropdown, a tap that opens a full-screen sheet, or a persistent icon row?
- When the nav is collapsed on mobile, is the Sign Out control visible without opening the menu (e.g., as a persistent avatar button in the top nav bar), or does the user have to open the menu first?
- Does the footer stay pinned to the bottom of the viewport on short pages (sticky footer), or does it appear right after the main content and be scrolled off-screen on long pages?
- What does the empty shell look like between routes — does the main content region show a skeleton/loading indicator while a new route loads, or does it stay blank until the new content paints?

## Test Scenarios / Review Examples

### 1. Authenticated page shows all three shell regions

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| URL visited | `/dashboard` |

| Expected | Value |
| --- | --- |
| Top navigation bar | Visible at the top of the page |
| Main content region | Visible below the nav, rendering the Dashboard content |
| Footer | Visible at the bottom of the page |
| Branding visible in top nav | BetterBond branding on the left side |
| Sign Out reachable | Yes (per BA-4 from Story 1.1, inside the user menu in the top nav) |

---

### 2. Shell persists across navigation — only main region changes

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| Starting page | `/dashboard` |

| Input | Value |
| --- | --- |
| Action | Navigate to another authenticated page (e.g., click a nav link to Payment Management) |

| Expected | Value |
| --- | --- |
| Top nav after navigation | Same nav bar, same position, same branding — not re-rendered from scratch |
| Footer after navigation | Same footer, same position |
| Main content region | Updated to show the new page's content |
| Scroll position reset | Main region starts at top of new content |

---

### 3. Dashboard content renders inside the shell's main region

| Setup | Value |
| --- | --- |
| Signed-in user | `vera.viewer@agency.example` (viewer) |
| URL visited | `/dashboard` |

| Expected | Value |
| --- | --- |
| Dashboard heading/metric cards | Rendered inside the shell's main region (not above or outside it) |
| Top nav above Dashboard | Yes |
| Footer below Dashboard | Yes |

---

### 4. Mobile viewport (375px) — nav collapses and nothing overflows

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| Viewport width | 375px (mobile) |
| URL visited | `/dashboard` |

| Expected | Value |
| --- | --- |
| Top nav shape | Collapsed — a menu button (hamburger-style) is visible instead of full nav links |
| Branding | Still visible in the collapsed top nav |
| Horizontal scrollbar on `<body>` | None — nothing overflows horizontally |
| Main region width | Fills available viewport minus padding, no horizontal overflow |
| Footer width | Fits within viewport |

> **BA decision resolved — Option A (BA-1):** On a 375px mobile viewport, how should the collapsed top nav behave when tapped?
>
> Options:
> - Option A: Menu button opens an anchored dropdown below the top nav showing the nav links and the user menu.
> - Option B: Menu button opens a full-screen sheet (slide-in panel) that covers the main content until dismissed.
> - Option C: A persistent horizontal icon row with no menu button — each nav item is always visible as a small icon even on 375px.
> Resolution: Option A approved 2026-04-23 by user.

---

### 5. Mobile viewport — Sign Out is still reachable

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| Viewport width | 375px (mobile) |
| URL visited | `/dashboard` |

| Input | Value |
| --- | --- |
| Action | User attempts to sign out |

| Expected | Value |
| --- | --- |
| Sign Out reachable | Yes, from the current (mobile) shell |
| Mechanism | Per BA-2 below |

> **BA decision resolved — Option B (BA-2):** On mobile (375px), where does Sign Out live relative to the collapsed nav?
>
> Options:
> - Option A: Sign Out lives inside the collapsed menu — the user must open the menu first, then tap Sign Out.
> - Option B: Sign Out stays visible in the top nav bar at all times (e.g., avatar button on the right of the menu button) so the user can sign out without opening the menu.
> - Option C: Sign Out lives in the footer on mobile, so it's always reachable by scrolling to the bottom of the page.
> Resolution: Option B approved 2026-04-23 by user.

---

### 6. Tablet viewport (768px) — nav is usable without horizontal scroll

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| Viewport width | 768px (tablet) |
| URL visited | `/dashboard` |

| Expected | Value |
| --- | --- |
| Top nav shape | Either fully inline nav OR collapsed menu — whichever fits without horizontal scroll at this width |
| Horizontal scrollbar | None |
| Main region | Readable content width, no horizontal overflow |
| Footer | Fits within viewport |

---

### 7. Desktop viewport (1280px) — full nav is visible inline

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| Viewport width | 1280px (desktop) |
| URL visited | `/dashboard` |

| Expected | Value |
| --- | --- |
| Top nav shape | Full nav links visible inline, no menu expander needed |
| Branding | Visible on the left of the nav |
| Sign Out affordance | Visible on the right of the nav (user menu per BA-4 from Story 1.1) |
| Main region max width | Comfortable reading width; no awkward stretching on 1920px+ screens |

---

### 8. Unauthenticated user hitting a protected URL is redirected to sign-in

| Setup | Value |
| --- | --- |
| Active session | None |
| URL visited | `/dashboard` (direct navigation, e.g., bookmark) |

| Expected | Value |
| --- | --- |
| Final URL | `/auth/signin` |
| Shell rendered | No — the sign-in page (not the authenticated shell) is shown |
| Protected content flash | None — the user never sees the Dashboard content, even briefly |

---

### 9. Sign-in from a protected URL redirect lands on Dashboard (not the original URL)

| Setup | Value |
| --- | --- |
| Active session | None |
| User tried to reach | `/payment-management` (got redirected to `/auth/signin`) |

| Input | Value |
| --- | --- |
| Action | User enters valid admin credentials and clicks Sign In |

| Expected | Value |
| --- | --- |
| Landing page | Dashboard (`/dashboard`) |
| Not landing page | `/payment-management` — the FRS specifies Dashboard as the post-sign-in destination, regardless of where the user tried to go |

---

### 10. Navigation region order matches reading order for keyboard users

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| Viewport | Desktop (1280px) |
| URL | `/dashboard` |

| Input | Value |
| --- | --- |
| Device | Keyboard only |
| Action | Tab forward from the first focusable element onward |

| Expected | Value |
| --- | --- |
| Focus order | Top nav items → main content's focusable elements → footer's focusable elements |
| Focus trap | None at any region boundary |
| Focus indicator | Visible at every step |

## Edge and Alternate Examples

### Screen reader announces the three landmarks

| Input | Value |
| --- | --- |
| Assistive tech | Screen reader (e.g., NVDA, VoiceOver) |
| Action | User navigates by landmark |

| Expected | Value |
| --- | --- |
| Top nav landmark | Announced as a `navigation` landmark |
| Main region landmark | Announced as the `main` landmark |
| Footer landmark | Announced as a `contentinfo` landmark |
| Landmark count on page | Exactly one of each (no duplicates from child routes) |

### WCAG 2.1 AA contrast in both themes

| Input | Value |
| --- | --- |
| Elements | Nav link text, footer text, focus outline on nav items |
| Theme A | Light |
| Theme B | Dark (per BA-3 from Story 1.1, this is the default on first visit) |

| Expected | Value |
| --- | --- |
| Nav text contrast | ≥ 4.5:1 in both themes |
| Footer text contrast | ≥ 4.5:1 in both themes |
| Focus outline contrast | ≥ 3:1 in both themes |
| Branding legible | Yes in both themes |

### Cross-browser parity

| Input | Value |
| --- | --- |
| Browsers | Latest stable Chrome, Edge, Firefox (desktop) |
| URL | `/dashboard` |

| Expected | Value |
| --- | --- |
| Top nav layout | Identical (same regions, same breakpoint behavior) |
| Typography | Identical fonts and sizes |
| Interactive controls | Nav links, Sign Out control all usable in all three browsers |

### Footer placement on short pages

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| URL | A page with very little main content (e.g., an empty-state page) |

| Expected | Value |
| --- | --- |
| Footer position | Per BA-3 below |

> **BA decision resolved — Option A (BA-3):** On pages where the main content is shorter than the viewport, where does the footer sit?
>
> Options:
> - Option A: Footer stays pinned to the bottom of the viewport (sticky footer — common on chrome-heavy apps).
> - Option B: Footer appears immediately below the main content, even if that leaves empty space between the footer and the bottom of the viewport.
> - Option C: Footer is always positioned at the bottom of the page (scrolls off-screen on long pages, sits at the viewport bottom on short pages — the default browser behavior with `min-height: 100vh` layout).
> Resolution: Option A approved 2026-04-23 by user.

### Route transition visual feedback

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| Starting page | `/dashboard` |

| Input | Value |
| --- | --- |
| Action | Click a nav link to another authenticated route |

| Expected | Value |
| --- | --- |
| Visual feedback during transition | Per BA-4 below |

> **BA decision resolved — Option A (BA-4):** While a new authenticated route is loading, what does the main content region show?
>
> Options:
> - Option A: A skeleton/loading indicator appears in the main region while the next route's data loads.
> - Option B: The main region stays blank (empty) until the new content paints.
> - Option C: The previous page's content stays visible until the new page is ready to paint (no visible transition).
> Resolution: Option A approved 2026-04-23 by user.

## Out of Scope / Not For This Story

- Populating the top nav with Dashboard / Payment Management / Payments Made / Users links — that's Story 1.3 (role-aware nav).
- Mounting the theme switcher into the top nav — that's Story 1.5.
- Mounting the toast container into the shell — that's Story 1.6.
- Populating the footer with the Reset Demo button — that's Story 1.7.
- The route guard's redirect mechanism for unauthenticated visitors (implementation details). AC-8 verifies the observable behavior here; the full route-guard policy is covered in Story 1.4.
- The specific visual design (colors, typography, spacing) — those are governed by the MortgageMax palette in `design-tokens.css`. This story verifies structure and responsiveness, not pixel-level design.
- Any Dashboard content (charts, tiles, agency grid). AC-3 verifies the Dashboard renders inside the main region; the Dashboard itself belongs to Epic 2.
- Internet Explorer, Safari mobile, or any browser outside NFR5 (Chrome, Edge, Firefox on desktop).
- Landscape mobile or viewport widths between the named breakpoints — the three named breakpoints are the verification targets.
