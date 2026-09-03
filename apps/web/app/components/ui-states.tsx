import Link from 'next/link';

import { Surface } from '@memyra/ui';

export function JourneyLoadingState({ label = 'Carregando suas jornadas' }: { label?: string }) {
  return (
    <main className="page-shell" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div
        className="pt-10 motion-safe:animate-pulse motion-reduce:animate-none"
        aria-hidden="true"
      >
        <div className="h-3 w-28 rounded-full bg-mineral" />
        <div className="mt-5 h-12 w-4/5 rounded-2xl bg-sand" />
        <div className="mt-4 h-5 w-2/3 rounded-full bg-sand" />
        <div className="mt-12 h-64 rounded-[1.5rem] bg-sand/70" />
      </div>
    </main>
  );
}

export function EmptyJourneys() {
  return (
    <Surface className="border-dashed px-6 py-10 text-center sm:px-10">
      <span
        className="mx-auto flex size-12 items-center justify-center rounded-full bg-sand text-xl text-forest"
        aria-hidden="true"
      >
        ＋
      </span>
      <h2 className="mt-5 font-serif text-3xl">Sua jornada começa com um primeiro registro.</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-graphite/62">
        A pele tem memória. Escolha uma região para acompanhar sua trajetória com consistência.
      </p>
      <Link
        href="/journey/new"
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-6 text-sm font-semibold text-ivory shadow-soft transition-colors hover:bg-forest-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        Iniciar minha jornada
      </Link>
    </Surface>
  );
}

export function RouteErrorState({
  title = 'Não foi possível carregar esta página.',
  description = 'Tente novamente. Se o problema continuar, volte às suas jornadas.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <main className="page-shell">
      <Surface className="mt-10 p-7" role="alert">
        <p className="text-xs font-bold uppercase tracking-[.19em] text-clay">
          Algo interrompeu o caminho
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight">{title}</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-graphite/65">{description}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-6 text-sm font-semibold text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              Tentar novamente
            </button>
          )}
          <Link
            href="/journey"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-graphite/15 bg-surface px-6 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            Voltar às jornadas
          </Link>
        </div>
      </Surface>
    </main>
  );
}
