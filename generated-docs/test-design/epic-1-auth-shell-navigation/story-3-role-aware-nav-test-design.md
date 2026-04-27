# Test Design: Role-aware navigation links and active state

## Story Summary

**Epic:** 1 — Auth, Shell, and Navigation Foundation
**Story:** 3 — Role-aware navigation links and active state

**As an** authenticated admin or viewer
**I want to** see in the top nav exactly the screens I have access to, with my current screen clearly highlighted
**So that** I can move between my permitted screens without seeing or guessing at links I am not allowed to use.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- The top nav displays a list of links to named screens. The list the user sees depends on their role.
- An admin sees four links in the top nav: Dashboard, Payment Management, Payments Made, and Users.
- A viewer sees two links in the top nav: Dashboard and Payments Made.
- Admin-only links (Payment Management, Users) are not rendered at all for viewers — they are hidden, not merely disabled or dimmed.
- The link whose target screen the user is currently on is visually distinguished from the other links (e.g., distinct color, underline, or bold weight consistent with the MortgageMax palette).
- Exactly one nav link is marked as the current page at any given time; when the user is on a screen that matches a nav link, that one is the active one.
- When the user navigates from one screen to another via a nav link, the page transitions without a full-page reload (client-side routing).
- Clicking the link for the screen the user is already on keeps them on that page with no error.
- Every visible nav link is reachable by keyboard tab and activatable with Enter, in the same visual left-to-right order.
- Screen readers announce each link by its visible text and announce the active link as the current page (via `aria-current="page"` or equivalent).
- The active-link highlight itself meets WCAG 2.1 AA contrast (3:1 for the visual indicator, 4.5:1 for text) against the nav background in both light and dark themes.
- Link visibility is a UX concern, not a security boundary — a viewer who types `/payment-management` into the URL bar is still redirected away by Story 1.4's route guard, even though the link is hidden from their nav.

## Key Decisions Surfaced by AI

The story spells out the link list, the active-state requirement, and the accessibility expectations. A few BA-visible questions remain where multiple reasonable business choices exist — these are surfaced explicitly rather than chosen by the implementer.

- When an admin is on a screen that is not one of the four named nav targets (e.g., a future Settings page, or a deep link like `/payment-management/batch/123`), what should the nav show as active — the closest parent link, nothing, or something else?
- On mobile (375px), the links move inside the collapsed menu dropdown (per Story 1.2 BA-1 Option A). Should the active-state highlight look the same in the dropdown as in the inline desktop nav, or a subtler variant (e.g., a leading checkmark or left border) appropriate to a menu listbox?
- The Users link label — the FRS says "Users" (R5, R39). Should the link text read "Users" or "User Management"? (The admin-facing epic uses both phrasings in different places.)

## Test Scenarios / Review Examples

### 1. Admin sees all four nav links

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| URL visited | `/dashboard` |
| Viewport | Desktop (1280px) |

| Expected | Value |
| --- | --- |
| Nav link 1 | Dashboard (visible, links to `/dashboard`) |
| Nav link 2 | Payment Management (visible, links to `/payment-management`) |
| Nav link 3 | Payments Made (visible, links to `/payments-made`) |
| Nav link 4 | Users (visible, links to `/users`) |
| Link count | Exactly four |
| Link order | Dashboard, Payment Management, Payments Made, Users (left-to-right) |

---

### 2. Viewer sees only Dashboard and Payments Made

| Setup | Value |
| --- | --- |
| Signed-in user | `vera.viewer@agency.example` (viewer) |
| URL visited | `/dashboard` |
| Viewport | Desktop (1280px) |

| Expected | Value |
| --- | --- |
| Nav link 1 | Dashboard (visible, links to `/dashboard`) |
| Nav link 2 | Payments Made (visible, links to `/payments-made`) |
| Link count | Exactly two |
| Link order | Dashboard, Payments Made |

---

### 3. Viewer does not see the Payment Management link at all

| Setup | Value |
| --- | --- |
| Signed-in user | `vera.viewer@agency.example` (viewer) |
| URL visited | `/dashboard` |

| Expected | Value |
| --- | --- |
| "Payment Management" text in nav | Not present in the DOM (not rendered, not merely `aria-hidden`) |
| "Payment Management" link element | None queryable by accessible name |

---

### 4. Viewer does not see the Users link at all

| Setup | Value |
| --- | --- |
| Signed-in user | `vera.viewer@agency.example` (viewer) |
| URL visited | `/dashboard` |

| Expected | Value |
| --- | --- |
| "Users" text in nav | Not present in the DOM |
| "Users" link element | None queryable by accessible name |

---

### 5. Dashboard link is active when on the Dashboard

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| URL visited | `/dashboard` |

| Expected | Value |
| --- | --- |
| "Dashboard" link | Visually highlighted (distinct styling consistent with MortgageMax palette — color, underline, or bold) |
| "Dashboard" link `aria-current` | `"page"` |
| Payment Management, Payments Made, Users links | Rendered in the normal (non-active) style |
| Number of links marked as current | Exactly one |

---

### 6. Payment Management link is active when on Payment Management (admin)

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| URL visited | `/payment-management` |

| Expected | Value |
| --- | --- |
| "Payment Management" link | Visually highlighted and `aria-current="page"` |
| Dashboard, Payments Made, Users links | Rendered in the normal style, no `aria-current` |
| Number of links marked as current | Exactly one |

---

### 7. Payments Made link is active when on Payments Made

| Setup | Value |
| --- | --- |
| Signed-in user | `vera.viewer@agency.example` (viewer) |
| URL visited | `/payments-made` |

| Expected | Value |
| --- | --- |
| "Payments Made" link | Visually highlighted and `aria-current="page"` |
| "Dashboard" link | Rendered in the normal style, no `aria-current` |
| Number of links marked as current | Exactly one |

---

### 8. Users link is active when on the Users screen (admin)

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| URL visited | `/users` |

| Expected | Value |
| --- | --- |
| "Users" link | Visually highlighted and `aria-current="page"` |
| Dashboard, Payment Management, Payments Made links | Rendered in the normal style, no `aria-current` |
| Number of links marked as current | Exactly one |

---

### 9. Clicking a nav link navigates without a full-page reload

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| Starting URL | `/dashboard` |

| Input | Value |
| --- | --- |
| Action | User clicks the "Payments Made" nav link |

| Expected | Value |
| --- | --- |
| New URL | `/payments-made` |
| Page transition | Client-side (no full document reload — the browser does not re-request the HTML shell) |
| Top nav DOM identity | Same `<nav>` element (not re-mounted) |
| Active link after navigation | "Payments Made" (previously "Dashboard" was active) |

---

### 10. Clicking the active link stays on the same page

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| Current URL | `/dashboard` |

| Input | Value |
| --- | --- |
| Action | User clicks the "Dashboard" nav link |

| Expected | Value |
| --- | --- |
| URL after click | `/dashboard` (unchanged) |
| Error shown | None |
| Active link | Still "Dashboard" |

## Edge and Alternate Examples

### Keyboard tab order matches visual order

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| Viewport | Desktop (1280px) |
| URL | `/dashboard` |

| Input | Value |
| --- | --- |
| Device | Keyboard only |
| Action | Tab forward from the branding element |

| Expected | Value |
| --- | --- |
| Tab stop 1 | Dashboard link |
| Tab stop 2 | Payment Management link |
| Tab stop 3 | Payments Made link |
| Tab stop 4 | Users link |
| Enter on focused link | Navigates to that link's target |
| Focus indicator | Visible on every link when focused |

---

### Screen reader announces the active link as the current page

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| URL | `/payment-management` |
| Assistive tech | Screen reader (e.g., NVDA, VoiceOver) |

| Input | Value |
| --- | --- |
| Action | User navigates the top nav with their screen reader |

| Expected | Value |
| --- | --- |
| Dashboard link announcement | "Dashboard, link" |
| Payment Management link announcement | "Payment Management, link, current page" (or the screen reader's equivalent for `aria-current="page"`) |
| Payments Made link announcement | "Payments Made, link" |
| Users link announcement | "Users, link" |

---

### Active-link highlight meets WCAG contrast in both themes

| Input | Value |
| --- | --- |
| Elements | Active-link text and active-link visual indicator (e.g., underline, background, or border) |
| Theme A | Light |
| Theme B | Dark |

| Expected | Value |
| --- | --- |
| Active-link text contrast | ≥ 4.5:1 against the nav background in both themes |
| Active-link visual-indicator contrast | ≥ 3:1 against the nav background in both themes |
| Non-active link text contrast | ≥ 4.5:1 against the nav background in both themes |
| Highlight visually distinguishable from hover | Yes (active state reads as "I am here", hover reads as "clickable") |

---

### Mobile (375px) — links live inside the collapsed menu dropdown

| Setup | Value |
| --- | --- |
| Signed-in user | `alice.admin@betterbond.example` (admin) |
| Viewport | 375px (mobile) |
| URL | `/dashboard` |

| Input | Value |
| --- | --- |
| Action | Tap the menu button in the top nav |

| Expected | Value |
| --- | --- |
| Dropdown contents | Dashboard, Payment Management, Payments Made, Users (all four links, admin view) |
| Active link in dropdown | Dashboard (per BA-2 below — same visual treatment as inline nav) |
| Dropdown-visible for viewer | Dashboard, Payments Made only |
| Tapping a link | Navigates to that link's target and closes the dropdown |

> **BA decision resolved — Option C (BA-1):** When the user is on a route that isn't one of the four named nav targets (for example a future Settings page, or a deep sub-route like `/payment-management/batch/123`), what should the nav show as active?
>
> Options:
> - Option A: Match by URL prefix — `/payment-management/*` highlights the Payment Management link; unknown routes highlight nothing.
> - Option B: Exact-match only — the link is only active when the URL is exactly one of `/dashboard`, `/payment-management`, `/payments-made`, `/users`. Deep routes and unknown routes highlight nothing.
> - Option C: Always highlight the nearest parent link, falling back to Dashboard when nothing matches.
> Resolution: Option C approved 2026-04-23 by user.

> **BA decision resolved — Option B (BA-2):** Inside the mobile (375px) dropdown, should the active-link highlight look the same as in the desktop inline nav, or a menu-list variant?
>
> Options:
> - Option A: Same highlight — the active link uses the same color/underline/weight treatment in the dropdown as on desktop. Consistency wins.
> - Option B: Menu-list variant — in the dropdown the active link uses a subtler indicator (e.g., a leading checkmark icon or a left-border stripe) that reads more naturally in a vertical list.
> - Option C: No visual highlight inside the dropdown — rely on `aria-current="page"` only, since the dropdown is a transient affordance and the URL is the ground truth.
> Resolution: Option B approved 2026-04-23 by user.

> **BA decision resolved — Option A (BA-3):** What should the Users nav link's visible text read?
>
> Options:
> - Option A: "Users" — matches the FRS R5/R39 phrasing and keeps the label short.
> - Option B: "User Management" — matches the epic/wireframe phrasing and is more descriptive for admin users.
> - Option C: "Team" — shorter still and more common in admin apps, but diverges from BetterBond's own FRS language.
> Resolution: Option A approved 2026-04-23 by user.

## Out of Scope / Not For This Story

- The actual route guard that redirects a viewer who types `/payment-management` or `/users` into the URL bar — that is Story 1.4. This story hides the links from the nav; Story 1.4 enforces the URL-level block.
- Any behavior inside the target screens (Dashboard charts, Payment Management grid, Payments Made batch list, Users CRUD). This story only verifies the nav presentation and click-through.
- The theme switcher control itself — that is Story 1.5. This story verifies that the nav's active-link highlight works in whichever theme is active, not how the user toggles themes.
- The Reset Demo button in the footer — that is Story 1.7.
- Toast notifications surfaced by nav actions — that is Story 1.6.
- Any "return-to-origin after sign-in" behavior — Story 1.2 already established that all sign-ins land on `/dashboard` regardless of the original URL.
- Breadcrumbs or secondary navigation inside a screen — not in scope for any Epic 1 story.
- Distinguishing the nav's hover, focus, and active states beyond ensuring they are all distinct and visible (pixel-level visual design belongs to the style spec, not this story).
