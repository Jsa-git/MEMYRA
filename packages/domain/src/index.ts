export * from './consent';
export * from './journey';
export * from './journey-repository';
export * from './skin-area';
export * from './photo-record';

export type DomainIdentifier = string & { readonly __brand: 'DomainIdentifier' };
