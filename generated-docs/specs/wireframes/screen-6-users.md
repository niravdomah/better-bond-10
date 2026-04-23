# Screen: Users (Admin only)

## Purpose

Admin-only user management. Admins can invite/create users and assign them the `admin` or `viewer` role. Viewer navigation to this screen redirects to the Dashboard (R40). There is no public self-signup (R41).

## Access control

- Admin role only. Viewers navigating here are redirected to Dashboard.
- Users link is rendered in the top nav only when the session role is `admin`.

## Wireframe

```
+--------------------------------------------------------------------------+
| [MortgageMax Logo]  Dashboard | Payment Mgmt | Payments Made | Users     |
|                                               [Theme] [User v]           |
+--------------------------------------------------------------------------+
|                                                                          |
|  Users                                            [+ Invite user]        |
|  ────────────────────────────────────────────────────────────────────    |
|                                                                          |
|  Filters:  [Role: any v]  [Search name/email: ______________ ]  [x]      |
|                                                                          |
|  +----------------------------------------------------------------------+|
|  | Name / Email                 | Role     | Created       | Actions   ||
|  |------------------------------|----------|---------------|-----------||
|  | Lindiwe Dlamini              | admin    | 02 Mar 2026   | [Edit][x]||
|  |   lindiwe@betterbond.co.za   |          |               |          ||
|  |------------------------------|----------|---------------|-----------||
|  | Michael Smith                | admin    | 15 Mar 2026   | [Edit][x]||
|  |   m.smith@betterbond.co.za   |          |               |          ||
|  |------------------------------|----------|---------------|-----------||
|  | Priya Naidoo                 | viewer   | 20 Mar 2026   | [Edit][x]||
|  |   priya@remax.co.za          |          |               |          ||
|  |------------------------------|----------|---------------|-----------||
|  | ...                          | ...      | ...           | ...      ||
|  +----------------------------------------------------------------------+|
|                                                                          |
+--------------------------------------------------------------------------+
| Footer                                        [Reset Demo]               |
+--------------------------------------------------------------------------+
```

### Modal: Invite user

```
+--------------------------------------------------+
|  Invite user                                [x]  |
|--------------------------------------------------|
|  Name                                            |
|  [Full name...                              ]    |
|                                                  |
|  Email                                           |
|  [user@...                                  ]    |
|                                                  |
|  Temporary password                              |
|  [••••••••••                              ]      |
|                                                  |
|  Role                                            |
|  ( ) admin                                       |
|  (o) viewer                                      |
|                                                  |
|                    [Cancel]  [Create user]       |
+--------------------------------------------------+
```

### Modal: Edit user (role change)

```
+--------------------------------------------------+
|  Edit user                                  [x]  |
|--------------------------------------------------|
|  Name:  Priya Naidoo                             |
|  Email: priya@remax.co.za                        |
|                                                  |
|  Role                                            |
|  ( ) admin                                       |
|  (o) viewer                                      |
|                                                  |
|                    [Cancel]  [Save changes]      |
+--------------------------------------------------+
```

### Modal: Delete confirmation

```
+--------------------------------------------------+
|  Remove user?                               [x]  |
|--------------------------------------------------|
|  You are about to remove Priya Naidoo from the   |
|  system. They will lose access immediately.      |
|                                                  |
|  This cannot be undone.                          |
|                                                  |
|                      [Cancel]  [Remove user]     |
+--------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Invite user | Button (primary) | Opens the Invite modal |
| Filter - Role | Select | Filter grid to admin / viewer / any |
| Search | Text input | Free-text search across name and email |
| Clear filters | Button | Resets filter controls |
| Users grid | Data table | One row per user |
| Edit action | Row button | Opens Edit modal — allows role change |
| Delete action (`[x]`) | Row button | Opens Delete confirmation modal |
| Invite modal | Dialog | Fields: name, email, temporary password, role (radio admin/viewer); submits to user creation endpoint |
| Edit modal | Dialog | Shows name + email read-only; role radio editable |
| Delete modal | Dialog | Confirmation before removing user |
| Loading spinner | Overlay | During user list fetch |
| Error toast | Toast (dismissible) | Surfaces API failures with "Dismiss" |
| Success toast | Toast (dismissible) | Confirms invite / edit / delete success |

## User Actions

- **Invite user:** Admin enters name, email, temporary password, role (admin or viewer), clicks Create. On success, the row is added to the grid and the invitee can sign in with those credentials (R39, R41).
- **Edit role:** Admin opens the Edit modal for a row, changes role, saves. Grid row reflects the new role.
- **Delete user:** Admin clicks the delete icon, confirms in the modal. Row disappears from the grid.
- **Filter / search:** Client-side filtering by role and name/email.

## Navigation

- **From:** Top nav (admin only).
- **To:** Dashboard / Payment Management / Payments Made via top nav.

## Notes

- API endpoints for user management are not enumerated in the current `api-spec.yaml` — they will be finalised during SCOPE / story definition. For the POC, the backing store can be kept simple (e.g., NextAuth credentials provider with a seeded user table).
- Role assignment is binary: admin or viewer (R39).
- No password reset flow in POC scope — admins issue a temporary password at invite time; password rotation is an open item.
- POPIA: personal data visible on this screen (user names, emails) is scoped to admin-only access (CR1 — data minimisation).
- All modals are keyboard-navigable and screen-reader labelled (NFR1, NFR2).
- Currency / en-ZA formatting: N/A — no monetary values on this screen.
- Responsive: grid collapses to card list on mobile (NFR4).
