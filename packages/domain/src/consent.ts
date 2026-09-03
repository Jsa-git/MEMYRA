export const consentTypes = ['TERMS', 'PRIVACY', 'PHOTO_PROCESSING'] as const;

export type ConsentType = (typeof consentTypes)[number];

export interface ConsentRecord {
  readonly id: string;
  readonly userId: string;
  readonly type: ConsentType;
  readonly version: string;
  readonly accepted: boolean;
  readonly acceptedAt: Date | null;
  readonly revokedAt: Date | null;
  readonly createdAt: Date;
}

export function isValidConsentRecord(record: ConsentRecord): boolean {
  if (!record.version.trim()) return false;
  if (record.accepted && !record.acceptedAt) return false;
  if (record.revokedAt && !record.acceptedAt) return false;
  if (record.revokedAt && record.acceptedAt && record.revokedAt < record.acceptedAt) return false;
  return true;
}
