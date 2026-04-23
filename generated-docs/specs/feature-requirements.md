# Feature: BetterBond Commission Payments POC

## Problem Statement

BetterBond's existing commission payments process is manual and error-prone. This POC gives internal payments administrators a single interface to track, park, batch-process, and invoice agent commissions — demonstrating what a full rewrite could deliver. Real estate agency staff (viewers) can access dashboard summaries and historical payment batches in a read-only capacity.

## User Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| admin | BetterBond internal payments administrator | Full access: Dashboard, Payment Management (park/unpark/bulk-park/initiate payment/generate invoices), Payments Made, Users screen (create/invite users + assign roles), Reset Demo button |
| viewer | Real estate agency staff or read-only internal user | Read-only access to Dashboard and Payments Made screens; Payment Management is hidden entirely |

## Functional Requirements

### Authentication & Session

- **R1:** The application uses NextAuth credentials provider for authentication. Users sign in with credentials provisioned by an admin — there is no public self-signup.
- **R2:** On successful sign-in, the user is redirected to the Dashboard screen.
- **R3:** The NextAuth session exposes the authenticated user's email or display name, which is passed as the `LastChangedUser` header on all `POST /v1/payment-batches` calls.

### Navigation

- **R4:** A top navigation bar is permanently visible across all screens, displaying links to: Dashboard, Payment Management (visible to admin role only), and Payments Made.
- **R5:** Admins see an additional "Users" link in the top navigation bar.
- **R6:** The currently active screen link is visually highlighted in the navigation bar.
- **R7:** An admin-only "Reset Demo" button is shown in the application footer. Clicking it presents a confirmation modal before calling `POST /demo/reset-demo`. Non-admin users do not see this button.

### Screen 1 — Dashboard

- **R8:** The Dashboard screen loads data from `GET /v1/payments/dashboard` and displays the following components: Payments Ready for Payment (bar chart), Parked Payments (bar chart), Total Value Ready for Payment, Total Value of Parked Payments, Parked Payments Aging Report, Total Value of Payments Made (Last 14 Days), and an Agency Summary grid.
- **R9:** The Payments Ready for Payment bar chart displays the count of payments ready for processing, split by Commission Type ("Bond Comm" and "Manual Payments"), sourced from the `PaymentStatusReport` array in the dashboard response.
- **R10:** The Parked Payments bar chart displays the count of parked payments, split by Commission Type, sourced from the `PaymentStatusReport` array.
- **R11:** Total Value Ready for Payment displays the sum of `TotalPaymentAmount` for payments with eligible status from the `PaymentStatusReport`.
- **R12:** Total Value of Parked Payments displays the aggregated value of all parked payments from the `PaymentStatusReport`.
- **R13:** The Parked Payments Aging Report displays a graph showing how long payments have been parked, using grouped day ranges (1–3 days, 4–7 days, >7 days), sourced from the `ParkedPaymentsAgingReport` array.
- **R14:** Total Value of Payments Made (Last 14 Days) is derived from `TotalPaymentCountInLast14Days` and related amounts in the dashboard response.
- **R15:** The Agency Summary grid displays one row per agency sourced from the `PaymentsByAgency` array, with columns: Agency Name, Number of Payments (ready, not parked), Total Commission Amount, and VAT. Currency values are formatted in en-ZA locale (e.g., R 1 234 567,89).
- **R16:** Each agency row in the Agency Summary grid includes a clickable element that navigates to the Payment Management screen with that agency pre-selected (URL query parameter `?agency=<AgencyName>`).
- **R17:** Clicking an agency row on the Dashboard also dynamically updates all dashboard chart components to reflect metrics for the selected agency.
- **R18:** While dashboard data is loading, a loading spinner is shown. If the `GET /v1/payments/dashboard` call fails, a dismissible error toast is shown with the error message and a "Dismiss" option.

### Screen 2 — Payment Management (Admin only)

- **R19:** The Payment Management screen is only accessible to users with the admin role. Viewers who navigate to this screen are redirected to the Dashboard.
- **R20:** When navigating to Payment Management without an agency selected (no `?agency` query param), the user is shown an agency selector — either a dropdown or the agency grid from the Dashboard — prompting them to choose an agency before the grid is populated.
- **R21:** When an agency is selected via the `?agency` query parameter, the screen calls `GET /v1/payments?AgencyName=<AgencyName>` to load the main payment grid.
- **R22:** The Main Grid displays columns: Agency Name, Batch ID, Claim Date, Agent Name & Surname (displayed as "AgentName AgentSurname"), Bond Amount (en-ZA format), Commission Type, Commission % (derived: CommissionAmount / BondAmount, formatted to 2 decimal places, e.g., 0.95%), Grant Date, Reg Date, Bank, Commission Amount, VAT, Status (REG or MAN-PAY).
- **R23:** A search/filter bar above the Main Grid allows filtering by Claim Date, Agency Name, and Status.
- **R24:** When no payments exist for the selected agency (main grid empty and no parked payments), a friendly empty-state message is shown: "No payments available for [Agency Name]" with a short descriptive subtitle.
- **R25:** Each row in the Main Grid includes a "Park" button. Clicking it shows a confirmation modal displaying: "Are you sure you want to park this payment?" with contextual details (Agent Name, Claim Date, Amount). On confirmation, the payment is moved to the Parked Grid via `PUT /v1/payments/park`.
- **R26:** The Main Grid supports multi-select via row checkboxes. A "Park Selected" button shows a confirmation modal listing the number of selected payments and their combined total amount. On confirmation, the selected payments are submitted to `PUT /v1/payments/park` and moved to the Parked Grid.
- **R27:** The Parked Grid displays the same columns as the Main Grid and lists payments in the parked state for the current agency.
- **R28:** Each row in the Parked Grid includes an "Unpark" button. Clicking it shows a confirmation modal (mirroring the park flow) with contextual payment details. On confirmation, the payment is moved back to the Main Grid via `PUT /v1/payments/unpark`.
- **R29:** The Parked Grid supports multi-select via row checkboxes. An "Unpark Selected" button shows a confirmation modal. On confirmation, the selected payments are submitted to `PUT /v1/payments/unpark` and returned to the Main Grid.
- **R30:** An "Initiate Payment" button is available above or below the Main Grid. Clicking it shows a confirmation modal summarising: number of payments and total value. On confirmation, `POST /v1/payment-batches` is called with the `PaymentIds` of all Main Grid payments and the `LastChangedUser` header populated from the NextAuth session.
- **R31:** After a successful Initiate Payment call, the screen stays on Payment Management, the Main Grid refreshes to show the now-empty state, a success toast is shown, and an invoice download link is offered in the toast or an adjacent modal.
- **R32:** The invoice download link calls `POST /v1/payment-batches/{Id}/download-invoice-pdf` and triggers a browser PDF download.
- **R33:** While payment grid data is loading, a loading spinner is shown. If any data fetch fails, a dismissible error toast is shown with the error message and a "Dismiss" option.

### Screen 3 — Payments Made

- **R34:** The Payments Made screen loads data from `GET /v1/payment-batches` and displays a grid with columns: Agency Name, Number of Payments, Total Commission Amount, VAT, and Invoice Link.
- **R35:** A search/filter bar allows filtering by Agency Name or Batch ID (Reference field).
- **R36:** The Invoice Link column contains a clickable link per batch row that calls `POST /v1/payment-batches/{Id}/download-invoice-pdf` and triggers a browser PDF download.
- **R37:** Clicking a batch row on the Payments Made screen opens a batch detail view listing the individual payments within that batch (loaded from `GET /v1/payment-batches/{Id}`) plus the invoice download link.
- **R38:** While batch data is loading, a loading spinner is shown. If the fetch fails, a dismissible error toast is shown with the error message and a "Dismiss" option.

### User Management (Admin only)

- **R39:** Admins have access to a Users screen (linked from the top navigation) where they can create/invite users and assign them the admin or viewer role.
- **R40:** The Users screen is hidden from viewers entirely; direct navigation to the Users screen by a viewer redirects to the Dashboard.
- **R41:** There is no public self-signup flow; all user accounts are provisioned by an admin through the Users screen.

### Theme & Appearance

- **R44:** The application supports both light and dark modes. The user can toggle between them via a theme switcher in the top navigation bar. The selected theme is persisted in localStorage and restored on subsequent visits. Both modes use the MortgageMax brand palette adapted appropriately (navy-dominant light mode; inverted navy-tinted dark mode with teal accents retained for contrast).

### General Error Handling

- **R42:** All API error responses (4xx, 5xx, or network failure) surface as dismissible toast notifications positioned at the bottom/corner of the screen, including the error message from the API response where available and a "Dismiss" option.
- **R43:** Toast notifications are non-blocking — the user can continue interacting with the page while the toast is visible.

## Business Rules

- **BR1:** The Payment Management screen and its actions (park, unpark, bulk park, bulk unpark, initiate payment) are restricted to the admin role. Viewers cannot access or trigger these actions.
- **BR2:** A payment is either in the Main Grid (eligible for payment, Status = REG or MAN-PAY) or in the Parked Grid — these are mutually exclusive states for the UI; parking is tracked separately and is not a payment Status value.
- **BR3:** Once a payment has been assigned a BatchId (i.e., it has been included in a payment batch), it cannot be parked. Park controls are not shown for payments with a BatchId.
- **BR4:** Initiate Payment processes all payments currently in the Main Grid for the current agency — not a subset. The user cannot selectively initiate payment for individual rows from the Main Grid; all eligible (non-parked, non-batched) payments are included.
- **BR5:** There is no minimum batch size — a batch may contain a single payment.
- **BR6:** Bulk park operations allow partial success. If the backend succeeds for some payments and fails for others, the UI removes the successfully parked payments from the Main Grid and shows an error toast listing the specific payments that failed. The user can retry failed payments individually.
- **BR7:** Commission % is a derived, display-only value calculated on the frontend as `CommissionAmount / BondAmount`, formatted to 2 decimal places (e.g., 0.95%). It is never submitted to the backend.
- **BR8:** Agent names are stored and transmitted as separate `AgentName` and `AgentSurname` fields; the UI combines them as "AgentName AgentSurname" for display.
- **BR9:** Agency banking details (BankAccountNumber, BranchCode, VATNumber, etc.) are not displayed in the frontend — they are used server-side only for invoice generation.
- **BR10:** All currency values are displayed in South African locale format (e.g., R 1 234 567,89).
- **BR11:** The Reset Demo button is visible and functional only to admin users. Before calling `POST /demo/reset-demo`, a confirmation modal must be presented asking the user to confirm the reset action.
- **BR12:** When a user navigates to Payment Management without an agency query param, the agency selector is shown before any payment data is fetched.
- **BR13:** Dashboard chart components update to reflect metrics for the currently selected agency row. When no agency is selected, the charts show aggregated data for all agencies.

## Data Model

| Entity | Key Fields (UI-visible) | Relationships |
|--------|------------------------|---------------|
| Payment | Id, Reference, AgencyName, ClaimDate, AgentName, AgentSurname, BondAmount, CommissionType, GrantDate, RegistrationDate, Bank, CommissionAmount, VAT, Status, BatchId, LastChangedUser, LastChangedDate | Belongs to an Agency (by AgencyName); optionally belongs to a PaymentBatch (via BatchId) |
| PaymentBatch | Id, CreatedDate, Status, Reference, LastChangedUser, AgencyName, PaymentCount, TotalCommissionAmount, TotalVat | Has many Payments |
| DashboardSummary | PaymentStatusReport[], ParkedPaymentsAgingReport[], TotalPaymentCountInLast14Days, PaymentsByAgency[] | Aggregated view — no direct entity relationship; sourced from GET /v1/payments/dashboard |
| PaymentsByAgencyItem | AgencyName, PaymentCount, TotalCommissionCount, Vat | Child item of DashboardSummary |
| PaymentStatusReportItem | Status, PaymentCount, TotalPaymentAmount, CommissionType, AgencyName | Child item of DashboardSummary |
| ParkedPaymentsAgingItem | Range, AgencyName, PaymentCount | Child item of DashboardSummary |

**Note:** Agency banking details (BankAccountNumber, BranchCode, VATNumber) exist in the backend data model but are not exposed to or displayed by the frontend — they are used server-side for invoice generation only.

## Key Workflows

### Workflow 1 — Sign In

1. User navigates to the application root.
2. Application detects no active NextAuth session and redirects to the sign-in page.
3. User enters credentials provisioned by an admin.
4. On successful authentication, user is redirected to the Dashboard screen.
5. On authentication failure, an inline error message is shown on the sign-in form.

### Workflow 2 — Dashboard to Payment Management

1. Admin or viewer lands on the Dashboard screen.
2. Dashboard loads from `GET /v1/payments/dashboard`; loading spinner shown during fetch.
3. Agency Summary grid displays one row per agency.
4. User clicks an agency row's action button.
5. Dashboard charts update to reflect that agency's metrics.
6. User is navigated to Payment Management with `?agency=<AgencyName>` in the URL.
7. Payment Management loads the Main Grid for that agency from `GET /v1/payments?AgencyName=<AgencyName>`.

### Workflow 3 — Park a Single Payment

1. Admin views the Main Grid on Payment Management for a selected agency.
2. Admin clicks the "Park" button on a payment row.
3. A confirmation modal appears: "Are you sure you want to park this payment?" — showing Agent Name, Claim Date, and Amount.
4. Admin clicks "Confirm".
5. Frontend calls `PUT /v1/payments/park` with `{ "PaymentIds": [<Id>] }`.
6. On success: the payment is removed from the Main Grid and appears in the Parked Grid. A success toast is shown.
7. On API error: the payment remains in the Main Grid and an error toast appears with the error message and "Dismiss" option.

### Workflow 4 — Bulk Park Multiple Payments

1. Admin multi-selects payments in the Main Grid using row checkboxes.
2. Admin clicks "Park Selected".
3. A confirmation modal lists the number of payments and their combined total value.
4. Admin confirms.
5. Frontend calls `PUT /v1/payments/park` with all selected `PaymentIds`.
6. On full success: all selected payments move to the Parked Grid; a success toast is shown.
7. On partial success: payments the backend successfully parked are removed from the Main Grid; an error toast lists the payment IDs or references that failed. User can retry failed payments individually.

### Workflow 5 — Unpark Payment(s)

1. Admin clicks "Unpark" on a single row (or multi-selects and clicks "Unpark Selected") in the Parked Grid.
2. Confirmation modal displays contextual payment details.
3. Admin confirms.
4. Frontend calls `PUT /v1/payments/unpark` with the relevant `PaymentIds`.
5. On success: the payment(s) move back to the Main Grid; success toast shown.
6. On error: payment(s) remain in the Parked Grid; error toast shown.

### Workflow 6 — Initiate Payment (Create Batch)

1. Admin reviews the Main Grid for a selected agency.
2. Admin clicks "Initiate Payment".
3. A confirmation modal summarises: number of payments and total commission value for the agency.
4. Admin confirms.
5. Frontend calls `POST /v1/payment-batches` with `{ "PaymentIds": [all Main Grid IDs] }` and the `LastChangedUser` header set to the authenticated user's email/name from the NextAuth session.
6. On success: the Main Grid refreshes (empty state shown if no remaining payments), a success toast appears, and an invoice download link is offered in the toast or modal.
7. Admin may click the invoice download link to trigger `POST /v1/payment-batches/{Id}/download-invoice-pdf`, which downloads the PDF.
8. On error: the Main Grid is not modified; an error toast is shown.

### Workflow 7 — View Payments Made and Download Invoice

1. User (admin or viewer) navigates to the Payments Made screen.
2. Screen loads from `GET /v1/payment-batches`; loading spinner shown.
3. Batch grid displays rows: Agency Name, Number of Payments, Total Commission Amount, VAT, Invoice Link.
4. User may filter by Agency Name or Batch ID using the search bar.
5. User clicks an Invoice Link in a row — browser downloads the PDF from `POST /v1/payment-batches/{Id}/download-invoice-pdf`.
6. Alternatively, user clicks a batch row to open the batch detail view, which loads individual payments from `GET /v1/payment-batches/{Id}` and also provides the invoice download link.

### Workflow 8 — Direct Navigation to Payment Management Without Agency

1. User navigates to `/payment-management` (or equivalent) without an `?agency` query parameter.
2. The screen shows an agency selector (dropdown or agency grid) prompting the user to choose an agency.
3. User selects an agency.
4. URL updates to include `?agency=<AgencyName>` and the Main Grid loads.

### Workflow 9 — Reset Demo (Admin only)

1. Admin clicks the "Reset Demo" button in the application footer.
2. A confirmation modal is shown asking the admin to confirm the demo data reset.
3. Admin confirms.
4. Frontend calls `POST /demo/reset-demo`.
5. On success: a success toast is shown and the current screen data is refreshed.
6. On error: an error toast is shown.

### Workflow 10 — User Management (Admin only)

1. Admin navigates to the Users screen via the top navigation.
2. Admin creates a new user by entering credentials and assigning a role (admin or viewer).
3. The new user is provisioned and can sign in with the assigned credentials.
4. Admin may also update a user's role assignment from the Users screen.

## Compliance & Regulatory Requirements

POPIA (South Africa's Protection of Personal Information Act) applies to this application. Personal data in scope includes agent names (AgentName, AgentSurname) and agency-identifying details processed by the Payment Management and Dashboard screens.

- **CR1:** Personal data (agent names, agency details) MUST only be displayed to users with a legitimate business need. Accordingly, the Payment Management screen — which surfaces agent-level personal data — is accessible only to admin-role users. Viewers are redirected away from this screen (POPIA — data minimisation principle).
- **CR2:** Every `POST /v1/payment-batches` action MUST record the identity of the user who initiated the batch by populating the `LastChangedUser` request header with the authenticated user's session identity (email or display name). This provides the minimum audit trail required for the POC scope (POPIA — accountability principle).
- **CR3:** No consent banner or in-app privacy notice is required — this is an internal tool and personal data processing is covered by employment agreements (POPIA — lawful basis: legitimate interest / employment contract).
- **CR4:** Viewer-role users have access only to Dashboard summaries (agency-level data, minimal PII) and the Payments Made batch list (agency-level totals). Agent-level personal data fields (AgentName, AgentSurname, individual payment details) are not exposed to viewer-role users via the UI.

## Non-Functional Requirements

- **NFR1:** All interactive elements (buttons, links, form inputs, modal triggers) MUST be operable via keyboard navigation alone (WCAG 2.1 AA — keyboard accessibility).
- **NFR2:** All interactive elements MUST have accessible labels or ARIA attributes so that screen reader users can identify their purpose (WCAG 2.1 AA — name, role, value).
- **NFR3:** Colour contrast ratios for text and UI controls MUST meet WCAG 2.1 AA minimums (4.5:1 for normal text, 3:1 for large text and UI components).
- **NFR4:** The application MUST be fully responsive across: mobile (375px minimum width), tablet (768px), and desktop (1280px+). Dense data grids become card layouts on small screens; filter/search controls become modal sheets on mobile viewports.
- **NFR5:** The application MUST function correctly on the latest stable versions of Google Chrome, Microsoft Edge, and Mozilla Firefox on desktop.
- **NFR6:** Data grids and dashboard components MUST load within 3 seconds on a standard office broadband connection. Loading spinners MUST be shown during all data fetch operations.
- **NFR7:** There is no session auto-timeout for the POC. Sessions persist until the user explicitly signs out.
- **NFR8:** The application supports light and dark modes using the MortgageMax brand palette. The theme switcher is accessible from the top navigation bar, and the selected theme is persisted in localStorage and restored on page load.
- **NFR9:** Currency values throughout the application MUST be displayed in South African locale format: `R 1 234 567,89` (space as thousands separator, comma as decimal separator).
- **NFR10:** Both light and dark themes MUST independently satisfy WCAG 2.1 AA colour contrast requirements (4.5:1 for normal text, 3:1 for large text and UI components). The teal accent colour (#7EC8E3) used for interactive elements in dark mode MUST be verified against dark backgrounds before use.

## Out of Scope

- Actual EFT bank transmission — the system generates the invoice and batch record but does NOT submit payment instructions to any banking system.
- Editing payment amounts, commission rates, or any stored payment record fields — the UI is read-and-manage only; no data-entry for monetary amounts.
- Email notifications to agencies or agents after a batch is created or an invoice is generated.
- Data retention policies and automated data deletion — out of scope for this POC.
- Public self-signup — all user accounts are admin-provisioned.
- Offline or progressive web app (PWA) capabilities.
- Multi-language / internationalisation beyond en-ZA locale formatting.

## Source Traceability

| ID | Source | Reference |
|----|--------|-----------|
| R1 | User input | Clarifying question: "What auth method does this app use?" — NextAuth credentials provider, admin-provisioned users, no self-signup |
| R2 | documentation/BetterBond-Commission-Payments-POC-002.md | Implied by three-screen structure; sign-in redirects to Dashboard |
| R3 | User input | Clarifying question: "Where does LastChangedUser come from?" — from NextAuth session (email or name) |
| R4 | documentation/BetterBond-Commission-Payments-POC-002.md | Screen navigation described across all three screens |
| R5 | User input | Clarifying question: "What screens/actions belong to each role?" — admin gets Users link |
| R6 | documentation/BetterBond-Commission-Payments-POC-002.md | Navigation behaviour — active state highlighting |
| R7 | User input | Clarifying question: "Where does the Reset Demo button live and who can see it?" — admin-only footer button with confirmation modal |
| R8 | documentation/BetterBond-Commission-Payments-POC-002.md | §Screen 1: Dashboard Screen — Dashboard Components |
| R9 | documentation/BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — Payments Ready for Payment (Bar Chart); documentation/Api Definition.yaml — PaymentStatusReportItem schema |
| R10 | documentation/BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — Parked Payments (Bar Chart); documentation/Api Definition.yaml — PaymentStatusReportItem schema |
| R11 | documentation/BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — Total Value Ready for Payment |
| R12 | documentation/BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — Total Value of Parked Payments |
| R13 | documentation/BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — Parked Payments Aging Report; documentation/Api Definition.yaml — ParkedPaymentsAgingReportItem schema |
| R14 | documentation/BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — Total Value of Payments Made (Last 14 Days); documentation/Api Definition.yaml — TotalPaymentCountInLast14Days |
| R15 | documentation/BetterBond-Commission-Payments-POC-002.md | §Dashboard Grid (Agency Summary) — Grid Fields; documentation/Api Definition.yaml — PaymentsByAgencyReportItem schema |
| R16 | documentation/BetterBond-Commission-Payments-POC-002.md | §Dashboard Grid — Behaviour: "Each record is clickable, navigates to Screen 2 for that specific agency"; User input — URL query param `?agency=<AgencyName>` for shareable links |
| R17 | documentation/BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — "Each visual component should update dynamically when an agency is selected" |
| R18 | User input | Clarifying question: "What should happen when API calls fail?" — error toast; "What loading states should be shown?" — spinners |
| R19 | User input | Clarifying question: "What screens/actions belong to each role?" — Payment Management hidden from viewers |
| R20 | User input | Clarifying question: "What happens when a user navigates to Payment Management without an agency selected?" — agency selector shown |
| R21 | documentation/Api Definition.yaml | GET /v1/payments — AgencyName query parameter |
| R22 | documentation/BetterBond-Commission-Payments-POC-002.md | §Screen 2: Payment Management — Columns list; User input — Commission % derived frontend, AgentName + AgentSurname combined for display |
| R23 | documentation/BetterBond-Commission-Payments-POC-002.md | §Screen 2 — Search Bar: "Filter by Claim Date, Agency Name, Status" |
| R24 | User input | Clarifying question: "What should the empty state look like when no payments exist for an agency?" |
| R25 | documentation/BetterBond-Commission-Payments-POC-002.md | §Parking Payments — Single Payment Parking; documentation/Api Definition.yaml — PUT /v1/payments/park |
| R26 | documentation/BetterBond-Commission-Payments-POC-002.md | §Parking Payments — Bulk Parking; documentation/Api Definition.yaml — PUT /v1/payments/park |
| R27 | documentation/BetterBond-Commission-Payments-POC-002.md | §Parked Grid — Fields and Functions |
| R28 | documentation/BetterBond-Commission-Payments-POC-002.md | §Parked Grid — "Unpark" individual; documentation/Api Definition.yaml — PUT /v1/payments/unpark |
| R29 | documentation/BetterBond-Commission-Payments-POC-002.md | §Parked Grid — "Unpark" multiple; documentation/Api Definition.yaml — PUT /v1/payments/unpark |
| R30 | documentation/BetterBond-Commission-Payments-POC-002.md | §Initiate Payment; documentation/Api Definition.yaml — POST /v1/payment-batches |
| R31 | User input | Clarifying question: "What happens after Initiate Payment succeeds?" — stay on screen, refresh grid, success toast with invoice download link |
| R32 | documentation/Api Definition.yaml | POST /v1/payment-batches/{Id}/download-invoice-pdf |
| R33 | User input | Clarifying question: "What loading states and error handling apply to Payment Management?" |
| R34 | documentation/BetterBond-Commission-Payments-POC-002.md | §Screen 3: Payments Made — Main Grid Fields; documentation/Api Definition.yaml — PaymentBatchRead schema, GET /v1/payment-batches |
| R35 | documentation/BetterBond-Commission-Payments-POC-002.md | §Screen 3 — "Search bar for filtering by Agency Name or Batch ID" |
| R36 | documentation/BetterBond-Commission-Payments-POC-002.md | §Screen 3 — "Clickable invoice link to open/download invoice for each record"; documentation/Api Definition.yaml — POST /v1/payment-batches/{Id}/download-invoice-pdf |
| R37 | User input | Clarifying question: "Is there a batch detail view on Payments Made?" — yes, clicking a row opens detail view with individual payments and invoice download |
| R38 | User input | Clarifying question: "What loading/error states apply to Payments Made?" |
| R39 | User input | Clarifying question: "Is user management in scope?" — yes, admin-only Users screen for create/invite and role assignment |
| R40 | User input | Clarifying question: "Who can access the Users screen?" — admin only; viewers redirected |
| R41 | User input | Clarifying question: "Is self-signup available?" — no, admin-provisioned only |
| R42 | User input | Clarifying question: "How should API errors be surfaced to users?" — dismissible toast, bottom/corner, includes error message and Dismiss option |
| R43 | User input | Clarifying question: "Are error notifications blocking?" — non-blocking |
| R44 | User input | Change request: dark mode added to scope — light + dark modes with MortgageMax palette, theme switcher in top nav, persisted in localStorage |
| BR1 | User input | Clarifying question: "What screens/actions belong to each role?" |
| BR2 | User input | Clarifying question: "What payment statuses exist?" — REG and MAN-PAY; parked is tracked separately |
| BR3 | User input | Clarifying question: "Can a batched payment be parked?" — no; BatchId presence blocks parking |
| BR4 | User input | Clarifying question: "Does Initiate Payment include all Main Grid payments or just selected ones?" — all for the current agency |
| BR5 | User input | Clarifying question: "Is there a minimum batch size?" — no minimum |
| BR6 | User input | Clarifying question: "What is the bulk park failure path?" — partial success, per-payment error reporting |
| BR7 | User input | Clarifying question: "How is Commission % calculated?" — derived on frontend, never submitted |
| BR8 | User input | Clarifying question: "How are agent names handled?" — separate fields combined for display |
| BR9 | User input | Clarifying question: "Should agency banking details be shown in the UI?" — no, server-side only |
| BR10 | generated-docs/context/intake-manifest.json | stylingNotes — "South African locale (en-ZA): currency formatted as 'R 1 234 567,89'" |
| BR11 | User input | Clarifying question: "Where is the Reset Demo button and who can use it?" |
| BR12 | User input | Clarifying question: "What happens on direct navigation to Payment Management without agency?" |
| BR13 | documentation/BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — "Each visual component should update dynamically when an agency is selected" |
| CR1 | User input | Clarifying question: "What personal data is in scope under POPIA?" — agent names; Payment Management restricted to admin (data minimisation) |
| CR2 | User input | Clarifying question: "What audit trail is required?" — LastChangedUser header from session (POC scope) |
| CR3 | User input | Clarifying question: "Is a privacy notice or consent banner required?" — no; internal tool, employment agreements cover lawful basis |
| CR4 | User input | Clarifying question: "What data can viewer-role users see?" — agency-level summaries only; no agent-level PII |
| NFR1 | User input | Clarifying question: "What accessibility standard applies?" — WCAG 2.1 AA; keyboard navigation required |
| NFR2 | User input | Clarifying question: "What accessibility standard applies?" — WCAG 2.1 AA; screen-reader labels required |
| NFR3 | User input | Clarifying question: "What accessibility standard applies?" — WCAG 2.1 AA; colour contrast required |
| NFR4 | User input | Clarifying question: "Is responsive design required?" — fully responsive: 375px mobile, 768px tablet, 1280px+ desktop; grids become cards; filters become modal sheets on mobile |
| NFR5 | User input | Clarifying question: "Which browsers must be supported?" — latest Chrome, Edge, Firefox on desktop |
| NFR6 | User input | Clarifying question: "What is the performance target?" — data loads within 3 seconds on standard office broadband; spinners during fetch |
| NFR7 | User input | Clarifying question: "Is there a session timeout?" — no auto-timeout for POC |
| NFR8 | User input | Change request: dark mode added to scope — replaces "light mode only"; light + dark mode with MortgageMax palette, theme switcher in top nav, localStorage persistence |
| NFR9 | generated-docs/context/intake-manifest.json | stylingNotes — "South African locale (en-ZA): currency formatted as 'R 1 234 567,89'" |
| NFR10 | User input | Change request: dark mode WCAG contrast reinforcement — both themes independently verified against WCAG 2.1 AA; teal accent (#7EC8E3) contrast on dark backgrounds flagged for verification |
