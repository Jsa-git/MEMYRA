export * from './consent';
export * from './journey';
export * from './journey-repository';
export * from './skin-area';
export * from './photo-record';
export * from './routine';
export * from './ai-advisor';
export * from './journey-progress';

export type DomainIdentifier = string & { readonly __brand: 'DomainIdentifier' };
