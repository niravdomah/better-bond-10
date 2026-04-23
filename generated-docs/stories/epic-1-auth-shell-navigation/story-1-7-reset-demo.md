# Story: Admin-only Reset Demo button with confirmation

**Epic:** Auth, Shell, and Navigation Foundation | **Story:** 7 of 7 | **Wireframe:** [screen-2-dashboard.md](../../specs/wireframes/screen-2-dashboard.md) (Reset Demo shown in footer)

**Role:** Administrator

**Requirements:** [R7](../../specs/feature-requirements.md#navigation), [BR11](../../specs/feature-requirements.md#business-rules), [R42](../../specs/feature-requirements.md#general-error-handling), [R43](../../specs/feature-requirements.md#general-error-handling), [NFR1](../../specs/feature-requirements.md#non-functional-requirements), [NFR2](../../specs/feature-requirements.md#non-functional-requirements), [NFR3](../../specs/feature-requirements.md#non-functional-requirements), [NFR10](../../specs/feature-requirements.md#non-functional-requirements)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `N/A` (footer-mounted button rendered by the shell) |
| **Target File** | `web/src/app/(protected)/layout.tsx` (footer region) + new `web/src/components/demo/ResetDemoButton.tsx` |
| **Page Action** | `modify_existing` (shell footer) and `create_new` (button + modal) |

## User Story
**As an** admin demoing the app **I want** a Reset Demo button in the footer that asks me to confirm before resetting the demo data **So that** I can put the app back into a clean state between demo runs without risk of resetting by accident.

## Acceptance Criteria

### Happy Path
- [ ] AC-1: Given I am signed in as an admin, when I look at the footer on any authenticated page, then I see a Reset Demo button
- [ ] AC-2: Given I am signed in as an admin, when I click the Reset Demo button, then a confirmation modal appears asking me to confirm the demo reset
- [ ] AC-3: Given the confirmation modal is open, when I click Confirm, then the app calls `POST /demo/reset-demo` and closes the modal
- [ ] AC-4: Given the Reset Demo API call succeeds, when the response comes back, then I see a success toast telling me the demo was reset, and the current screen refreshes its data so I see the reset state
- [ ] AC-5: Given the confirmation modal is open, when I click Cancel (or close the modal), then the modal closes and no API call is made

### Viewer exclusion
- [ ] AC-6: Given I am signed in as a viewer, when I look at the footer on any authenticated page, then I do not see a Reset Demo button at all (hidden, not merely disabled)

### Error Handling
- [ ] AC-7: Given I am signed in as an admin and I confirm a demo reset, when `POST /demo/reset-demo` fails (4xx / 5xx / network error), then I see an error toast with the error message from the API (or a fallback if none) and the Dismiss option
- [ ] AC-8: Given the reset call has failed, when I look at the current screen, then its data is unchanged from before I clicked Reset Demo (the app did not enter a half-reset state)

### Accessibility
- [ ] AC-9: Given I am an admin using only the keyboard, when I tab through the footer, then I can reach the Reset Demo button and activate it with Enter or Space
- [ ] AC-10: Given the confirmation modal is open, when I use only the keyboard, then focus is trapped inside the modal (I cannot tab to content behind it), I can activate Confirm or Cancel with Enter or Space, and pressing Escape closes the modal
- [ ] AC-11: Given I use a screen reader, when the confirmation modal opens, then its role (dialog), title, and description are announced, and focus moves into the modal
- [ ] AC-12: Given I view the Reset Demo button and the confirmation modal in either light or dark mode, when I inspect text and focus styles, then contrast meets WCAG 2.1 AA

## API Endpoints (from OpenAPI spec)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST   | `/demo/reset-demo` | Reset all demo data to the initial seed state |

## Implementation Notes

- **Depends on:** Story 1.2 (footer region exists), Story 1.4 (role-based enforcement — at minimum, admin-only visibility is needed; a viewer should never be able to trigger this action even via DevTools), and Story 1.6 (toast infrastructure is how success/error feedback is shown).
- **Shadcn components:** Use the Shadcn `<Button />` and `<Dialog />` components (installing via MCP if not yet present). Do not write a custom modal — the Dialog component already handles focus trap and Escape behavior used by AC-10/AC-11.
- **Refresh after success:** Per R7 and Workflow 9, after success the current screen data is refreshed. On a route like Dashboard or Payments Made, trigger a re-fetch (e.g., Next.js `router.refresh()` or re-run the screen's data fetch). This story's responsibility is firing the refresh; the screens themselves own their fetch wiring.
- **Error shape:** The error toast's message comes from the API response body where available (shared R42 pattern handled by Story 1.6's toast API client). Do not swallow the underlying error message.
- **BR11 emphasis:** Without the confirmation modal, the button is a footgun. Do not implement a "double-click to reset" or a "hold to reset" pattern in place of the modal — BR11 requires an explicit confirmation modal.
- **Visibility enforcement:** The button is hidden via a role check reading the session (same mechanism as the role-aware nav links in Story 1.3). Additionally, the `POST /demo/reset-demo` call should fail safely if a non-admin ever reaches it (the backend is the ultimate authority, but a client-side role assertion before the call prevents accidental UI paths).
- **Wireframe reference:** `screen-2-dashboard.md` — footer region shows the Reset Demo button position (admin-only).
