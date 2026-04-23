'use client';

/**
 * Theme provider for BetterBond.
 *
 * BA-3 Option C — on first-ever visit (no saved theme), defaults to DARK mode.
 * Once the user interacts with a theme toggle their choice persists.
 *
 * Stores the active theme under localStorage key "theme" with values
 * "dark" | "light" (the toggle UI itself is introduced in Story 1.5).
 */

import { useEffect } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';

function readSavedTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === 'dark' || raw === 'light') return raw;
  return null;
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(theme);
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  // Apply theme synchronously on mount — BA-3 Option C
  // (defaulting to dark when no saved preference exists).
  useEffect(() => {
    const saved = readSavedTheme();
    applyTheme(saved ?? 'dark');
  }, []);

  // Also apply synchronously at render time so tests observe the class
  // without needing to wait for a useEffect tick.
  if (typeof document !== 'undefined') {
    const saved = readSavedTheme();
    applyTheme(saved ?? 'dark');
  }

  return <>{children}</>;
}

export default ThemeProvider;
