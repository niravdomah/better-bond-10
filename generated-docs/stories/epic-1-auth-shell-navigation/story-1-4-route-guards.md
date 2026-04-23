# Story: Route guards for admin-only pages

**Epic:** Auth, Shell, and Navigation Foundation | **Story:** 4 of 7 | **Wireframe:** N/A (cross-cutting behavior)

**Role:** All Roles (admin and viewer — with different enforcement outcomes)

**Requirements:** [R19](../../specs/feature-requirements.md#screen-2--payment-management-admin-only), [R40](../../specs/feature-requirements.md#user-management-admin-only), [BR1](../../specs/feature-requirements.md#business-rules), [CR1](../../specs/feature-requirements.md#compliance--regulatory-requirements)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `N/A` (middleware / layout-level guard applied to `/payment-management` and `/users`) |
| **Target File** | `web/src/app/(protected)/layout.tsx` (shared auth check) plus per-route guards in `web/src/app/(protected)/payment-management/layout.tsx` and `web/src/app/(protected)/users/layout.tsx` (new files) |
| **Page Action** | `create_new` (per-route guard layouts) and `modify_existing` (protected layout) |

## User Story
**As** BetterBond **I want** admin-only screens to be enforced at the routing layer **So that** a viewer (or an unauthenticated visitor) who types or bookmarks a restricted URL is redirected, not merely hidden from nav links — meeting the POPIA data-minimisation requirement that agent-level personal data is never rendered to viewers.

## Acceptance Criteria

### Viewer redirects
- [ ] AC-1: Given I am signed in as a viewer, when I type `/payment-management` into the address bar, then I am redirected to the Dashboard without any Payment Management content rendering
- [ ] AC-2: Given I am signed in as a viewer, when I type `/payment-management?agency=Acme` into the address bar, then I am redirected to the Dashboard (query params do not bypass the guard)
- [ ] AC-3: Given I am signed in as a viewer, when I type `/users` into the address bar, then I am redirected to the Dashboard without any Users content rendering
- [ ] AC-4: Given I am signed in as a viewer and I am redirected away from an admin-only screen, when I land on the Dashboard, then I see the Dashboard content normally (no error message flashes or lingers)

### Admin access
- [ ] AC-5: Given I am signed in as an admin, when I type `/payment-management` into the address bar, then I reach the Payment Management screen without any redirect
- [ ] AC-6: Given I am signed in as an admin, when I type `/users` into the address bar, then I reach the Users screen without any redirect

### Unauthenticated redirects
- [ ] AC-7: Given I am not signed in, when I try to visit `/payment-management` or `/users` directly, then I am redirected to the sign-in page
- [ ] AC-8: Given I am not signed in, when I try to visit `/dashboard` or `/payments-made` directly, then I am redirected to the sign-in page (consistent with the shell's auth guard from Story 1.2)

### No UI leakage
- [ ] AC-9: Given I am signed in as a viewer, when the redirect from `/payment-management` happens, then at no point do I see any payment rows, agent names, or Payment Management heading — even briefly
- [ ] AC-10: Given I am signed in as a viewer, when the redirect from `/users` happens, then at no point do I see any user rows or Users heading

## API Endpoints (from OpenAPI spec)

No API calls — guards operate on the NextAuth session's role claim established in Story 1.1.

## Implementation Notes

- **Depends on:** Story 1.1 (session exposes role) and Story 1.2 (shell redirects unauthenticated users).
- **Server-side enforcement:** Use Next.js route layouts or `middleware.ts` to check the session and role on the server before any admin-only content is rendered. The redirect must happen server-side so the viewer never receives restricted HTML — this is what AC-9/AC-10 require. Do not implement the guard with a client-side `useEffect` that briefly renders before redirecting.
- **Guard placement:** Put the admin check in per-route layout files (`app/(protected)/payment-management/layout.tsx`, `app/(protected)/users/layout.tsx`) rather than sprinkling it through every page. That way the guard is in one place per admin-only area and future pages added under those routes inherit it automatically.
- **Redirect target:** Viewers redirect to `/dashboard` (per R19 and R40). Unauthenticated visitors redirect to `/auth/signin` (per Story 1.2).
- **BR1 + CR1:** This story is the enforcement mechanism behind BR1 (Payment Management restricted to admin) and CR1 (personal agent data only shown to users with legitimate business need). Epic 3 relies on this guard to satisfy its own access control acceptance criteria — do not defer.
- **Existing template reconciliation:** Review `web/src/proxy.ts` and `web/src/app/auth/forbidden/page.tsx` — the template has a forbidden page concept that is not in the FRS flow. Per FRS, viewers are redirected to Dashboard, not sent to a forbidden page. Remove or bypass any template forbidden-redirect wiring for these admin-only routes.
