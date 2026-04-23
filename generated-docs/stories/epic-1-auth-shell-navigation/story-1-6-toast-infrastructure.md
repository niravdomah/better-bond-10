# Story: Global toast notification infrastructure

**Epic:** Auth, Shell, and Navigation Foundation | **Story:** 6 of 7 | **Wireframe:** N/A (cross-cutting — toasts appear over every screen)

**Role:** All Roles (admin and viewer)

**Requirements:** [R42](../../specs/feature-requirements.md#general-error-handling), [R43](../../specs/feature-requirements.md#general-error-handling), [NFR3](../../specs/feature-requirements.md#non-functional-requirements), [NFR10](../../specs/feature-requirements.md#non-functional-requirements), [NFR2](../../specs/feature-requirements.md#non-functional-requirements)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `N/A` (container mounted once by the shell) |
| **Target File** | `web/src/app/(protected)/layout.tsx` (mount point) + existing `web/src/components/toast/Toast.tsx` + `web/src/components/toast/ToastContainer.tsx` + a toast hook/API module |
| **Page Action** | `modify_existing` |

## User Story
**As an** authenticated admin or viewer **I want** the app to show me success and error messages as toasts that I can dismiss **So that** I know when an action worked, when an API call failed, and what the error was — without losing my place on the page.

## Acceptance Criteria

### Happy Path — success toasts
- [ ] AC-1: Given I am on any authenticated page, when any part of the app (e.g., a future park/unpark action, initiate payment action, or the Reset Demo in Story 1.7) triggers a success toast, then I see a success-styled toast appear at the bottom or corner of the screen with the success message
- [ ] AC-2: Given a success toast is visible, when I click its Dismiss control, then the toast disappears immediately

### Happy Path — error toasts
- [ ] AC-3: Given I am on any authenticated page, when any part of the app triggers an error toast (including the API error messages described by R42), then I see an error-styled toast at the bottom or corner of the screen with the error message from the API (or a fallback message if none is provided)
- [ ] AC-4: Given an error toast is visible, when I click its Dismiss control, then the toast disappears immediately

### Visual distinction
- [ ] AC-5: Given a success toast and an error toast appear at different times, when I look at them, then they are visually distinguishable (e.g., different color, different icon) — not merely identical toasts with different text
- [ ] AC-6: Given either kind of toast is visible, when I look at its text against its background, then contrast meets WCAG 2.1 AA (4.5:1 for message text)

### Non-blocking
- [ ] AC-7: Given a toast is visible, when I click on content underneath it (e.g., a button, a form field, a link in the nav), then I can still interact with that content — the toast does not block input or navigation
- [ ] AC-8: Given multiple toasts are triggered in quick succession, when they appear, then they stack visibly rather than overwriting each other, and each can be dismissed independently

### Accessibility
- [ ] AC-9: Given I use a screen reader, when a toast appears, then its message is announced through a live region without me needing to move focus to it
- [ ] AC-10: Given I use only the keyboard, when a toast is visible, then I can reach its Dismiss control and activate it with Enter or Space
- [ ] AC-11: Given I view toasts in either light or dark mode, when I inspect success and error toast styles, then both satisfy WCAG 2.1 AA contrast in both themes

## API Endpoints (from OpenAPI spec)

No API calls. The toast API is purely client-side infrastructure consumed by later stories that do call APIs.

## Implementation Notes

- **Depends on:** Story 1.2 (shell exists as the mount point).
- **Reuse existing toast scaffold:** The template provides `web/src/components/toast/Toast.tsx` and `ToastContainer.tsx`. Audit them against this story's ACs. Where the template scaffold already satisfies an AC, use it — where it does not (e.g., missing live region, wrong position, colors don't meet contrast in dark mode), fix it rather than building a parallel system. The end state is one toast system used by every subsequent story.
- **Public API:** Expose a minimal programmatic API (e.g., `toast.success(message)` and `toast.error(message)`, or a `useToast()` hook returning those functions) that every later story can call from any client component. Document the API in a short comment block at the top of the module so Epic 2+ developers don't have to reverse-engineer it.
- **R42 payload shape:** When an API call fails (4xx / 5xx / network), the caller extracts the error message from the API response (if present) and passes it to `toast.error`. If no message is available, a fallback like "Something went wrong — please try again" is used. Keep this extraction logic in the shared API client — later stories should never duplicate it.
- **Screen-reader live region:** The toast container renders a single ARIA live region (`role="status"` for success, `role="alert"` for errors, or `aria-live="polite"` / `aria-live="assertive"` as appropriate). A toast's message must be announced exactly once per appearance.
- **Auto-dismiss (optional):** Toasts may auto-dismiss after a reasonable timeout (e.g., 5 seconds for success, longer or never for error). Manual Dismiss must always be available regardless — AC-2 and AC-4 are not optional.
- **Position:** Bottom-right or bottom-center per R42 ("bottom/corner of the screen"). Choose one and be consistent.
