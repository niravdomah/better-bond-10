# Story: Theme switcher (light/dark) with persistence

**Epic:** Auth, Shell, and Navigation Foundation | **Story:** 5 of 7 | **Wireframe:** [screen-2-dashboard.md](../../specs/wireframes/screen-2-dashboard.md) (theme toggle shown in top nav)

**Role:** All Roles (admin and viewer)

**Requirements:** [R44](../../specs/feature-requirements.md#theme--appearance), [NFR8](../../specs/feature-requirements.md#non-functional-requirements), [NFR10](../../specs/feature-requirements.md#non-functional-requirements), [NFR1](../../specs/feature-requirements.md#non-functional-requirements), [NFR2](../../specs/feature-requirements.md#non-functional-requirements)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `N/A` (theme switcher component mounted in the top nav) |
| **Target File** | `web/src/app/(protected)/layout.tsx` (mount point) + a new `web/src/components/theme/ThemeSwitcher.tsx` + `web/src/contexts/ThemeProvider.tsx` |
| **Page Action** | `create_new` (theme switcher + provider) and `modify_existing` (shell mount point) |

## User Story
**As an** authenticated admin or viewer **I want** to toggle the app between light and dark modes from the top nav **So that** I can use whichever appearance suits my environment, and have that choice remembered on my next visit without a flash of the wrong theme.

## Acceptance Criteria

### Happy Path
- [ ] AC-1: Given I am signed in, when I look at the top nav, then I see a theme toggle control showing the current theme (light or dark)
- [ ] AC-2: Given I am in light mode, when I click the theme toggle, then the entire app — top nav, content region, footer, any visible charts or cards — switches to dark mode immediately
- [ ] AC-3: Given I am in dark mode, when I click the theme toggle, then the entire app switches back to light mode immediately
- [ ] AC-4: Given I have chosen dark mode, when I reload the page, then the app loads directly in dark mode with no visible flash of light mode during load
- [ ] AC-5: Given I have chosen light mode, when I reload the page, then the app loads directly in light mode with no visible flash of dark mode during load
- [ ] AC-6: Given I have chosen a theme, when I close the browser and reopen the app later, then my theme choice is remembered and applied on load
- [ ] AC-7: Given I have never opened the app before, when I visit for the first time, then a sensible default theme is used (light mode is the default for this project) and the choice is persisted once I interact with the toggle

### Theme palette
- [ ] AC-8: Given I am in light mode, when I inspect the app, then the color palette follows the MortgageMax light-mode tokens (navy-dominant, with teal accents where specified)
- [ ] AC-9: Given I am in dark mode, when I inspect the app, then the color palette follows the MortgageMax dark-mode tokens (inverted navy-tinted background, teal accents retained for contrast)

### Accessibility
- [ ] AC-10: Given I use only the keyboard, when I tab through the top nav, then the theme toggle is reachable and I can switch themes with Enter or Space
- [ ] AC-11: Given I use a screen reader, when I focus the theme toggle, then its current state is announced (e.g., "Theme: light" or "Switch to dark theme")
- [ ] AC-12: Given I am in light mode, when I check all text against its background (body text, nav links, button labels, input labels), then every pair meets WCAG 2.1 AA contrast (4.5:1 for normal text, 3:1 for large text and UI components)
- [ ] AC-13: Given I am in dark mode, when I check all text against its background including the teal accent color used on interactive elements, then every pair meets WCAG 2.1 AA contrast — the teal accent on dark is explicitly verified per NFR10

## API Endpoints (from OpenAPI spec)

No API calls — theme state lives in localStorage on the client.

## Implementation Notes

- **Depends on:** Story 1.2 (shell's top nav region exists).
- **MortgageMax palette source of truth:** `generated-docs/specs/design-tokens.css` + `generated-docs/specs/design-tokens.md`. These tokens are already integrated into `web/src/app/globals.css`. This story wires the toggle to the CSS class (or `[data-theme]`) that activates the dark-mode token set — it does not redefine the palette.
- **No-flash implementation:** The common pattern is an inline script in `app/layout.tsx`'s `<head>` that reads `localStorage` and sets the `className` / `data-theme` on `<html>` before React hydrates. Use that pattern (or Next.js `next-themes` if preferred, pinned to an SSR-safe config). Do NOT set the theme only inside a `useEffect` — that causes the flash AC-4 and AC-5 forbid.
- **Persistence key:** Use a stable localStorage key (e.g., `betterbond.theme`) storing `"light"` or `"dark"`. Avoid relying on the OS preference as the persisted value — always store the explicit user choice.
- **Toggle placement:** Mount the toggle in the top nav alongside the role-aware links from Story 1.3. The toggle must render on all viewport sizes from 375px up.
- **Dark-mode teal verification:** NFR10 specifically calls out `#7EC8E3` (teal) on dark. During implementation, verify each place the teal is used (buttons, active link indicators, focus rings) against the actual dark background and confirm 4.5:1 / 3:1 as appropriate. If any usage fails, adjust the token or the usage — do not ship a failing contrast.
- **Wireframe reference:** `screen-2-dashboard.md` shows the toggle's top-nav position.
