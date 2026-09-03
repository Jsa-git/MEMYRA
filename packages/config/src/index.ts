export const environments = ['local', 'preview', 'production'] as const;
export type Environment = (typeof environments)[number];
