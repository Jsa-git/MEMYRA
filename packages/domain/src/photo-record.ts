export const PHOTO_ORIENTATIONS = ['PORTRAIT', 'LANDSCAPE', 'SQUARE'] as const;
export type PhotoOrientation = (typeof PHOTO_ORIENTATIONS)[number];
export const PHOTO_QUALITY_STATUSES = ['ACCEPTED', 'REJECTED'] as const;
export type PhotoQualityStatus = (typeof PHOTO_QUALITY_STATUSES)[number];
export const PHOTO_PROCESSING_STATUSES = ['STORED', 'FAILED', 'DELETED'] as const;
export type PhotoProcessingStatus = (typeof PHOTO_PROCESSING_STATUSES)[number];

export interface PhotoRecord {
  readonly id: string;
  readonly journeyId: string;
  readonly skinAreaId: string;
  readonly capturedAt: Date;
  readonly storageKey: string;
  readonly width: number;
  readonly height: number;
  readonly orientation: PhotoOrientation;
  readonly framing: 'CENTERED';
  readonly distance: 'CLOSE' | 'MEDIUM';
  readonly lighting: 'EVEN';
  readonly qualityStatus: PhotoQualityStatus;
  readonly processingStatus: PhotoProcessingStatus;
  readonly createdAt: Date;
}
