/**
 * Epic 1, Story 1.1 — User menu and Sign Out
 *
 * Covers:
 *   AC-5 — signed-in user's email or display name is visible in the page header
 *   AC-9 — clicking Sign Out ends the session and returns the user to /auth/signin
 *   BA-4 Option B — Sign Out lives inside a user menu (avatar/name dropdown) available on every authenticated page
 */

import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const signOutMock: Mock<(opts?: unknown) => Promise<void>> = vi.fn();

vi.mock('next-auth/react', () => ({
  __esModule: true,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: vi.fn(() => ({
    data: {
      user: {
        id: '1',
        email: 'alice.admin@betterbond.example',
        name: 'Alice Admin',
        role: 'admin',
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  })),
  signIn: vi.fn(),
  signOut: (opts?: unknown) => signOutMock(opts),
}));

import { UserMenu } from '@/components/auth/user-menu';

beforeEach(() => {
  signOutMock.mockReset();
});

describe('User menu (BA-4 Option B, AC-5, AC-9)', () => {
  it('shows the signed-in user identity as the trigger (AC-5)', () => {
    render(<UserMenu />);
    // The trigger button must expose the email or name so the user can confirm
    // which account they are in.
    const trigger = screen.getByRole('button', {
      name: /alice|alice\.admin@betterbond\.example/i,
    });
    expect(trigger).toBeInTheDocument();
  });

  it('Sign Out is not visible until the menu is opened (BA-4 Option B — dropdown)', () => {
    render(<UserMenu />);
    // Initially hidden inside dropdown
    expect(
      screen.queryByRole('menuitem', { name: /sign out/i }),
    ).not.toBeInTheDocument();
  });

  it('opens a dropdown revealing a Sign Out option (BA-4 Option B)', async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    const trigger = screen.getByRole('button', {
      name: /alice|alice\.admin@betterbond\.example/i,
    });
    await user.click(trigger);

    // After opening the menu, Sign Out must be an accessible menuitem
    const signOutItem = await screen.findByRole('menuitem', {
      name: /sign out/i,
    });
    expect(signOutItem).toBeInTheDocument();
  });

  it('clicking Sign Out calls next-auth signOut and targets /auth/signin (AC-9)', async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    const trigger = screen.getByRole('button', {
      name: /alice|alice\.admin@betterbond\.example/i,
    });
    await user.click(trigger);

    const signOutItem = await screen.findByRole('menuitem', {
      name: /sign out/i,
    });
    await user.click(signOutItem);

    expect(signOutMock).toHaveBeenCalled();
    const firstCallArg = signOutMock.mock.calls[0]?.[0] as
      | { callbackUrl?: string }
      | undefined;
    expect(firstCallArg?.callbackUrl).toBe('/auth/signin');
  });
});
