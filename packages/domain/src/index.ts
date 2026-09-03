export * from './consent';
export * from './journey';
export * from './journey-repository';
export * from './skin-area';

export type DomainIdentifier = string & { readonly __brand: 'DomainIdentifier' };
