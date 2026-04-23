# Test Handoff: Application shell and responsive layout

> Engineering document for downstream agents. Not reviewed by the BA.

**Source:** [story-2-application-shell-test-design.md](./story-2-application-shell-test-design.md)
**Epic:** 1 | **Story:** 2

## Coverage for WRITE-TESTS

Every AC from `generated-docs/stories/epic-1-auth-shell-navigation/story-1-2-application-shell.md` maps to at least one example in the test-design document.

- AC-1: Top nav, main region, and footer all visible on an authenticated page → Example 1
- AC-2: Top nav and footer persist across navigation; only main region changes → Example 2
- AC-3: Dashboard content renders inside the shell's main region → Example 3
- AC-4: Branding visible on left of top nav; Sign Out accessible from within top nav area → Example 1 (+ Example 7 on desktop, Example 5 on mobile — BA-2 governs mobile placement)
- AC-5: 375px mobile — nav collapses and nothing overflows → Example 4 (+ BA-1)
- AC-6: 768px tablet — nav, content, footer usable without horizontal scroll → Example 6
- AC-7: 1280px+ desktop — full nav visible inline, no menu expander → Example 7
- AC-8: Unauthenticated visitor to a protected URL is redirected to sign-in → Example 8
- AC-9: Post-sign-in destination is the Dashboard (not the originally requested URL) → Example 9
- AC-10: Latest stable Chrome, Edge, Firefox parity → Edge Example "Cross-browser parity"
- AC-11: Keyboard-only reaches nav, main, footer in logical order without traps → Example 10
- AC-12: Screen reader announces `navigation`, `main`, `contentinfo` landmarks → Edge Example "Screen reader announces the three landmarks"
- AC-13: WCAG 2.1 AA contrast in both themes → Edge Example "WCAG 2.1 AA contrast in both themes"

## Handoff Notes for WRITE-TESTS

- Only generate executable tests from examples in the test-design document. Do not invent behavior not represented there or explicitly approved.
- **Preferred render scope:** per-scenario.
  - AC-1, AC-2, AC-3, AC-4 (shell structure): render `(protected)/layout.tsx` with Vitest + React Testing Library, mocking the session to return an authenticated admin. Assert that the `<nav>`, `<main>`, and `<footer>` landmarks are present, and that a `children` slot renders inside `<main>`.
  - AC-2 (persistence across navigation): render the layout with two different child contents in sequence; assert the nav/footer DOM nodes have stable identities (React does not unmount them between route changes). This is best asserted by rendering the layout wrapper directly — Next.js App Router preserves the layout tree by design, so the test is really verifying we haven't introduced a child-of-layout anti-pattern.
  - AC-5, AC-6, AC-7 (responsive breakpoints): use `@testing-library/react` with viewport-size mocking via `window.matchMedia` (the NFR4 breakpoints are 375 / 768 / 1280). Assert that the correct nav variant is rendered (e.g., a menu button is present at 375px; full nav links are present at 1280px). The actual CSS layout (no horizontal overflow) cannot be verified in jsdom — see Runtime Verification Checklist.
  - AC-8, AC-9 (auth redirects): the redirect itself is a Next.js server-side / middleware concern. In Vitest, assert that the `(protected)/layout.tsx`'s server component calls the session guard and invokes `redirect('/auth/signin')` when no session exists. Do NOT attempt to render the layout through a full Next.js routing stack in jsdom — this is classified Runtime-only.
  - AC-10 (cross-browser): no automated Vitest coverage — this is entirely a manual runtime check.
  - AC-11 (keyboard order): use `userEvent.tab()` repeatedly against the rendered shell with a minimal child containing a focusable element; assert focus visits nav items, then the child's focusable element, then the footer's focusable element.
  - AC-12 (landmarks): assert via `getByRole('navigation')`, `getByRole('main')`, `getByRole('contentinfo')` that each landmark exists exactly once in the rendered shell.
  - AC-13 (contrast): use `@axe-core/react` or equivalent in Vitest for a coarse check, but know that jsdom cannot evaluate computed styles against the real MortgageMax palette. The authoritative contrast check is in the browser — see Runtime Verification Checklist.
- **Suggested primary assertions:**
  - The rendered `(protected)/layout.tsx` contains exactly one `<nav>`, one `<main>`, and one `<footer>` landmark when given an authenticated session.
  - At 375px viewport (mocked via `matchMedia`), a menu button (`getByRole('button', { name: /menu/i })` or equivalent) is present and the full nav-link list is NOT present.
  - At 1280px viewport, the full nav-link list is present and the menu button is NOT present.
  - The BetterBond branding element is rendered inside the `<nav>` and appears before the nav items in DOM order (left-most on LTR).
  - When the session is null, the server component calls the auth guard that redirects to `/auth/signin` — assert the guard call with a spy on the `redirect` helper (mocked from `next/navigation`).
  - Tabbing from the first focusable element reaches nav → child → footer in order, with no skipped regions and no traps.
- **Important ambiguity flags:**
  - Mobile nav open/close pattern (BA-1) — tests asserting the menu button's click behavior (what opens when it's tapped) must target whatever Option A/B/C resolution specifies. Until resolved, assert only that the button exists at 375px.
  - Mobile Sign Out placement (BA-2) — tests for "Sign Out is reachable at 375px" depend on this. Keep the assertion tolerant: "Sign Out is reachable somewhere in the rendered shell at 375px, directly or through one interaction with a visible control."
  - Sticky footer behavior (BA-3) — cannot be verified in jsdom regardless; flows into runtime verification only.
  - Route transition visual (BA-4) — affects Dashboard and subsequent stories more than the shell itself; this story's tests should not assert a specific transition, only that the main region slot renders its `children`.
- **FRS over template:** The template's `(protected)/layout.tsx` currently renders a placeholder layout (possibly a sidebar or default template chrome). The FRS requires a top-nav / main / footer structure. Tests target the FRS structure and will fail until the layout is replaced. That failure is expected during TDD red phase.

## Testability Classification

| Scenario | Category | Reason |
| --- | --- | --- |
| 1. Authenticated page shows all three shell regions | Unit-testable (RTL) | Render `(protected)/layout.tsx` with a mocked session; assert `getByRole('navigation')`, `getByRole('main')`, `getByRole('contentinfo')`. |
| 2. Shell persists across navigation — only main region changes | Unit-testable (RTL) | Render the layout wrapper with two different children in sequence; assert the nav/footer nodes have stable identity. The actual Next.js App Router layout-preservation is a framework contract, so the test verifies our own structural choice. |
| 3. Dashboard content renders inside the shell's main region | Unit-testable (RTL) | Render the layout with a `<div data-testid="child" />`; assert the child is a descendant of `getByRole('main')`. |
| 4. Mobile viewport (375px) — nav collapses and nothing overflows | Runtime-only | Two halves: (a) "menu button exists at 375px" is RTL-testable via `matchMedia` mock; (b) "nothing overflows horizontally" is a computed-style check jsdom cannot do reliably. Route the overflow half to Runtime. |
| 5. Mobile viewport — Sign Out is still reachable | Runtime-only | Depends on BA-2 resolution; in jsdom we can assert the control's existence but not real reachability under the collapsed layout (touch targets, tap behavior on the menu). |
| 6. Tablet viewport (768px) — nav usable without horizontal scroll | Runtime-only | Same "no horizontal overflow" check as mobile — must be verified in the browser at 768px. |
| 7. Desktop viewport (1280px) — full nav visible inline | Unit-testable (RTL) | `matchMedia` mock for 1280px; assert full nav-link list is present and menu button is absent. |
| 8. Unauthenticated user hitting a protected URL is redirected | Runtime-only | The redirect runs through Next.js server-side rendering / middleware. RTL can assert the guard helper is called with `/auth/signin`, but the full redirect must be browser-verified. |
| 9. Sign-in from a protected URL redirect lands on Dashboard | Runtime-only | The post-sign-in destination is enforced by the sign-in page / server action. RTL can verify the configured destination string, but the full round-trip is a Next.js routing behavior. |
| 10. Navigation region order matches reading order for keyboard users | Unit-testable (RTL) | `userEvent.tab()` traversal with assertions on `document.activeElement`. |
| Edge: Screen reader announces the three landmarks | Unit-testable (RTL) | `getByRole` assertions with landmark role names. |
| Edge: WCAG 2.1 AA contrast in both themes | Runtime-only | jsdom cannot evaluate computed styles against the real MortgageMax palette. Use an in-browser axe run for the authoritative result. |
| Edge: Cross-browser parity | Runtime-only | Requires actual Chrome, Edge, Firefox — not something Vitest can provide. |
| Edge: Footer placement on short pages | Runtime-only | Depends on BA-3 resolution AND on real layout rendering; jsdom doesn't evaluate CSS layout. |
| Edge: Route transition visual feedback | Runtime-only | Depends on BA-4 resolution AND on real route transitions, which jsdom doesn't exercise. |

## Runtime Verification Checklist

These items cannot be verified by automated tests and must be checked during QA manual verification.

- [ ] At 375px width, the authenticated shell (e.g., `/dashboard`) shows a collapsed nav with a menu button, the BetterBond branding is visible, and nothing overflows horizontally (no horizontal scrollbar on `<body>`).
- [ ] At 375px width, Sign Out is reachable per the BA-2 decision (either visible in the top nav bar or inside the opened menu), and clicking it ends the session and returns to `/auth/signin`.
- [ ] At 375px width, tapping the menu button opens the navigation affordance per the BA-1 decision (anchored dropdown, full-screen sheet, or persistent icon row) and dismissing it returns to the page.
- [ ] At 768px width, the shell renders without a horizontal scrollbar and all nav / main / footer content is usable.
- [ ] At 1280px width, the full nav is visible inline without a menu expander, branding is on the left, and the user menu (Sign Out) is accessible on the right.
- [ ] Visiting `/dashboard` directly while not signed in redirects to `/auth/signin` with no flash of Dashboard content.
- [ ] Being redirected to sign-in from, say, `/payment-management` and then signing in as an admin lands on `/dashboard` — not `/payment-management`.
- [ ] The shell renders identically on the latest stable Chrome, Edge, and Firefox on desktop (compare nav layout, typography, button placements).
- [ ] Using an in-browser axe or equivalent tool, the shell passes WCAG 2.1 AA contrast checks in both light and dark themes (nav text, footer text, focus outlines on nav items and user menu).
- [ ] Keyboard-only traversal from the first focusable element moves through nav → main content → footer in reading order, with a visible focus indicator at every step and no focus traps.
- [ ] The footer placement on short pages matches the BA-3 decision (sticky to viewport bottom / flush below content / default browser behavior).
- [ ] Route transitions between authenticated pages (e.g., Dashboard → Payment Management) show the BA-4 visual feedback (skeleton, blank, or previous content) and never unmount/remount the top nav or footer.
