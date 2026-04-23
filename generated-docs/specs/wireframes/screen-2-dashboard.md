# Screen: Dashboard

## Purpose

Landing screen after sign-in. Summarises commission payments across all agencies with totals, charts, aging report, and a clickable agency summary grid that drills down into Payment Management.

## Wireframe

```
+--------------------------------------------------------------------------+
| [MortgageMax Logo]  Dashboard | Payment Mgmt | Payments Made | Users     |
|                                               [Theme] [User v]           |
+--------------------------------------------------------------------------+
|                                                                          |
|  Dashboard                                                               |
|  ────────────────────────────────────────────────────────────────────    |
|                                                                          |
|  +------------------+ +------------------+ +------------------+          |
|  | Total Value      | | Total Value of   | | Total Payments   |          |
|  | Ready for Pmt    | | Parked Payments  | | Made (Last 14d)  |          |
|  | R 3 456 789,00   | | R   987 654,32   | |  R 12 345 678,00 |          |
|  +------------------+ +------------------+ +------------------+          |
|                                                                          |
|  +----------------------------------+  +------------------------------+  |
|  | Payments Ready for Payment       |  | Parked Payments              |  |
|  | (bar chart by Commission Type)   |  | (bar chart by Commission     |  |
|  |  Bond Comm  ████████████ 42      |  |  Type)                       |  |
|  |  Manual Pmt ██████ 18            |  |  Bond Comm  ████ 8           |  |
|  |                                  |  |  Manual Pmt ██ 4             |  |
|  +----------------------------------+  +------------------------------+  |
|                                                                          |
|  +----------------------------------------------------------------------+|
|  | Parked Payments Aging Report                                         ||
|  | (bar chart grouped by day-range)                                     ||
|  |   1-3 days  ████████ 6                                               ||
|  |   4-7 days  ████ 3                                                   ||
|  |   > 7 days  ██ 2                                                     ||
|  +----------------------------------------------------------------------+|
|                                                                          |
|  Agency Summary                                                          |
|  ────────────────────────────────────────────────────────────────────    |
|  +----------------------------------------------------------------------+|
|  | Agency Name   | # Payments | Total Commission | VAT       |          ||
|  |---------------|------------|------------------|-----------|          ||
|  | RE/MAX        | 12         | R   456 789,00   | R  68 518 | [>]      ||
|  | Pam Golding   |  9         | R   321 456,78   | R  48 218 | [>]      ||
|  | Seeff         |  7         | R   234 567,89   | R  35 185 | [>]      ||
|  | Chas Everitt  |  5         | R   187 654,32   | R  28 148 | [>]      ||
|  | ...           | ...        | ...              | ...       | [>]      ||
|  +----------------------------------------------------------------------+|
|                                                                          |
+--------------------------------------------------------------------------+
| Footer                          [Reset Demo] (admin only)                |
+--------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Top nav | Navigation bar | Permanent chrome; active link highlighted. Viewer does NOT see "Payment Mgmt" or "Users". |
| Theme toggle | Icon button | Switches between light / dark; persisted to localStorage |
| User menu | Dropdown | Account identity + Sign out |
| Total Value Ready for Payment | Metric card | Sum of eligible `TotalPaymentAmount` from `PaymentStatusReport` |
| Total Value of Parked Payments | Metric card | Sum of parked payment values |
| Total Payments Made (Last 14d) | Metric card | Derived from `TotalPaymentCountInLast14Days` and related amounts |
| Payments Ready for Payment | Bar chart | Counts split by Commission Type (Bond Comm / Manual Payments) |
| Parked Payments | Bar chart | Counts split by Commission Type |
| Parked Payments Aging Report | Bar chart | Counts in day-range buckets (1-3, 4-7, >7) |
| Agency Summary grid | Data table | One row per agency from `PaymentsByAgency` |
| Agency row action | Button / link (`[>]`) | Navigates to Payment Management for that agency |
| Loading spinner | Overlay | Shown while `GET /v1/payments/dashboard` is in flight |
| Error toast | Toast (dismissible, bottom-right) | Surfaces API failures with a "Dismiss" option |
| Reset Demo (footer) | Button (admin only) | Opens confirmation modal before `POST /demo/reset-demo` |

## User Actions

- **Click an agency row:** Dashboard charts update to reflect that agency's metrics (BR13, R17), AND user is navigated to `/payment-management?agency=<AgencyName>` (R16).
- **Click Reset Demo (admin):** Confirmation modal appears; on confirm, `POST /demo/reset-demo` is called; success/error toast is shown.
- **Toggle theme:** Light / dark switch applied immediately, persisted to localStorage.
- **Dismiss error toast:** Clicking "Dismiss" removes the toast; user interaction is never blocked.

## Navigation

- **From:** Sign In (post-authentication), or top nav Dashboard link from any other screen.
- **To:** Payment Management (via agency row click), Payments Made (top nav), Users (top nav, admin only), Sign In (Sign out from user menu).

## Viewer / Admin differences

- Viewer sees identical layout except: top nav omits "Payment Mgmt" and "Users"; Reset Demo button is not rendered in the footer. Viewer still sees all dashboard metrics and the Agency Summary grid (agency-level aggregates are in scope per CR4).

## Notes

- R8-R18 drive this screen's content.
- Data model: `DashboardSummary` from `GET /v1/payments/dashboard`.
- Currency formatted via `Intl.NumberFormat('en-ZA', { currency: 'ZAR' })` — e.g., `R 1 234 567,89`.
- Charts are rendered with a Shadcn Chart component; teal accents used in dark mode only (contrast constraint per NFR10).
- Mobile: metric cards stack 1-column; charts stack vertically; agency summary becomes a card list.
