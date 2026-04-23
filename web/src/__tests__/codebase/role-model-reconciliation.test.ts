/**
 * Epic 1, Story 1.1 — AC-16: Role model reconciliation
 *
 * The starter template ships a four-role enum (ADMIN, POWER_USER, STANDARD_USER, READ_ONLY).
 * BetterBond only supports two roles: admin and viewer.
 *
 * This test scans the codebase (excluding .test files and comments-only artefacts) for the
 * retired role literals and fails if any remain.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(__dirname, '..', '..');
const FORBIDDEN_LITERALS = [
  'POWER_USER',
  'STANDARD_USER',
  'READ_ONLY',
  'power_user',
  'standard_user',
  'read_only',
];

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      walk(full, acc);
    } else if (entry.isFile()) {
      if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        acc.push(full);
      }
    }
  }
  return acc;
}

describe('AC-16: Only admin and viewer roles remain in the codebase', () => {
  it('has no references to the template 4-role literals in non-test source files', () => {
    const files = walk(SRC_DIR);
    const offenders: Array<{ file: string; literal: string; line: number }> =
      [];

    for (const file of files) {
      const rel = path.relative(SRC_DIR, file);
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        // Skip comment-only lines that just document history
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
        for (const literal of FORBIDDEN_LITERALS) {
          if (line.includes(literal)) {
            offenders.push({ file: rel, literal, line: idx + 1 });
          }
        }
      });
    }

    if (offenders.length > 0) {
      const details = offenders
        .map(
          (o) =>
            `  ${o.file}:${o.line} — forbidden role literal "${o.literal}"`,
        )
        .join('\n');
      throw new Error(
        `Found ${offenders.length} reference(s) to retired template roles:\n${details}\n\nThe codebase must only use "admin" and "viewer" (see FRS R1 and Story 1.1 AC-16).`,
      );
    }

    expect(offenders.length).toBe(0);
  });

  it('UserRole enum (if it still exists) contains exactly admin and viewer', async () => {
    const roles = await import('@/types/roles');
    const values = Object.values(roles.UserRole).sort();
    expect(values).toEqual(['admin', 'viewer']);
  });
});
