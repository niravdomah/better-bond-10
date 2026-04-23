# Wireframes: BetterBond Commission Payments POC

## Summary

The application is a three-core-screen internal tool (plus Sign In, Batch Detail View, and Users) for BetterBond payments administrators. Admins work across Dashboard, Payment Management (with agency-selector and payment-grid sub-states), Payments Made, the Batch Detail View, and the Users screen. Viewers get read-only access to Dashboard and Payments Made only. All screens share a permanent top navigation bar and footer. The MortgageMax brand applies a navy primary palette in light mode (sidebar/nav navy, white content area) and a navy-tinted dark mode with teal accents.

## Screens

| # | Screen | Description | File |
|---|--------|-------------|------|
| 1 | Sign In | NextAuth credentials form; no self-signup | `screen-1-sign-in.md` |
| 2 | Dashboard | Summary charts, totals, aging report, and agency summary grid | `screen-2-dashboard.md` |
| 3 | Payment Management | Admin-only; agency-selector sub-state and payment-grid sub-state (Main + Parked grids) | `screen-3-payment-management.md` |
| 4 | Payments Made | Historical batch grid with invoice download | `screen-4-payments-made.md` |
| 5 | Batch Detail View | Individual payments in a selected batch plus invoice link | `screen-5-batch-detail-view.md` |
| 6 | Users | Admin-only user management (create/invite + role assignment) | `screen-6-users.md` |

## Screen Flow

```
[Sign In] -> [Dashboard] -> [Payment Management (agency-selector)] -> [Payment Management (grid)]
              |                                                             |
              |                                                             v
              |                                                        [Initiate Payment Modal]
              v
           [Payments Made] -> [Batch Detail View]

[Dashboard] -> [Users] (admin only)
```

## Design Notes

- **Navigation chrome:** Every authenticated screen renders a permanent top nav (logo, links: Dashboard / Payment Management [admin] / Payments Made / Users [admin], plus theme toggle and profile menu on the right). An app footer carries the admin-only "Reset Demo" button.
- **Role gating:** Payment Management and Users are admin-only. Viewers navigating to either are redirected to the Dashboard. Non-admins do not see those links in the nav or the Reset Demo button in the footer.
- **Loading & errors:** All data-loading regions show a spinner during fetch. All API errors surface as dismissible toasts anchored bottom/right, non-blocking.
- **Responsive:** Data grids collapse to card lists on mobile (<768px). Filter/search bars become modal sheets on mobile. Dashboard metric cards use a 4-column desktop / 2-column tablet / 1-column mobile grid.
- **Currency:** All money values shown in en-ZA locale (`R 1 234 567,89`).
- **Theme:** Light mode uses navy nav + white content. Dark mode inverts to a dark navy-tinted background with teal accents for interactive elements. Theme toggle lives in the top nav and persists to localStorage.
- **Commission %:** Derived client-side (`CommissionAmount / BondAmount`), 2-decimal format, never submitted.
- **Agent names:** `AgentName AgentSurname` combined for display in grids.
- **POPIA:** Agent-level PII (AgentName / AgentSurname) appears only on admin screens. Viewer-visible screens (Dashboard, Payments Made) show agency-level aggregates only.
