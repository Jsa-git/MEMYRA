export * from './journey';
export * from './consent';
export * from './photo-record';
export * from './routine';

export type ValidationResult<T> = { success: true; data: T } | { success: false; issues: string[] };
