# Test Handoff: Sign-in page and NextAuth session

> Engineering document for downstream agents. Not reviewed by the BA.

**Source:** [story-1-1-signin-page-test-design.md](./story-1-1-signin-page-test-design.md)
**Epic:** 1 | **Story:** 1

## Coverage for WRITE-TESTS

Every AC from `generated-docs/stories/epic-1-auth-shell-navigation/story-1-1-signin-page.md` maps to at least one example in the test-design document.

- AC-1: Unauthenticated user landing on `/` is routed to the sign-in page → Example 1
- AC-2: Sign-in page shows branding, email, password, Sign In button → Example 1
- AC-3: Admin with valid credentials lands on Dashboard → Example 2
- AC-4: Viewer with valid credentials lands on Dashboard → Example 3
- AC-5: Signed-in user's email/display name is visible in the page header → Example 2 (identity visible in header)
- AC-6: Session identity captured for later use as `LastChangedUser` → Example 4 (+ BA-1)
- AC-7: Already-signed-in user revisiting the sign-in URL is redirected to the Dashboard → Example 8
- AC-8: Session persists across browser restart (no auto-timeout) → Example 9
- AC-9: Sign Out ends session and returns to sign-in page → Example 10 (+ BA-4 decides the control's location)
- AC-10: Empty email or password submission shows inline validation → Example 6
- AC-11: Invalid credentials show inline error and keep user on sign-in page → Example 5 (+ BA-2 decides password-field behavior)
- AC-12: Auth request failure (server unreachable) shows inline error, fields preserved → Example 7
- AC-13: Sign-in page is fully keyboard operable → Edge Example "Keyboard-only sign-in"
- AC-14: Sign-in page has screen-reader-accessible labels → Edge Example "Screen reader labeling"
- AC-15: Sign-in page meets WCAG 2.1 AA contrast in both light and dark themes → Edge Example "WCAG 2.1 AA contrast in both themes" (+ BA-3 governs which theme loads on first visit)
- AC-16: Role model reconciled to `admin` and `viewer` only — no template 4-role references remain → Edge Example "Role model reconciliation (codebase-wide check)"

## Handoff Notes for WRITE-TESTS

- Only generate executable tests from examples in the test-design document. Do not invent behavior not represented there or explicitly approved.
- **Preferred render scope:** per-scenario.
  - Most form-behavior ACs (AC-2, AC-5, AC-10, AC-11, AC-12, AC-13, AC-14): component-level render of the sign-in page with Vitest + React Testing Library, mocking the NextAuth `signIn` helper at the module boundary.
  - Session + redirect ACs (AC-1, AC-3, AC-4, AC-7, AC-8): verify the session-shape contract (role, identity) by mocking `auth()` / `useSession()` and asserting the redirect target where possible in RTL. The actual middleware-level redirect is runtime-only (see classification below).
  - AC-6 (session carries identity used later as `LastChangedUser`): assert that the session shape exposes the configured identity value. The actual header wiring is tested in Epic 3.
  - AC-16 (role reconciliation): a codebase static check — e.g., a grep/AST test or a simple assertion that the role enum has exactly `admin` and `viewer` members.
- **Suggested primary assertions:**
  - The rendered sign-in form contains an accessible email input (`getByLabelText(/email/i)`), password input (`getByLabelText(/password/i)`), and Sign In button (`getByRole("button", { name: /sign in/i })`).
  - Submitting empty fields surfaces `Email is required` and `Password is required` inline messages (accessible via `getByText` or `findByRole("alert")`).
  - A failed `signIn` (mocked to reject / return an error result) shows an inline error and leaves the user on `/auth/signin`.
  - A successful `signIn` triggers a navigation to `/dashboard` (assert the mocked router was called with `/dashboard`, or a server-action redirect was returned).
  - The role enum module exports exactly two members: `admin` and `viewer`. No test or application import references `POWER_USER`, `STANDARD_USER`, or `READ_ONLY`.
- **Important ambiguity flags:**
  - `LastChangedUser` value source (BA-1) — the test for AC-6 must assert the resolved identity according to whichever option is chosen.
  - Password-field behavior after failure (BA-2) — AC-5 / AC-11 tests for field retention depend on this choice.
  - First-visit theme (BA-3) — AC-15's dark-mode contrast check applies in both themes regardless, but the default theme the sign-in page loads with on first paint depends on this decision. Keep the theme assertion tolerant (assert the chosen default) rather than hard-coding one answer.
  - Sign Out location (BA-4) — AC-9's test for "click Sign Out → session ends → sign-in page" must target the control at wherever the chosen option places it. If Option B (user menu) is chosen, the test must first open the menu.
- **FRS over template:** The template currently has a multi-step sign-in UI and a 4-role enum. Tests written from this handoff target the FRS-specified 2-role / single-step sign-in and will fail until the template code is replaced. That failure is expected during TDD red phase.

## Testability Classification

| Scenario | Category | Reason |
| --- | --- | --- |
| 1. Unauthenticated visitor routed to sign-in on first visit | Runtime-only | The initial `/` → `/auth/signin` redirect runs through Next.js routing / middleware. jsdom cannot exercise a real middleware redirect. RTL can assert the session-guard logic in isolation, but the actual first-paint redirect must be verified in the browser. |
| 2. Admin signs in with valid credentials | Unit-testable (RTL) | Form submit → mocked `signIn` resolves → assert redirect invocation and session shape. |
| 3. Viewer signs in with valid credentials | Unit-testable (RTL) | Same as Scenario 2 with viewer fixture. |
| 4. Session carries identity for later `LastChangedUser` use | Unit-testable (RTL) | Mocked session exposes the identity value; assert on the exposed shape. |
| 5. Invalid credentials keep user on sign-in page | Unit-testable (RTL) | Mocked `signIn` returns error; assert inline error and URL unchanged. |
| 6. Empty form submission shows validation | Unit-testable (RTL) | Pure form-level behavior — no auth call. |
| 7. Server-unreachable auth error | Unit-testable (RTL) | Mocked `signIn` rejects; assert inline error text. |
| 8. Already-signed-in user revisits `/auth/signin` and is redirected | Runtime-only | The redirect-if-authenticated guard is normally implemented on the sign-in page/route level; the end-to-end behavior is best verified in the browser. An RTL test can assert the guard's intent but not the actual Next.js redirect. |
| 9. Session persists across browser restart | Runtime-only | NextAuth session persistence depends on the real cookie store and NextAuth runtime. jsdom cannot simulate closing and reopening a browser. |
| 10. Sign Out ends session | Unit-testable (RTL) | Click the Sign Out control (mocked `signOut`) and assert navigation to `/auth/signin`. The actual cookie-clearing is a NextAuth contract — trust it, verify the call site. |
| Edge: Role model reconciliation (codebase-wide check) | Unit-testable (RTL) | Direct assertion against the role enum's exports; does not require rendering. |
| Edge: Keyboard-only sign-in | Unit-testable (RTL) | Use `userEvent.tab()` and `userEvent.keyboard` to simulate keyboard traversal. |
| Edge: Screen reader labeling | Unit-testable (RTL) | Assert accessible names via `getByLabelText` and `getByRole` with `name:` matchers. |
| Edge: WCAG 2.1 AA contrast in both themes | Runtime-only | Automated contrast assertions via Axe can catch some issues, but jsdom cannot render the real MortgageMax palette against computed styles reliably, especially for the dark-mode teal accent verification called out in NFR10. The authoritative check is a browser visit with an axe extension or `@axe-core/playwright`. |
| Edge: First-ever visit default theme | Runtime-only | Depends on the no-flash inline script running in a real browser, and on the resolution of BA-3. |
| Edge: Sign Out location (BA-4 outcome) | Runtime-only | Where the control lives is verified by navigating and clicking in the real shell. Component-level tests can verify the control's existence at its chosen location. |

## Runtime Verification Checklist

These items cannot be verified by automated tests and must be checked during QA manual verification.

- [ ] Visiting `/` with no active session redirects to `/auth/signin` on first paint (no protected content flashes).
- [ ] Visiting `/auth/signin` while already signed in redirects to `/dashboard` without the sign-in form rendering.
- [ ] Signing in, closing the browser, reopening it, and visiting the root URL lands on `/dashboard` with no sign-in prompt (session persistence / no auto-timeout per NFR7).
- [ ] Signing out from wherever Sign Out lives (per BA-4 resolution) ends the session and returns to `/auth/signin`; a subsequent visit to `/dashboard` redirects back to sign-in.
- [ ] The sign-in page's colors (background, labels, input borders, Sign In button, focus outlines) meet WCAG 2.1 AA contrast in BOTH light and dark themes when verified with an axe or equivalent tool in the browser.
- [ ] On a first-ever visit (fresh localStorage), the theme that loads on the sign-in page matches the BA-3 decision (no visible flash of a different theme).
- [ ] Once a user has signed in, the chosen identity value (per BA-1 — email or display name) is visible somewhere in the app header so the user can confirm who they are signed in as.
- [ ] No reference to `POWER_USER`, `STANDARD_USER`, or `READ_ONLY` remains anywhere in the running app (visible in UI, URL, or developer-tools session inspection).
