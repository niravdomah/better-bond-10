# Manual Verification Checklist — Epic 1, Story 3: Role-aware navigation links and active state

**Route:** `/dashboard` (plus `/payment-management`, `/payments-made`, `/users` for active-state checks — but those routes don't exist yet)

**Sign-in credentials:**
- Admin: `alice.admin@betterbond.example` / `Admin123!`
- Viewer: `vera.viewer@agency.example` / `Viewer123!`

Open the app at http://localhost:3000, sign in with the right account for each section, and work through the list.

---

## Verifiable today

These items can be checked right now in the browser.

- Sign in as an admin and look at the top navigation bar — you should see exactly four links in this order: Dashboard, Payment Management, Payments Made, and Users. (AC-1)

- Sign in as a viewer and look at the top navigation bar — you should see exactly two links: Dashboard and Payments Made. No other nav links should appear. (AC-2)

- Sign in as a viewer — the Payment Management link should be completely absent from the nav. Right-click the page and choose "Inspect" to confirm it is not hiding behind CSS — it should not exist in the page at all. (AC-3)

- Sign in as a viewer — the Users link should be completely absent from the nav. As above, inspect the page to confirm it is not just hidden; it should not be in the DOM at all. (AC-4)

- Sign in as either role and go to `/dashboard` — the Dashboard link in the top nav should look visually distinct compared to the other links (for example, a different color, an underline, or bold text in line with the app's color scheme). (AC-5)

- While on `/dashboard`, click the Dashboard link again. The page should stay on `/dashboard` with no error message or unexpected behaviour. (AC-10)

- Using only your keyboard (no mouse), press Tab repeatedly starting from the top of the page. Every visible nav link should receive focus in left-to-right order, each should show a visible focus ring, and pressing Enter on a focused link should activate it and navigate you to that page. (AC-11)

- Using a screen reader (NVDA on Windows, VoiceOver on Mac/iOS), navigate through the top nav. Each link should be announced by its visible text label (Dashboard, Payment Management, Payments Made, or Users). The link for the page you are currently on should be announced as the current page. (AC-12)

- Using an in-browser accessibility tool (such as axe DevTools or the Chrome DevTools colour-contrast checker), check the active nav link in both light and dark themes. The link text should have at least 4.5:1 contrast against the nav background, and the visual highlight indicator (underline, colour bar, etc.) should have at least 3:1 contrast. (AC-13)

- Shrink your browser window to 375px wide (or use DevTools device emulation). The nav links should move inside a collapsed menu dropdown. Open the dropdown as an admin — all four links should appear inside it. Open the dropdown as a viewer — only Dashboard and Payments Made should appear. The active link inside the dropdown should appear highlighted.

---

## Deferred — will re-verify on a later story

These items require pages that do not exist yet. They will be re-verified once those pages are built.

- Sign in as an admin and navigate to `/payment-management` — the Payment Management link in the top nav should appear visually highlighted, while the other links look normal. **Will re-verify when Story 2.x (Payment Management page) is built.** (AC-6)

- Sign in and navigate to `/payments-made` — the Payments Made link in the top nav should appear visually highlighted, while the other links look normal. **Will re-verify when Story 2.x (Payments Made page) is built.** (AC-7)

- Sign in as an admin and navigate to `/users` — the Users link in the top nav should appear visually highlighted, while the other links look normal. **Will re-verify when Story 5.x (Users page) is built.** (AC-8)

---

## Possibly deferred (heuristic — please use judgment)

The classifier flagged the items below because they reference route paths that do not yet exist (`/payment-management`, `/payments-made`, `/users`). You may be able to verify part of each item today if you navigate to `/dashboard` and observe the nav from there, but the full check needs those destination pages.

- Sign in as an admin and click the Payment Management, Payments Made, and Users nav links one at a time. Each click should take you to that page smoothly — the header and footer should not flash or fully reload between navigations, and the URL bar should update to match the page you clicked. **Partially verifiable today** (you can click Dashboard and confirm no reload); **fully verifiable once the destination pages exist.** (AC-9)

- Sign in as a viewer, type `/payment-management` directly into the address bar, and press Enter. You should be redirected away from that page — it should not load for a viewer. **This is really a Story 1.4 route-guard check.** If Story 1.4 has not been implemented yet, skip this item and return to it then. (Runtime verification item from test-handoff)

- Sign in as an admin and navigate to `/payment-management`, `/payments-made`, and `/users` in turn. On each screen, confirm that exactly one nav link is highlighted and it matches the current page. **Fully verifiable only once those pages exist.**
