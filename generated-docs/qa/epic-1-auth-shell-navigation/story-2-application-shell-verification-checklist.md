# Manual Verification Checklist — Epic 1, Story 2: Application shell and responsive layout

**Route:** `/dashboard` (the shell wraps every authenticated page — `/dashboard` is the reachable verification surface)

**Sign-in credentials for testing:**
- Admin: `alice.admin@betterbond.example` / `Admin123!`
- Viewer: `vera.viewer@agency.example` / `Viewer123!`

Open the app at http://localhost:3000, sign in with either account, and work through the list.

## Happy path — shell regions on desktop

- [ ] After signing in you land on `/dashboard` and see a top navigation bar, a main content region below it with the "Dashboard" heading, and a footer at the bottom of the page.
- [ ] The BetterBond brand name is visible on the left of the top navigation bar.
- [ ] Your account name or email is visible on the right of the top navigation bar (opens a small menu when clicked; that menu holds Sign Out).

## Responsive behavior — mobile (375px wide)

Resize the browser window to roughly 375 pixels wide, or use the device toolbar in DevTools.

- [ ] The top navigation collapses: instead of the inline links you see a menu button (hamburger icon) on the left.
- [ ] The BetterBond brand name is still visible in the top navigation bar.
- [ ] Your account name or email (the Sign Out menu) is still visible in the top navigation bar — you do NOT need to open the hamburger to reach it.
- [ ] Tap the hamburger button: a small dropdown opens below the top navigation bar (it does not cover the full screen).
- [ ] There is no horizontal scroll bar along the bottom of the page — everything fits inside 375 pixels.
- [ ] Click or tap outside the dropdown: the dropdown closes.

## Responsive behavior — tablet (768px wide)

Resize the window to roughly 768 pixels wide.

- [ ] The top navigation, the main content, and the footer all fit without a horizontal scroll bar.
- [ ] The page reads comfortably — no controls are cut off.

## Responsive behavior — desktop (1280px+ wide)

Resize the window back to ~1280 pixels or wider.

- [ ] The hamburger menu button is gone — the main navigation area is now inline inside the top bar (even though no links are populated until Story 1.3, the space where they will sit is there and the menu button is not duplicated).
- [ ] The BetterBond brand name is on the left; your account menu is on the right.

## Unauthenticated redirect (AC-8, AC-9)

Open a new browser tab (or use an incognito window) where you are NOT signed in.

- [ ] Go directly to `http://localhost:3000/dashboard`. You are sent to the sign-in page immediately — you never see the Dashboard content, even for a moment.
- [ ] From the sign-in page, sign in as an admin. You land on `/dashboard`.
- [ ] Open another new incognito window. Go directly to `http://localhost:3000/payment-management` (this route is not built yet — it will be built in Epic 3 — so you may see a not-found page; the sign-in redirect is what you're verifying). You are sent to the sign-in page. Sign in as admin — you land on `/dashboard`, NOT on `/payment-management`. (Per the feature spec, the Dashboard is always the post-sign-in destination.)

## Footer behavior (BA-3 Option A — sticky footer)

- [ ] On a short page (the current Dashboard placeholder qualifies) the footer sits pinned at the bottom of the browser viewport, not in the middle of the page.
- [ ] Resize the window taller or shorter: the footer stays pinned to the bottom of the visible viewport.
- [ ] On any page with enough content to scroll, the footer appears after scrolling all the way down (it does not float over content).

## Keyboard navigation (AC-11)

Click inside the browser address bar, then press `Tab`.

- [ ] Tab stops land first inside the top navigation (brand / menu / account menu area), then inside the main content region, and finally in the footer — in that order.
- [ ] A visible focus outline is shown on every stop.
- [ ] You never get stuck on a control — tabbing always moves forward.
- [ ] Shift+Tab moves backward through the same order without skipping regions.

## Screen reader landmarks (AC-12)

Using a screen reader (NVDA on Windows, VoiceOver on macOS — press `Insert+F7` or `VO+U` then `L` to list landmarks):

- [ ] You see exactly one "navigation" landmark, exactly one "main" landmark, and exactly one "content information" (footer) landmark.
- [ ] Jumping to each landmark lands your reading cursor inside the expected region.

## Sign Out (BA-2 Option B)

- [ ] Click your account menu in the top navigation bar, then click Sign Out.
- [ ] You are returned to the sign-in page.
- [ ] On mobile (375px), repeat the test: Sign Out must be reachable from the top nav bar WITHOUT opening the hamburger menu first.

## Cross-browser parity (AC-10)

Repeat the happy-path shell checks in:

- [ ] Latest stable Chrome — shell layout looks correct.
- [ ] Latest stable Edge — shell layout looks correct.
- [ ] Latest stable Firefox — shell layout looks correct.

(Identical means the same regions are visible in the same positions with the same typography. Tiny pixel-level differences in font rendering are acceptable.)

## Contrast in both themes (AC-13)

The app defaults to dark mode on a first visit (per Story 1.1).

- [ ] In dark mode, using an in-browser accessibility tool (Chrome DevTools Lighthouse → Accessibility, or the axe extension), run a contrast check on `/dashboard`. Navigation text, footer text, and focus outlines should all pass WCAG 2.1 AA.
- [ ] Clear local storage for the site, set `theme=light` in local storage, and reload. Re-run the same contrast check in light mode — all still pass.

## Route transitions (BA-4 Option A)

(You will need a second authenticated route to observe this. For this story, you can sign out and sign in again to see the transition into `/dashboard`.)

- [ ] When navigating between authenticated pages, you briefly see a loading placeholder (pulsing gray boxes) in the main content region while the next page loads — not a blank page or the previous page's content.
- [ ] The top navigation bar and the footer stay in place during the transition; only the main content area changes.
