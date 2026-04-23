/**
 * Epic 1, Story 1.1 — First-visit theme default (BA-3 Option C)
 *
 * On a first-ever visit (localStorage is empty), the app defaults to DARK mode.
 * Once the user interacts with a theme toggle their choice persists — but that
 * toggle is introduced in Story 1.5 and is out of scope here.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

import { ThemeProvider } from '@/components/theme-provider';

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('dark', 'light');
});

describe('First-visit theme default (BA-3 Option C)', () => {
  it('applies the "dark" class to <html> when localStorage has no saved theme', () => {
    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('respects a persisted "light" theme once the user has set one', () => {
    window.localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });
});
