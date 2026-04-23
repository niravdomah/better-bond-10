# Requirements Traceability Matrix

Generated: 2026-04-23 | Feature: BetterBond Commission Payments POC | Epics scoped: 1/5

## Coverage Summary
- **Functional Requirements:** 13/44 covered (30%)
- **Business Rules:** 2/13 covered (15%)
- **Non-Functional:** 8/10 covered (80%)
- **Compliance:** 3/4 covered (75%)
- **Pending (claimed by future epics):** R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R20, R21, R22, R23, R24, R25, R26, R27, R28, R29, R30, R31, R32, R33, R34, R35, R36, R37, R38, R39, BR2, BR3, BR4, BR5, BR6, BR7, BR8, BR9, BR10, BR12, BR13, NFR6, NFR9, CR4

## Functional Requirements

| Req ID | Description | Covered By |
|--------|-------------|------------|
| R1 | The application uses NextAuth credentials provider for authentication. Users ... | [Story 1: Sign-in page and NextAuth session](epic-1-auth-shell-navigation/story-1-1-signin-page.md) |
| R2 | On successful sign-in, the user is redirected to the Dashboard screen. | [Story 1: Sign-in page and NextAuth session](epic-1-auth-shell-navigation/story-1-1-signin-page.md) |
| R3 | The NextAuth session exposes the authenticated user's email or display name, ... | [Story 1: Sign-in page and NextAuth session](epic-1-auth-shell-navigation/story-1-1-signin-page.md) |
| R4 | A top navigation bar is permanently visible across all screens, displaying li... | [Story 1: Application shell and responsive layout](epic-1-auth-shell-navigation/story-1-2-application-shell.md), [Story 1: Role-aware navigation links and active state](epic-1-auth-shell-navigation/story-1-3-role-aware-nav.md) |
| R5 | Admins see an additional "Users" link in the top navigation bar. | [Story 1: Role-aware navigation links and active state](epic-1-auth-shell-navigation/story-1-3-role-aware-nav.md) |
| R6 | The currently active screen link is visually highlighted in the navigation bar. | [Story 1: Role-aware navigation links and active state](epic-1-auth-shell-navigation/story-1-3-role-aware-nav.md) |
| R7 | An admin-only "Reset Demo" button is shown in the application footer. Clickin... | [Story 1: Admin-only Reset Demo button with confirmation](epic-1-auth-shell-navigation/story-1-7-reset-demo.md) |
| R8 | The Dashboard screen loads data from `GET /v1/payments/dashboard` and display... | Pending: Epic 2 |
| R9 | The Payments Ready for Payment bar chart displays the count of payments ready... | Pending: Epic 2 |
| R10 | The Parked Payments bar chart displays the count of parked payments, split by... | Pending: Epic 2 |
| R11 | Total Value Ready for Payment displays the sum of `TotalPaymentAmount` for pa... | Pending: Epic 2 |
| R12 | Total Value of Parked Payments displays the aggregated value of all parked pa... | Pending: Epic 2 |
| R13 | The Parked Payments Aging Report displays a graph showing how long payments h... | Pending: Epic 2 |
| R14 | Total Value of Payments Made (Last 14 Days) is derived from `TotalPaymentCoun... | Pending: Epic 2 |
| R15 | The Agency Summary grid displays one row per agency sourced from the `Payment... | Pending: Epic 2 |
| R16 | Each agency row in the Agency Summary grid includes a clickable element that ... | Pending: Epic 2 |
| R17 | Clicking an agency row on the Dashboard also dynamically updates all dashboar... | Pending: Epic 2 |
| R18 | While dashboard data is loading, a loading spinner is shown. If the `GET /v1/... | Pending: Epic 2 |
| R19 | The Payment Management screen is only accessible to users with the admin role... | [Story 1: Route guards for admin-only pages](epic-1-auth-shell-navigation/story-1-4-route-guards.md) |
| R20 | When navigating to Payment Management without an agency selected (no `?agency... | Pending: Epic 3 |
| R21 | When an agency is selected via the `?agency` query parameter, the screen call... | Pending: Epic 3 |
| R22 | The Main Grid displays columns: Agency Name, Batch ID, Claim Date, Agent Name... | Pending: Epic 3 |
| R23 | A search/filter bar above the Main Grid allows filtering by Claim Date, Agenc... | Pending: Epic 3 |
| R24 | When no payments exist for the selected agency (main grid empty and no parked... | Pending: Epic 3 |
| R25 | Each row in the Main Grid includes a "Park" button. Clicking it shows a confi... | Pending: Epic 3 |
| R26 | The Main Grid supports multi-select via row checkboxes. A "Park Selected" but... | Pending: Epic 3 |
| R27 | The Parked Grid displays the same columns as the Main Grid and lists payments... | Pending: Epic 3 |
| R28 | Each row in the Parked Grid includes an "Unpark" button. Clicking it shows a ... | Pending: Epic 3 |
| R29 | The Parked Grid supports multi-select via row checkboxes. An "Unpark Selected... | Pending: Epic 3 |
| R30 | An "Initiate Payment" button is available above or below the Main Grid. Click... | Pending: Epic 3 |
| R31 | After a successful Initiate Payment call, the screen stays on Payment Managem... | Pending: Epic 3 |
| R32 | The invoice download link calls `POST /v1/payment-batches/{Id}/download-invoi... | Pending: Epic 3 |
| R33 | While payment grid data is loading, a loading spinner is shown. If any data f... | Pending: Epic 3 |
| R34 | The Payments Made screen loads data from `GET /v1/payment-batches` and displa... | Pending: Epic 4 |
| R35 | A search/filter bar allows filtering by Agency Name or Batch ID (Reference fi... | Pending: Epic 4 |
| R36 | The Invoice Link column contains a clickable link per batch row that calls `P... | Pending: Epic 4 |
| R37 | Clicking a batch row on the Payments Made screen opens a batch detail view li... | Pending: Epic 4 |
| R38 | While batch data is loading, a loading spinner is shown. If the fetch fails, ... | Pending: Epic 4 |
| R39 | Admins have access to a Users screen (linked from the top navigation) where t... | Pending: Epic 5 |
| R40 | The Users screen is hidden from viewers entirely; direct navigation to the Us... | [Story 1: Role-aware navigation links and active state](epic-1-auth-shell-navigation/story-1-3-role-aware-nav.md), [Story 1: Route guards for admin-only pages](epic-1-auth-shell-navigation/story-1-4-route-guards.md) |
| R41 | There is no public self-signup flow; all user accounts are provisioned by an ... | [Story 1: Sign-in page and NextAuth session](epic-1-auth-shell-navigation/story-1-1-signin-page.md) |
| R42 | All API error responses (4xx, 5xx, or network failure) surface as dismissible... | [Story 1: Global toast notification infrastructure](epic-1-auth-shell-navigation/story-1-6-toast-infrastructure.md), [Story 1: Admin-only Reset Demo button with confirmation](epic-1-auth-shell-navigation/story-1-7-reset-demo.md) |
| R43 | Toast notifications are non-blocking — the user can continue interacting with... | [Story 1: Global toast notification infrastructure](epic-1-auth-shell-navigation/story-1-6-toast-infrastructure.md), [Story 1: Admin-only Reset Demo button with confirmation](epic-1-auth-shell-navigation/story-1-7-reset-demo.md) |
| R44 | The application supports both light and dark modes. The user can toggle betwe... | [Story 1: Theme switcher (light/dark) with persistence](epic-1-auth-shell-navigation/story-1-5-theme-switcher.md) |

## Business Rules

| Rule ID | Description | Covered By |
|--------|-------------|------------|
| BR1 | The Payment Management screen and its actions (park, unpark, bulk park, bulk ... | [Story 1: Route guards for admin-only pages](epic-1-auth-shell-navigation/story-1-4-route-guards.md) |
| BR2 | A payment is either in the Main Grid (eligible for payment, Status = REG or M... | Pending: Epic 3 |
| BR3 | Once a payment has been assigned a BatchId (i.e., it has been included in a p... | Pending: Epic 3 |
| BR4 | Initiate Payment processes all payments currently in the Main Grid for the cu... | Pending: Epic 3 |
| BR5 | There is no minimum batch size — a batch may contain a single payment. | Pending: Epic 3 |
| BR6 | Bulk park operations allow partial success. If the backend succeeds for some ... | Pending: Epic 3 |
| BR7 | Commission % is a derived, display-only value calculated on the frontend as `... | Pending: Epic 3 |
| BR8 | Agent names are stored and transmitted as separate `AgentName` and `AgentSurn... | Pending: Epic 3 |
| BR9 | Agency banking details (BankAccountNumber, BranchCode, VATNumber, etc.) are n... | Pending: Epic 3 |
| BR10 | All currency values are displayed in South African locale format (e.g., R 1 2... | Pending: Epic 2 |
| BR11 | The Reset Demo button is visible and functional only to admin users. Before c... | [Story 1: Admin-only Reset Demo button with confirmation](epic-1-auth-shell-navigation/story-1-7-reset-demo.md) |
| BR12 | When a user navigates to Payment Management without an agency query param, th... | Pending: Epic 3 |
| BR13 | Dashboard chart components update to reflect metrics for the currently select... | Pending: Epic 2 |

## Non-Functional Requirements

| Req ID | Description | Covered By |
|--------|-------------|------------|
| NFR1 | All interactive elements (buttons, links, form inputs, modal triggers) MUST b... | [Story 1: Sign-in page and NextAuth session](epic-1-auth-shell-navigation/story-1-1-signin-page.md), [Story 1: Application shell and responsive layout](epic-1-auth-shell-navigation/story-1-2-application-shell.md), [Story 1: Role-aware navigation links and active state](epic-1-auth-shell-navigation/story-1-3-role-aware-nav.md), [Story 1: Theme switcher (light/dark) with persistence](epic-1-auth-shell-navigation/story-1-5-theme-switcher.md), [Story 1: Admin-only Reset Demo button with confirmation](epic-1-auth-shell-navigation/story-1-7-reset-demo.md) |
| NFR2 | All interactive elements MUST have accessible labels or ARIA attributes so th... | [Story 1: Sign-in page and NextAuth session](epic-1-auth-shell-navigation/story-1-1-signin-page.md), [Story 1: Application shell and responsive layout](epic-1-auth-shell-navigation/story-1-2-application-shell.md), [Story 1: Role-aware navigation links and active state](epic-1-auth-shell-navigation/story-1-3-role-aware-nav.md), [Story 1: Theme switcher (light/dark) with persistence](epic-1-auth-shell-navigation/story-1-5-theme-switcher.md), [Story 1: Global toast notification infrastructure](epic-1-auth-shell-navigation/story-1-6-toast-infrastructure.md), [Story 1: Admin-only Reset Demo button with confirmation](epic-1-auth-shell-navigation/story-1-7-reset-demo.md) |
| NFR3 | Colour contrast ratios for text and UI controls MUST meet WCAG 2.1 AA minimum... | [Story 1: Sign-in page and NextAuth session](epic-1-auth-shell-navigation/story-1-1-signin-page.md), [Story 1: Application shell and responsive layout](epic-1-auth-shell-navigation/story-1-2-application-shell.md), [Story 1: Global toast notification infrastructure](epic-1-auth-shell-navigation/story-1-6-toast-infrastructure.md), [Story 1: Admin-only Reset Demo button with confirmation](epic-1-auth-shell-navigation/story-1-7-reset-demo.md) |
| NFR4 | The application MUST be fully responsive across: mobile (375px minimum width)... | [Story 1: Application shell and responsive layout](epic-1-auth-shell-navigation/story-1-2-application-shell.md) |
| NFR5 | The application MUST function correctly on the latest stable versions of Goog... | [Story 1: Application shell and responsive layout](epic-1-auth-shell-navigation/story-1-2-application-shell.md) |
| NFR6 | Data grids and dashboard components MUST load within 3 seconds on a standard ... | Pending: Epic 2 |
| NFR7 | There is no session auto-timeout for the POC. Sessions persist until the user... | [Story 1: Sign-in page and NextAuth session](epic-1-auth-shell-navigation/story-1-1-signin-page.md) |
| NFR8 | The application supports light and dark modes using the MortgageMax brand pal... | [Story 1: Theme switcher (light/dark) with persistence](epic-1-auth-shell-navigation/story-1-5-theme-switcher.md) |
| NFR9 | Currency values throughout the application MUST be displayed in South African... | Pending: Epic 2 |
| NFR10 | Both light and dark themes MUST independently satisfy WCAG 2.1 AA colour cont... | [Story 1: Sign-in page and NextAuth session](epic-1-auth-shell-navigation/story-1-1-signin-page.md), [Story 1: Application shell and responsive layout](epic-1-auth-shell-navigation/story-1-2-application-shell.md), [Story 1: Theme switcher (light/dark) with persistence](epic-1-auth-shell-navigation/story-1-5-theme-switcher.md), [Story 1: Global toast notification infrastructure](epic-1-auth-shell-navigation/story-1-6-toast-infrastructure.md), [Story 1: Admin-only Reset Demo button with confirmation](epic-1-auth-shell-navigation/story-1-7-reset-demo.md) |

## Compliance Requirements

| Req ID | Description | Covered By |
|--------|-------------|------------|
| CR1 | Personal data (agent names, agency details) MUST only be displayed to users w... | [Story 1: Sign-in page and NextAuth session](epic-1-auth-shell-navigation/story-1-1-signin-page.md), [Story 1: Route guards for admin-only pages](epic-1-auth-shell-navigation/story-1-4-route-guards.md) |
| CR2 | Every `POST /v1/payment-batches` action MUST record the identity of the user ... | [Story 1: Sign-in page and NextAuth session](epic-1-auth-shell-navigation/story-1-1-signin-page.md) |
| CR3 | No consent banner or in-app privacy notice is required — this is an internal ... | [Story 1: Sign-in page and NextAuth session](epic-1-auth-shell-navigation/story-1-1-signin-page.md) |
| CR4 | Viewer-role users have access only to Dashboard summaries (agency-level data,... | Pending: Epic 2 |
