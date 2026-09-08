import Link from 'next/link';
import type { ReactNode } from 'react';
import { LogoutButton } from './logout-button';
import { PrimaryNavigation } from './primary-navigation';

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <header
        className="mx-auto flex w-full max-w-xl items-center justify-between px-5 pt-5"
        aria-label="Cabeçalho principal"
      >
        <Link
          href="/journey"
          className="rounded-sm font-serif text-xl tracking-[0.18em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"
        >
          MEMYRA
        </Link>
        <LogoutButton />
      </header>
      {children}
      <PrimaryNavigation />
    </>
  );
}

export function PageIntro({
  eyebrow,
  title,
  children,
}: Readonly<{ eyebrow: string; title: string; children: ReactNode }>) {
  return (
    <div className="mb-9 pt-8">
      <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.19em] text-forest">
        {eyebrow}
      </p>
      <h1 className="title-display max-w-xl">{title}</h1>
      <div className="mt-5 max-w-lg text-[0.95rem] leading-7 text-graphite/68">{children}</div>
    </div>
  );
}
