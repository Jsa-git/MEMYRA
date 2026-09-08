export type AIAnalysisStatus = 'PENDING' | 'READY' | 'FAILED' | 'REQUIRES_REVIEW';

export interface CheckpointAnalysis {
  readonly status: AIAnalysisStatus;
  readonly captureAssessment: string;
  readonly apparentObservations: readonly string[];
  readonly cosmeticCareTips: readonly string[];
  readonly safetyNotice: string;
}

/** Infrastructure providers must return structured, non-diagnostic output only. */
export interface AIProvider {
  analyzeCheckpoint(input: { photoId: string; previousPhotoId?: string }): Promise<CheckpointAnalysis>;
}
