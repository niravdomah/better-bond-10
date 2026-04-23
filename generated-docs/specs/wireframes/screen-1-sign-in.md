# Screen: Sign In

## Purpose

Authenticate a user via NextAuth credentials provider. On success, redirect to the Dashboard; on failure, show an inline form error. No self-signup.

## Wireframe

```
+------------------------------------------------------------------+
|                                                                  |
|                                                                  |
|                      [MortgageMax Logo]                          |
|                                                                  |
|                +------------------------------+                  |
|                |                              |                  |
|                |     Sign in to continue      |                  |
|                |  ──────────────────────────  |                  |
|                |                              |                  |
|                |  Email                       |                  |
|                |  [user@mortgagemax.co.za   ] |                  |
|                |                              |                  |
|                |  Password                    |                  |
|                |  [••••••••••••••••••••••  ] |                  |
|                |                              |                  |
|                |  [  Sign in               ]  |                  |
|                |                              |                  |
|                |  (inline error shown here    |                  |
|                |   if credentials invalid)    |                  |
|                |                              |                  |
|                +------------------------------+                  |
|                                                                  |
|      Accounts are provisioned by your administrator.             |
|                                                                  |
|                                                                  |
+------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| MortgageMax Logo | Image | Brand mark centred above the form |
| Email | Input (email) | Credential field; required |
| Password | Input (password) | Credential field; required |
| Sign in | Button (primary) | Submits credentials to NextAuth |
| Inline error message | Text (error style) | Shown beneath the button on authentication failure |
| Footer note | Text | "Accounts are provisioned by your administrator." — no self-signup link |

## User Actions

- **Enter email + password, click Sign in:** NextAuth validates credentials. On success, redirect to Dashboard. On failure, inline error appears; form fields preserved.
- **Submit empty / malformed email:** Client-side validation prevents submission; field-level error shown.

## Navigation

- **From:** Application root when no session exists (NextAuth redirect).
- **To:** Dashboard on successful authentication.

## Notes

- No "Sign up", "Forgot password", or "Remember me" controls in POC scope.
- No public self-signup flow (R1, R41).
- Form is keyboard-navigable end-to-end (NFR1).
- Logo is decorative — fields have visible labels (NFR2).
- This is the only authenticated-chrome-free screen — the top nav bar and footer are NOT rendered here.
