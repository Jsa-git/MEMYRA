import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col px-5 py-6 sm:px-8">
      <header className="mx-auto flex w-full max-w-md flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <Link
          href="/login"
          className="rounded-sm font-serif text-xl tracking-[0.18em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Pelmorya
        </Link>
        <span className="text-xs font-semibold uppercase tracking-[.17em] text-ivory/80">
          A pele tem memória
        </span>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 items-center py-10">{children}</div>
    </main>
  );
}
