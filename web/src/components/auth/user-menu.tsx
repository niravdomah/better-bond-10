'use client';

/**
 * BetterBond user menu — BA-4 Option B.
 *
 * A dropdown trigger bearing the signed-in user's display name (or email)
 * that opens to expose the Sign Out action. Intended to be rendered in the
 * authenticated shell on every page.
 */

import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

export function UserMenu(): React.ReactElement | null {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }
    return undefined;
  }, [open]);

  if (!session?.user) {
    return null;
  }

  const label = session.user.name || session.user.email || 'Account';

  const handleSignOut = async (): Promise<void> => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <Button
        type="button"
        variant="ghost"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </Button>
      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 mt-2 min-w-[10rem] rounded-md border border-border bg-background shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
