# Screen: Batch Detail View

## Purpose

Drill-down view of a single payment batch. Shows the batch header (agency, totals) and the individual payments that make up the batch, plus the invoice download link. Reached by clicking a batch row on the Payments Made screen.

## Wireframe

```
+--------------------------------------------------------------------------+
| [MortgageMax Logo]  Dashboard | Payment Mgmt | Payments Made | Users     |
|                                               [Theme] [User v]           |
+--------------------------------------------------------------------------+
|                                                                          |
|  [< Back to Payments Made]                                               |
|                                                                          |
|  Batch: INV-2026-0417-RE                                                 |
|  ────────────────────────────────────────────────────────────────────    |
|                                                                          |
|  +---------------------+ +---------------------+ +---------------------+ |
|  | Agency              | | Created             | | Status              | |
|  | RE/MAX              | | 17 Apr 2026 14:32   | | Submitted           | |
|  +---------------------+ +---------------------+ +---------------------+ |
|  +---------------------+ +---------------------+                         |
|  | # Payments          | | Total Commission    |    [Download invoice]  |
|  | 12                  | | R 456 789,00        |                        |
|  +---------------------+ +---------------------+                         |
|                                                                          |
|  Payments in this batch                                                  |
|  +----------------------------------------------------------------------+|
|  | Claim    | Agent Name    | Bond     | Comm  | Comm %| Reg Date  |    ||
|  | Date     |               | Amount   | Type  |       |           |    ||
|  |----------|---------------|----------|-------|-------|-----------|    ||
|  | 15/04/26 | A. Mokoena    | R 1 200k | Bond  | 0,95% | 10/04/26  |    ||
|  | 14/04/26 | S. van der M. | R   950k | Bond  | 0,80% | 09/04/26  |    ||
|  | 13/04/26 | T. Naidoo     | R 1 450k | MAN-P | 1,10% | 08/04/26  |    ||
|  | 12/04/26 | K. Botha      | R   780k | Bond  | 0,85% | 07/04/26  |    ||
|  | ...                                                                ||
|  +----------------------------------------------------------------------+|
|                                                                          |
|  Totals                                                                  |
|  Commission: R 456 789,00    VAT: R 68 518,35    Grand Total: R 525 307,35|
|                                                                          |
+--------------------------------------------------------------------------+
| Footer                                       [Reset Demo] (admin only)   |
+--------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Back link | Link | Returns to Payments Made grid |
| Batch title | Heading | Shows batch Reference (e.g., `INV-2026-0417-RE`) |
| Agency card | Metric card | `AgencyName` of the batch |
| Created card | Metric card | `CreatedDate` formatted `d MMM yyyy HH:mm` |
| Status card | Metric card | Batch `Status` (e.g., Submitted) |
| # Payments card | Metric card | `PaymentCount` |
| Total Commission card | Metric card | `TotalCommissionAmount` en-ZA format |
| Download invoice | Button | Calls `POST /v1/payment-batches/{Id}/download-invoice-pdf` |
| Payments table | Data table | Rows from `GET /v1/payment-batches/{Id}` — individual `Payment` records in the batch |
| Totals row | Summary | Commission + VAT + Grand Total across the batch's payments |
| Loading spinner | Overlay | During `GET /v1/payment-batches/{Id}` fetch |
| Error toast | Toast (dismissible) | Surfaces API failures with "Dismiss" |

## Payments table columns

Claim Date, "AgentName AgentSurname", Bond Amount (R-format), Commission Type (Bond / MAN-PAY), Commission % (derived client-side), Registration Date, Grant Date, Commission Amount, VAT, Bank, Status. Columns may be virtualised / horizontally scrollable on narrow viewports.

## User Actions

- **Click Back to Payments Made:** Returns to the batch grid.
- **Click Download invoice:** Triggers a browser PDF download.
- **Dismiss error toast:** Removes the toast; page remains interactive.

## Navigation

- **From:** Payments Made (clicking a batch row, R37).
- **To:** Payments Made (Back link), Dashboard / Payment Management / Users via top nav.

## Viewer / Admin differences

- Viewers CAN reach this screen via Payments Made. Consideration: individual `Payment` records in this view include `AgentName` and `AgentSurname`, which are classified as agent-level PII per CR4. **Open question for SCOPE:** if viewers must not see agent-level PII, the batch detail payments table should be limited to non-PII columns for viewers (or the view restricted to admin entirely). The wireframe currently shows all columns; role gating for agent-level fields to be finalised during story definition.
- Viewer chrome omits Payment Management / Users / Reset Demo.

## Notes

- R37 drives this screen.
- `Payment` fields visible per row mirror the Payment Management Main Grid columns (minus Action / Park controls — no mutation on a batched payment per BR3).
- Currency in en-ZA format.
- Mobile: cards stack 1-column; payments table becomes a card list (NFR4).
