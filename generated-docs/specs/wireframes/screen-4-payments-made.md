# Screen: Payments Made

## Purpose

Historical view of payment batches across all agencies. Both admin and viewer roles have access. Supports filtering by Agency or Batch ID and downloading the invoice PDF per row. Clicking a row opens the Batch Detail View.

## Wireframe

```
+--------------------------------------------------------------------------+
| [MortgageMax Logo]  Dashboard | Payment Mgmt | Payments Made | Users     |
|                                               [Theme] [User v]           |
+--------------------------------------------------------------------------+
|                                                                          |
|  Payments Made                                                           |
|  ────────────────────────────────────────────────────────────────────    |
|                                                                          |
|  Filters:  [Agency: all v]  [Batch ID / Reference: ________ ]  [x]       |
|                                                                          |
|  +----------------------------------------------------------------------+|
|  | Agency Name    | # Payments | Total Commission | VAT      | Invoice ||
|  |----------------|------------|------------------|----------|---------||
|  | RE/MAX         | 12         | R 456 789,00     | R 68 518 |[PDF v]  ||
|  | Pam Golding    |  9         | R 321 456,78     | R 48 218 |[PDF v]  ||
|  | Seeff          |  7         | R 234 567,89     | R 35 185 |[PDF v]  ||
|  | Chas Everitt   |  5         | R 187 654,32     | R 28 148 |[PDF v]  ||
|  | Harcourts      |  4         | R 145 230,00     | R 21 784 |[PDF v]  ||
|  | ...            | ...        | ...              | ...      |[PDF v]  ||
|  +----------------------------------------------------------------------+|
|                                                                          |
|  (When no batches match filter:)                                         |
|  ┌────────────────────────────────────────────────────────────────┐     |
|  │                                                                │     |
|  │                No payment batches found                        │     |
|  │         Try clearing your filters or come back later.          │     |
|  │                                                                │     |
|  └────────────────────────────────────────────────────────────────┘     |
|                                                                          |
+--------------------------------------------------------------------------+
| Footer                                        [Reset Demo] (admin only)  |
+--------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Filter - Agency | Select / Combobox | Filter grid by Agency Name |
| Filter - Batch ID / Reference | Text input | Filter by batch Reference field (R35) |
| Clear filters | Button | Resets both filter controls |
| Main grid | Data table | One row per payment batch from `GET /v1/payment-batches` |
| Agency Name column | Text | Agency this batch was generated for |
| # Payments column | Number | `PaymentCount` in the batch |
| Total Commission column | Currency | `TotalCommissionAmount` en-ZA format |
| VAT column | Currency | `TotalVat` en-ZA format |
| Invoice link | Button / Link (`[PDF v]`) | Triggers `POST /v1/payment-batches/{Id}/download-invoice-pdf`; browser downloads the PDF |
| Row clickable area | Row action | Clicking anywhere on the row (outside the Invoice link) opens the Batch Detail View |
| Loading spinner | Overlay | During `GET /v1/payment-batches` fetch |
| Empty-state panel | Card | Shown when no batches match the current filters |
| Error toast | Toast (dismissible) | Surfaces API failures with "Dismiss" |

## User Actions

- **Filter by Agency or Batch ID:** Grid updates client-side.
- **Click Invoice link:** `POST /v1/payment-batches/{Id}/download-invoice-pdf` is called; browser downloads the PDF (R36).
- **Click batch row (outside Invoice link):** Opens the Batch Detail View for that batch (R37).
- **Dismiss error toast:** Removes the toast; page remains interactive.

## Navigation

- **From:** Top nav (both admin and viewer), direct URL.
- **To:** Batch Detail View (row click), Dashboard / Payment Management / Users via top nav.

## Viewer / Admin differences

- Both roles see identical grid content (agency-level aggregates per CR4).
- Viewers do NOT see Payment Management or Users in the nav, and do NOT see Reset Demo in the footer.

## Notes

- R34-R38 drive this screen's content.
- `PaymentBatch` fields used: Id, AgencyName, PaymentCount, TotalCommissionAmount, TotalVat, Reference.
- Currency in en-ZA format (NFR9, BR10).
- Mobile: grid collapses to a card list (NFR4). Invoice link remains tappable per card.
- No row-level Park / Unpark actions — this is a historical view only.
