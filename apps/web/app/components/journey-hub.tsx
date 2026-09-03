import Link from 'next/link';
import type { Journey } from '@memyra/domain';

import { Eyebrow, Surface } from '@memyra/ui';

const regionLabels: Record<Journey['skinArea']['region'], string> = {
  FACE: 'Rosto',
  NECK: 'Pescoço',
  CHEST: 'Colo ou peito',
  BACK: 'Costas',
  ARM: 'Braço',
  HAND: 'Mão',
  LEG: 'Perna',
  OTHER: 'Outra região',
};

const sideLabels: Record<Journey['skinArea']['side'], string> = {
  LEFT: 'lado esquerdo',
  RIGHT: 'lado direito',
  NOT_APPLICABLE: 'sem lado específico',
};

const statusLabels: Record<Journey['status'], string> = {
  ACTIVE: 'Em andamento',
  COMPLETED: 'Concluída',
  ARCHIVED: 'Arquivada',
};

function journeyDay(startedAt: Date, now: Date) {
  return Math.max(1, Math.floor((now.getTime() - startedAt.getTime()) / 86_400_000) + 1);
}

function areaLabel(journey: Journey) {
  return `${regionLabels[journey.skinArea.region]} · ${sideLabels[journey.skinArea.side]}`;
}

function JourneyRow({ journey, now }: { journey: Journey; now: Date }) {
  return (
    <li className="border-t border-graphite/10 first:border-t-0">
      <Link
        href={`/journey/${journey.id}`}
        className="group flex min-h-24 items-center justify-between gap-5 py-5 focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"
      >
        <span>
          <span className="block font-serif text-2xl leading-tight group-hover:text-forest">
            {journey.name}
          </span>
          <span className="mt-1.5 block text-sm text-graphite/58">{areaLabel(journey)}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-xs font-bold uppercase tracking-wider text-forest">
            Dia {journeyDay(journey.startedAt, now)}
          </span>
          <span className="mt-1 block text-xs text-graphite/50">
            {statusLabels[journey.status]}
          </span>
        </span>
      </Link>
    </li>
  );
}

export function JourneyHub({
  journeys,
  now = new Date(),
}: {
  journeys: readonly Journey[];
  now?: Date;
}) {
  const ordered = [...journeys].sort(
    (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime(),
  );
  const featured = ordered.find((journey) => journey.status === 'ACTIVE') ?? ordered[0];
  const remaining = featured ? ordered.filter((journey) => journey.id !== featured.id) : [];

  if (!featured) return null;

  return (
    <>
      <Surface className="overflow-hidden p-6 shadow-soft sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.17em] text-forest">
              {statusLabels[featured.status]}
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-none">{featured.name}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-sand px-3 py-1.5 text-xs font-bold text-forest">
            Dia {journeyDay(featured.startedAt, now)}
          </span>
        </div>
        <p className="mt-5 text-sm text-graphite/62">{areaLabel(featured)}</p>
        <p className="mt-2 text-sm leading-6 text-graphite/55">
          Iniciada em{' '}
          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(
            featured.startedAt,
          )}
        </p>
        <Link
          href={`/journey/${featured.id}`}
          className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-forest px-6 text-sm font-semibold text-ivory shadow-soft transition-colors hover:bg-forest-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:w-auto"
        >
          Continuar jornada
        </Link>
      </Surface>

      {remaining.length > 0 && (
        <section className="mt-12" aria-labelledby="other-journeys-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Eyebrow>Sua trajetória</Eyebrow>
              <h2 id="other-journeys-title" className="mt-2 font-serif text-3xl">
                Outras jornadas
              </h2>
            </div>
            <Link
              href="/journey/new"
              className="min-h-11 rounded-full px-3 py-3 text-sm font-semibold text-forest focus-visible:outline-2 focus-visible:outline-forest"
            >
              Nova jornada
            </Link>
          </div>
          <ul className="mt-5 border-y border-graphite/10">
            {remaining.map((journey) => (
              <JourneyRow key={journey.id} journey={journey} now={now} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
