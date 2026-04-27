# Test Handoff: Role-aware navigation links and active state

> Engineering document for downstream agents. Not reviewed by the BA.

**Source:** [story-3-role-aware-nav-test-design.md](./story-3-role-aware-nav-test-design.md)
**Epic:** 1 | **Story:** 3

## Coverage for WRITE-TESTS

Every AC from `generated-docs/stories/epic-1-auth-shell-navigation/story-3-role-aware-nav.md` maps to at least one example in the test-design document.

- AC-1: Admin sees Dashboard, Payment Management, Payments Made, and Users links → Example 1
- AC-2: Viewer sees Dashboard and Payments Made only → Example 2
- AC-3: Viewer does not see Payment Management link at all → Example 3
- AC-4: Viewer does not see Users link at all → Example 4
- AC-5: Dashboard link is highlighted when on the Dashboard → Example 5
- AC-6: Payment Management link is highlighted when on Payment Management (admin) → Example 6
- AC-7: Payments Made link is highlighted when on Payments Made → Example 7
- AC-8: Users link is highlighted when on the Users screen (admin) → Example 8
- AC-9: Clicking a nav link navigates without a full-page reload → Example 9
- AC-10: Clicking the active link stays on the same page without error → Example 10
- AC-11: Keyboard tab reaches every visible link in reading order and activates with Enter → Edge Example "Keyboard tab order matches visual order"
- AC-12: Screen reader announces each link's name and the active link as the current page → Edge Example "Screen reader announces the active link as the current page"
- AC-13: Active-link highlight meets WCAG 2.1 AA contrast in both themes → Edge Example "Active-link highlight meets WCAG contrast in both themes"

## Handoff Notes for WRITE-TESTS

- Only generate executable tests from examples in the test-design document. Do not invent behavior not represented there or explicitly approved.
- **Preferred render scope:** per-scenario.
  - AC-1 through AC-4 (link visibility by role): render the `TopNav` (or whatever Story 1.3 introduces under `web/src/components/nav/`) or the containing `AppShell` with a mocked session. Use `getAllByRole('link')` to assert the list of accessible names. For viewer, additionally assert `queryByRole('link', { name: /payment management/i })` and `queryByRole('link', { name: /users/i })` are `null` (not just hidden).
  - AC-5 through AC-8 (active-state detection): mock `next/navigation`'s `usePathname` to return the target URL; render the nav; assert that the matching link has `aria-current="page"` and that all other links do not. Also assert that the matching link carries the active visual class (reading its `className` is acceptable here because the active state is observable behavior — just do not over-specify the exact className literal; assert that its class set is different from non-active links).
  - AC-9 (client-side navigation): the `<Link>` component from `next/link` handles this. The test should assert that each nav link is rendered via `next/link` (e.g., the rendered `<a>` has `href` pointing at the target route AND renders within an element whose behavior matches `next/link`'s client navigation). The full "no full-page reload" assertion belongs to Playwright.
  - AC-10 (clicking the active link is a no-op): assert that clicking the active link does not throw and leaves `aria-current="page"` on the same link. This is effectively the same as AC-9 for the active link case — no additional state assertions needed beyond "no error".
  - AC-11 (keyboard traversal): `userEvent.tab()` repeatedly against the rendered nav; assert focus visits the four (admin) or two (viewer) nav links in DOM/visual order. Simulate `{Enter}` on a focused link and assert `next/navigation`'s `router.push` is called with the link's href (mocking `useRouter`).
  - AC-12 (screen reader announcement): jsdom cannot exercise a real screen reader. Assert the semantic contract: each link has a visible text label equal to "Dashboard" / "Payment Management" / "Payments Made" / "Users", and the active link has `aria-current="page"`. The real announcement is verified manually.
  - AC-13 (contrast): use `@axe-core/react` or `vitest-axe` against the rendered nav for a coarse accessibility pass. The authoritative contrast check against the MortgageMax palette lives in the browser — route the "visual highlight ≥ 3:1 in both themes" item to Runtime Verification.
- **Suggested primary assertions:**
  - Admin session → `getAllByRole('link')` inside the primary nav returns four links with names `"Dashboard"`, `"Payment Management"`, `"Payments Made"`, `"Users"` in that order.
  - Viewer session → `getAllByRole('link')` inside the primary nav returns exactly two links with names `"Dashboard"`, `"Payments Made"` in that order; `queryByRole('link', { name: /payment management/i })` and `queryByRole('link', { name: /users/i })` both return `null`.
  - `usePathname` mocked to `/dashboard` → the Dashboard link has `aria-current="page"`; no other link does.
  - `usePathname` mocked to `/payment-management` (admin session) → Payment Management link has `aria-current="page"`; Dashboard does not.
  - `usePathname` mocked to `/payments-made` (viewer session) → Payments Made link has `aria-current="page"`; Dashboard does not.
  - `usePathname` mocked to `/users` (admin session) → Users link has `aria-current="page"`.
  - Keyboard: `userEvent.tab()` four times from the first focusable element in the nav lands on the four admin links in order; `{Enter}` on a focused link triggers `router.push` with that link's href.
  - Each rendered nav link is an `<a>` element with an `href` attribute pointing at the expected route (the default render shape for `next/link`).
- **Important ambiguity flags:**
  - BA-1 (active state on non-matching routes) — WRITE-TESTS should not assert any specific behavior on deep routes like `/payment-management/batch/123` until this resolves. Tests target only the exact-match cases AC-5–AC-8.
  - BA-2 (mobile dropdown active-state treatment) — tests at the 375px breakpoint should assert that each visible link still has `aria-current="page"` when it matches the route, but should not over-specify the visual treatment (same vs. variant) until this resolves. Assert on the semantic contract; leave the class-assertion tolerant.
  - BA-3 (Users link label) — the test assertions above use the literal `"Users"`. If BA-3 resolves to Option B or C, update the assertion literal accordingly as part of the revision cycle.
- **FRS over template:** The template ships `RoleGate` and uses NextAuth session helpers. This story reuses them — it does not introduce a second role-check mechanism. WRITE-TESTS should mock the session via the project's existing `@/lib/auth` helpers rather than introducing a new session-mock surface.
- **Role-gating strategy:** The story's implementation hint is to use `RoleGate` (or an equivalent lightweight `useSession`-based check) to conditionally render admin-only links. Tests should drive from the session role, not from whatever conditional renders the component uses internally.

## Testability Classification

| Scenario | Category | Reason |
| --- | --- | --- |
| 1. Admin sees all four nav links | Unit-testable (RTL) | Render nav with mocked admin session; assert four links by accessible name and order. |
| 2. Viewer sees only Dashboard and Payments Made | Unit-testable (RTL) | Render nav with mocked viewer session; assert two links by accessible name and order. |
| 3. Viewer does not see Payment Management link at all | Unit-testable (RTL) | `queryByRole('link', { name: /payment management/i })` returns `null`. |
| 4. Viewer does not see Users link at all | Unit-testable (RTL) | `queryByRole('link', { name: /users/i })` returns `null`. |
| 5. Dashboard link active when on Dashboard | Unit-testable (RTL) | Mock `usePathname` → `/dashboard`; assert `aria-current="page"` on Dashboard link. |
| 6. Payment Management link active when on Payment Management | Unit-testable (RTL) | Mock `usePathname` → `/payment-management`; assert `aria-current="page"` on that link. |
| 7. Payments Made link active when on Payments Made | Unit-testable (RTL) | Mock `usePathname` → `/payments-made`; assert `aria-current="page"`. |
| 8. Users link active when on Users screen | Unit-testable (RTL) | Mock `usePathname` → `/users`; assert `aria-current="page"`. |
| 9. Clicking a nav link navigates without full-page reload | Runtime-only | "No full-page reload" requires a real browser — jsdom cannot distinguish `<a>`'s default navigation from `next/link`'s client-side push. RTL can assert `router.push` was called, but the no-reload contract is Playwright-territory. |
| 10. Clicking the active link stays on the same page | Unit-testable (RTL) | Assert `router.push` called with current pathname and no error thrown; `aria-current` unchanged. |
| Edge: Keyboard tab order matches visual order | Unit-testable (RTL) | `userEvent.tab()` traversal with focus assertions. |
| Edge: Screen reader announces active link as current page | Unit-testable (RTL) | Assert `aria-current="page"` on the active link and accessible names on all links. Real screen-reader announcement is manual. |
| Edge: Active-link highlight meets WCAG contrast in both themes | Runtime-only | jsdom cannot evaluate computed styles against the real MortgageMax palette. Manual axe check in-browser. |
| Edge: Mobile (375px) links live inside the collapsed menu dropdown | Runtime-only | The dropdown open/close and tap-to-navigate behavior is exercised in a real browser. RTL can assert the links are rendered inside the dropdown DOM when `matchMedia` is mocked to mobile, but the tap-to-navigate round-trip is Runtime. |

## Runtime Verification Checklist

These items cannot be verified by automated tests and must be checked during QA manual verification.

- [ ] Signed in as an admin at `/dashboard`, the top nav shows exactly four links in order: Dashboard, Payment Management, Payments Made, Users. The Dashboard link is visually highlighted and any screen reader announces it as the current page.
- [ ] Signed in as a viewer at `/dashboard`, the top nav shows exactly two links in order: Dashboard, Payments Made. The Payment Management and Users links are nowhere in the DOM (inspect element to confirm — not merely hidden via CSS).
- [ ] Signed in as an admin, click each nav link in turn. Each click lands on the correct route, the browser does not perform a full document reload (the nav/footer do not flicker or remount), and the active-link highlight updates to the new page. The URL bar updates to match.
- [ ] Signed in as an admin at `/dashboard`, click the Dashboard link again. The page stays on `/dashboard` with no visible error.
- [ ] Signed in, navigate to `/payment-management` (admin), `/payments-made`, and `/users` (admin) in turn. On each screen, exactly one nav link is highlighted and it is the link that matches the current page.
- [ ] At 375px viewport, the nav links move inside the collapsed menu dropdown (Story 1.2 BA-1 Option A). Opening the dropdown as an admin reveals all four links; as a viewer reveals only Dashboard and Payments Made. The active link inside the dropdown uses the BA-2 treatment (same-as-desktop, menu-list variant, or none — per BA decision).
- [ ] Using keyboard only, tab through the top nav. Every visible link is reached in left-to-right (or top-to-bottom in the mobile dropdown) order, has a visible focus indicator, and activates with Enter.
- [ ] Using a screen reader (NVDA, VoiceOver, or similar), navigate the top nav. Each link is announced by its visible text. The link matching the current page is announced as the current page (or equivalent).
- [ ] Using an in-browser axe tool or a contrast checker, verify that the active-link text contrast is ≥ 4.5:1 and the active-link visual indicator contrast is ≥ 3:1 against the nav background in both light and dark themes.
- [ ] As a viewer, type `/payment-management` directly into the URL bar. You are redirected away by Story 1.4's route guard (not a regression of this story, but a sanity check that hidden-from-nav ≠ security-hole).
