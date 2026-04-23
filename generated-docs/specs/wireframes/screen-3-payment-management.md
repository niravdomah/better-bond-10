# Screen: Payment Management (Admin only)

## Purpose

Admin-only workspace for reviewing, parking/unparking, and initiating payment for an agency's commission records. Has two sub-states: an agency-selector shown when no agency is in the URL, and the payment-grid shown when an agency is selected via `?agency=<AgencyName>`.

## Access control

Viewers who navigate here are redirected to the Dashboard (R19, BR1). This screen is not in the nav for viewers.

---

## Sub-state A — Agency Selector

Shown when the user lands on Payment Management with no `?agency` query param (R20, BR12).

### Wireframe

```
+--------------------------------------------------------------------------+
| [MortgageMax Logo]  Dashboard | Payment Mgmt | Payments Made | Users     |
|                                               [Theme] [User v]           |
+--------------------------------------------------------------------------+
|                                                                          |
|  Payment Management                                                      |
|  ────────────────────────────────────────────────────────────────────    |
|                                                                          |
|  Select an agency to view its payments                                   |
|                                                                          |
|  [Choose an agency...                                           v]       |
|                                                                          |
|  or                                                                      |
|                                                                          |
|  +----------------------------------------------------------------------+|
|  | Agency Name   | # Payments | Total Commission | VAT       |          ||
|  |---------------|------------|------------------|-----------|          ||
|  | RE/MAX        | 12         | R   456 789,00   | R  68 518 | [>]      ||
|  | Pam Golding   |  9         | R   321 456,78   | R  48 218 | [>]      ||
|  | Seeff         |  7         | R   234 567,89   | R  35 185 | [>]      ||
|  | ...           | ...        | ...              | ...       | [>]      ||
|  +----------------------------------------------------------------------+|
|                                                                          |
+--------------------------------------------------------------------------+
| Footer                          [Reset Demo] (admin only)                |
+--------------------------------------------------------------------------+
```

### Elements

| Element | Type | Description |
|---------|------|-------------|
| Agency selector dropdown | Select / Combobox | Lists all agencies; selecting one updates the URL to `?agency=<name>` and loads sub-state B |
| Agency grid (alternative) | Data table | Same rows as Dashboard Agency Summary grid; each row's action navigates to sub-state B |

### User Actions

- **Select agency from dropdown:** URL updates to `?agency=<AgencyName>`; sub-state B loads.
- **Click agency row's action:** Same outcome as dropdown — navigate into sub-state B for that agency.

---

## Sub-state B — Payment Grid (agency selected)

Shown when `?agency=<AgencyName>` is present. Contains the filter bar, Main Grid, Parked Grid, and Initiate Payment control.

### Wireframe

```
+--------------------------------------------------------------------------+
| [MortgageMax Logo]  Dashboard | Payment Mgmt | Payments Made | Users     |
|                                               [Theme] [User v]           |
+--------------------------------------------------------------------------+
|                                                                          |
|  Payment Management - RE/MAX            [Change agency]  [Initiate Pmt]  |
|  ────────────────────────────────────────────────────────────────────    |
|                                                                          |
|  Filters:  [Claim Date: any v] [Agency: RE/MAX v] [Status: any v] [x]    |
|                                                                          |
|  Main Grid (eligible for payment)                                        |
|  +----------------------------------------------------------------------+|
|  |[ ]| Batch | Claim   | Agent Name    | Bond     | Comm  | Comm % |   ||
|  |   | ID    | Date    |               | Amount   | Type  |        |   ||
|  |---|-------|---------|---------------|----------|-------|--------|   ||
|  |[ ]|  -    | 15/04/26| A. Mokoena    | R 1 200k | Bond  | 0,95%  |[Park]|
|  |[ ]|  -    | 14/04/26| S. van der M. | R   950k | Bond  | 0,80%  |[Park]|
|  |[ ]|  -    | 13/04/26| T. Naidoo     | R 1 450k | MAN-P | 1,10%  |[Park]|
|  |[ ]|  -    | 12/04/26| K. Botha      | R   780k | Bond  | 0,85%  |[Park]|
|  | ...                                                                ||
|  +----------------------------------------------------------------------+|
|  [Park Selected (3)]                                                     |
|                                                                          |
|  Parked Grid                                                             |
|  +----------------------------------------------------------------------+|
|  |[ ]| Batch | Claim   | Agent Name    | Bond     | Comm  | Comm % |   ||
|  |   | ID    | Date    |               | Amount   | Type  |        |   ||
|  |---|-------|---------|---------------|----------|-------|--------|   ||
|  |[ ]|  -    | 10/04/26| L. Dlamini    | R 1 100k | Bond  | 0,90%  |[Unpark]|
|  |[ ]|  -    | 09/04/26| M. Khumalo    | R   830k | MAN-P | 1,05%  |[Unpark]|
|  +----------------------------------------------------------------------+|
|  [Unpark Selected (1)]                                                   |
|                                                                          |
|                                                                          |
|  (When Main Grid empty AND Parked Grid empty:)                           |
|  ┌────────────────────────────────────────────────────────────────┐     |
|  │                                                                │     |
|  │            No payments available for RE/MAX                    │     |
|  │      All payments for this agency have been processed.         │     |
|  │                                                                │     |
|  └────────────────────────────────────────────────────────────────┘     |
|                                                                          |
+--------------------------------------------------------------------------+
| Footer                                       [Reset Demo]                |
+--------------------------------------------------------------------------+
```

### Modal: Park single payment

```
+--------------------------------------------------+
|  Park payment?                              [x]  |
|--------------------------------------------------|
|  Are you sure you want to park this payment?     |
|                                                  |
|  Agent:     A. Mokoena                           |
|  Claim Date: 15/04/2026                          |
|  Amount:    R 11 400,00                          |
|                                                  |
|                       [Cancel]  [Confirm Park]   |
+--------------------------------------------------+
```

### Modal: Park Selected (bulk)

```
+--------------------------------------------------+
|  Park selected payments?                    [x]  |
|--------------------------------------------------|
|  You are about to park 3 payments.               |
|  Combined value: R 34 250,00                     |
|                                                  |
|                       [Cancel]  [Confirm Park]   |
+--------------------------------------------------+
```

### Modal: Unpark (mirror of Park modals)

Same shape as park modals but labelled "Unpark" and reading "move this payment back to the Main Grid".

### Modal: Initiate Payment

```
+--------------------------------------------------+
|  Initiate payment for RE/MAX?               [x]  |
|--------------------------------------------------|
|  This will batch ALL payments in the Main Grid.  |
|                                                  |
|  Number of payments: 12                          |
|  Total commission:   R 456 789,00                |
|                                                  |
|                   [Cancel]  [Confirm & Initiate] |
+--------------------------------------------------+
```

### After successful Initiate Payment

Success toast appears (bottom-right) with an invoice download link:

```
+-----------------------------------------------+
|  Batch created successfully.                  |
|  12 payments totalling R 456 789,00.          |
|                [Download invoice]  [Dismiss]  |
+-----------------------------------------------+
```

Main Grid refreshes to the empty-state message. Screen stays on Payment Management (R31).

### Elements

| Element | Type | Description |
|---------|------|-------------|
| Page title | Heading | "Payment Management — [AgencyName]" |
| Change agency | Link / Button | Returns to sub-state A (agency selector) |
| Initiate Payment | Button (primary) | Opens Initiate Payment modal; batches all Main Grid rows |
| Filter bar | Filter controls | Filter by Claim Date, Agency Name, Status |
| Main Grid | Data table | Columns: checkbox, BatchId, ClaimDate, "AgentName AgentSurname", BondAmount (R-format), CommissionType, Comm% (derived), GrantDate, RegDate, Bank, CommissionAmount, VAT, Status (REG / MAN-PAY), Action |
| Row Park button | Button | Opens single-payment Park confirmation modal |
| Park Selected | Button | Disabled when no rows selected; opens bulk Park modal |
| Parked Grid | Data table | Same columns as Main Grid; Action column shows Unpark |
| Row Unpark button | Button | Opens single-payment Unpark confirmation modal |
| Unpark Selected | Button | Disabled when no rows selected; opens bulk Unpark modal |
| Empty-state panel | Card / Empty-state | Shown when Main + Parked grids are both empty for the selected agency (R24) |
| Loading spinner | Overlay | During `GET /v1/payments?AgencyName=...` fetch |
| Error toast | Toast (dismissible) | Surfaces API failures with "Dismiss" |

### User Actions

- **Click Park on a row:** Opens confirmation modal; on confirm, `PUT /v1/payments/park` with one PaymentId; row moves to Parked Grid; success toast.
- **Multi-select + Park Selected:** Opens bulk modal showing count and combined total; on confirm, `PUT /v1/payments/park` with all selected IDs. Partial-success path: successful rows move to Parked Grid; error toast lists failed rows (BR6).
- **Click Unpark / Unpark Selected:** Mirrors the Park flow in reverse using `PUT /v1/payments/unpark`.
- **Click Initiate Payment:** Modal summarises count + total; on confirm, `POST /v1/payment-batches` with all Main Grid `PaymentIds` and the `LastChangedUser` header set from the NextAuth session (R30, CR2). Success toast + invoice download link.
- **Click Download invoice (toast or modal):** `POST /v1/payment-batches/{Id}/download-invoice-pdf` triggers a browser PDF download.
- **Change filter:** Filter values update the Main Grid view client-side (no new API call needed per spec).
- **Change agency:** Returns to sub-state A.

### Business rules surfaced

- BR2: Main and Parked grids are mutually exclusive UI states.
- BR3: Rows with a `BatchId` do NOT render a Park button (payment already batched).
- BR4: Initiate Payment batches ALL Main Grid rows — the Initiate button is NOT tied to row selection.
- BR5: No minimum batch size — Initiate is enabled even with a single eligible payment.
- BR7: Commission % is derived client-side and formatted to 2 decimals.
- BR8: Agent display combines `AgentName AgentSurname`.
- BR9: Bank account / VAT numbers are not displayed.
- BR10: All currency in en-ZA format.

## Navigation

- **From:** Dashboard agency row click (R16), top nav link (admin only), direct URL.
- **To:** Dashboard (top nav), Payments Made (top nav), Users (top nav, admin), sub-state A via "Change agency".

## Notes

- Responsive: on mobile the grid collapses to a card list per row; filter bar becomes a modal sheet (NFR4).
- Rows with a `BatchId` render the Action cell empty (no Park button) per BR3.
- All modal dialogs are keyboard-navigable; focus is trapped and returned to the triggering control on close (NFR1, NFR2).
