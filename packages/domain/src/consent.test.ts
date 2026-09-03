import { describe, expect, it } from 'vitest';

import { isValidConsentRecord, type ConsentRecord } from './consent';

const acceptedAt = new Date('2026-09-03T10:00:00.000Z');

function record(overrides: Partial<ConsentRecord> = {}): ConsentRecord {
  return {
    id: 'consent-id',
    userId: 'user-id',
    type: 'PRIVACY',
    version: '2026-09-03',
    accepted: true,
    acceptedAt,
    revokedAt: null,
    createdAt: acceptedAt,
    ...overrides,
  };
}

describe('consent record invariants', () => {
  it('accepts an explicit, versioned grant', () => {
    expect(isValidConsentRecord(record())).toBe(true);
  });

  it('rejects acceptance without evidence timestamp', () => {
    expect(isValidConsentRecord(record({ acceptedAt: null }))).toBe(false);
  });

  it('rejects revocation before acceptance', () => {
    expect(isValidConsentRecord(record({ revokedAt: new Date('2026-09-03T09:59:59.000Z') }))).toBe(
      false,
    );
  });

  it('rejects an empty document version', () => {
    expect(isValidConsentRecord(record({ version: '  ' }))).toBe(false);
  });
});
