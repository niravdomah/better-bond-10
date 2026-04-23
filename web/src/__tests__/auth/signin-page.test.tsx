/**
 * Epic 1, Story 1.1 — Sign-in page and NextAuth session
 *
 * Tests the BetterBond sign-in page and NextAuth session behavior.
 * These tests are the executable form of the acceptance criteria from:
 *   generated-docs/stories/epic-1-auth-shell-navigation/story-1-1-signin-page.md
 *   generated-docs/test-design/epic-1-auth-shell-navigation/story-1-1-signin-page-test-design.md
 *
 * User-resolved BA decisions (must be reflected in behavior):
 *  - BA-1 Option A: session identity = email address
 *  - BA-2 Option A: on failed sign-in, password field is CLEARED, email is PRESERVED
 *  - BA-3 Option C: first-ever visit defaults to DARK mode
 *  - BA-4 Option B: Sign Out lives in a user menu (avatar/name dropdown), on every authed page
 */

import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

type SignInResult = { ok: boolean; error?: string };
const signInMock: Mock<
  (provider: string, opts: Record<string, unknown>) => Promise<SignInResult>
> = vi.fn();
const signOutMock: Mock<() => Promise<void>> = vi.fn();
const pushMock = vi.fn();
const refreshMock = vi.fn();
const replaceMock = vi.fn();

vi.mock('next-auth/react', () => ({
  __esModule: true,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: (provider: string, opts: Record<string, unknown>) =>
    signInMock(provider, opts),
  signOut: () => signOutMock(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
    replace: replaceMock,
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/auth/signin',
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import SignInPage from '@/app/auth/signin/page';

beforeEach(() => {
  signInMock.mockReset();
  signOutMock.mockReset();
  pushMock.mockReset();
  refreshMock.mockReset();
  replaceMock.mockReset();
});

describe('Sign-in page: visible elements (AC-2)', () => {
  it('shows BetterBond branding, email field, password field, and Sign In button', () => {
    render(<SignInPage />);

    // AC-2 visible elements — BetterBond branding
    expect(screen.getByText(/betterbond/i)).toBeInTheDocument();

    // Email field (semantic, by label)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    // Password field (semantic, by label)
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    // Sign In button
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it('does not expose a public sign-up link (R41, no self-signup)', () => {
    render(<SignInPage />);
    // There should be no "Sign up" link on the sign-in page
    expect(screen.queryByRole('link', { name: /sign up/i })).toBeNull();
  });
});

describe('Sign-in page: successful sign-in redirects to /dashboard (AC-3, AC-4)', () => {
  it('admin submits valid credentials and is taken to the Dashboard', async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({ ok: true });

    render(<SignInPage />);

    await user.type(
      screen.getByLabelText(/email/i),
      'alice.admin@betterbond.example',
    );
    await user.type(screen.getByLabelText(/password/i), 'Correct1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('viewer submits valid credentials and is taken to the Dashboard', async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({ ok: true });

    render(<SignInPage />);

    await user.type(
      screen.getByLabelText(/email/i),
      'vera.viewer@agency.example',
    );
    await user.type(screen.getByLabelText(/password/i), 'Correct1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });
});

describe('Sign-in page: failed sign-in (AC-11)', () => {
  it('shows an inline error and stays on /auth/signin when credentials are invalid', async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({ ok: false, error: 'CredentialsSignin' });

    render(<SignInPage />);

    await user.type(
      screen.getByLabelText(/email/i),
      'alice.admin@betterbond.example',
    );
    await user.type(screen.getByLabelText(/password/i), 'WrongPass1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Plain-English error on the form
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/email or password is incorrect/i);

    // No redirect happened
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('BA-2 Option A: clears the password field and preserves the email after a failed attempt', async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({ ok: false, error: 'CredentialsSignin' });

    render(<SignInPage />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /password/i,
    ) as HTMLInputElement;

    await user.type(emailInput, 'alice.admin@betterbond.example');
    await user.type(passwordInput, 'WrongPass1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      // Email preserved
      expect(emailInput.value).toBe('alice.admin@betterbond.example');
      // Password cleared
      expect(passwordInput.value).toBe('');
    });
  });
});

describe('Sign-in page: empty form validation (AC-10)', () => {
  it('blocks submission when email or password is empty', async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({ ok: true });

    render(<SignInPage />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // No sign-in request made (validation stopped it)
    expect(signInMock).not.toHaveBeenCalled();

    // And no navigation to /dashboard
    expect(pushMock).not.toHaveBeenCalled();
  });
});

describe('Sign-in page: network failure (AC-12)', () => {
  it('shows an inline error when the auth request cannot be completed', async () => {
    const user = userEvent.setup();
    signInMock.mockRejectedValue(new Error('Network down'));

    render(<SignInPage />);

    await user.type(
      screen.getByLabelText(/email/i),
      'alice.admin@betterbond.example',
    );
    await user.type(screen.getByLabelText(/password/i), 'Correct1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/could not be completed/i);

    // Email is preserved so the user can retry (BA-2 is about password-clear too)
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput.value).toBe('alice.admin@betterbond.example');
  });
});

describe('Sign-in page: accessibility (AC-13, AC-14)', () => {
  it('labels every interactive field for screen readers', () => {
    render(<SignInPage />);

    // getByLabelText asserts an accessible name — tests screen-reader labelling
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it('password input uses password type so screen readers announce protected text', () => {
    render(<SignInPage />);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('supports keyboard-only sign-in (AC-13)', async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({ ok: true });

    render(<SignInPage />);

    // Tab focus order
    await user.tab(); // email
    expect(screen.getByLabelText(/email/i)).toHaveFocus();
    await user.keyboard('alice.admin@betterbond.example');

    await user.tab(); // password
    expect(screen.getByLabelText(/password/i)).toHaveFocus();
    await user.keyboard('Correct1!');

    // Submit via Enter from the password field
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalled();
    });
  });
});
