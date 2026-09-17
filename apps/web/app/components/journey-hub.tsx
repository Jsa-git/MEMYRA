import Link from 'next/link';
import type { Journey } from '@memyra/domain';
import { calculateConsistency, journeyNextStep, trackingDay } from '@memyra/domain';

export type JourneyTodaySummary = {
  durationDays: number | null;
  periodsPerDay: number;
  recentCompleted: number;
  photoCount: number;
  nextPhotoAt: Date | null;
  todayComplete: boolean;
  planCreatedAt: Date | null;
};

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

function journeyDay(startedAt: Date, now: Date) {
  return trackingDay(startedAt, now);
}

function nextAction(summary: JourneyTodaySummary, now: Date, active: boolean) {
  const next = journeyNextStep({
    active,
    hasPlan: Boolean(summary.durationDays),
    todayComplete: summary.todayComplete,
    photoCount: summary.photoCount,
    photoDue: Boolean(summary.nextPhotoAt && summary.nextPhotoAt <= now),
  });
  if (next === 'inactive')
    return { label: 'Rever minha jornada', hint: 'Seus registros continuam guardados', anchor: '' };
  if (next === 'complete')
    return {
      label: 'Ver minhas memórias',
      hint: 'Seu cuidado de hoje já foi registrado',
      anchor: '#historico',
    };
  if (next === 'plan')
    return {
      label: 'Criar meu ciclo',
      hint: 'Defina uma rotina simples para começar',
      anchor: '#rotina',
    };
  if (next === 'photo' && summary.photoCount === 0)
    return {
      label: 'Registrar primeira foto',
      hint: 'Crie o primeiro marco da sua trajetória',
      anchor: '/start',
    };
  if (next === 'photo')
    return {
      label: 'Criar novo checkpoint',
      hint: 'Sua próxima comparação já pode começar',
      anchor: '/start',
    };
  return {
    label: 'Fazer check-in de hoje',
    hint: 'Um toque para manter sua consistência',
    anchor: '#rotina',
  };
}

export function JourneyHub({
  journeys,
  summaries,
  now = new Date(),
}: {
  journeys: readonly Journey[];
  summaries: Readonly<Record<string, JourneyTodaySummary>>;
  now?: Date;
}) {
  const ordered = [...journeys].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const featured = ordered.find((journey) => journey.status === 'ACTIVE') ?? ordered[0];
  if (!featured) return null;
  const day = journeyDay(featured.startedAt, now);
  const summary = summaries[featured.id] ?? {
    durationDays: null,
    periodsPerDay: 0,
    recentCompleted: 0,
    photoCount: 0,
    nextPhotoAt: null,
    todayComplete: false,
    planCreatedAt: null,
  };
  const consistency = calculateConsistency({
    completedCheckIns: summary.recentCompleted,
    activeDays: summary.planCreatedAt ? Math.min(trackingDay(summary.planCreatedAt, now), 7) : 0,
    periodsPerDay: summary.periodsPerDay,
  });
  const action = nextAction(summary, now, featured.status === 'ACTIVE');
  const remaining = ordered.filter((journey) => journey.id !== featured.id);

  return (
    <>
      <section
        className="relative overflow-hidden rounded-[2.25rem] bg-forest px-6 pb-6 pt-7 text-ivory shadow-[0_24px_70px_rgb(35_72_59/22%)] sm:px-8"
        aria-labelledby="today-title"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-moss/30 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.21em] text-ivory/80">
              Hoje na Pelmorya
            </p>
            <h2
              id="today-title"
              className="mt-3 max-w-xs font-serif text-[2.65rem] leading-tight tracking-[-.04em]"
            >
              Seu cuidado continua aqui.
            </h2>
          </div>
          <div className="grid size-[4.5rem] shrink-0 place-items-center rounded-full border border-ivory/20 bg-surface/10 text-center">
            <span>
              <small className="block text-xs uppercase tracking-widest text-ivory/80">Dia</small>
              <strong className="block text-2xl leading-none tabular-nums">{day}</strong>
            </span>
          </div>
        </div>
        <div className="relative mt-7 rounded-[1.5rem] bg-surface px-5 py-5 text-ivory shadow-soft">
          <div className="flex items-center gap-3">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-full bg-sand text-lg text-accent"
              aria-hidden="true"
            >
              ✦
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.17em] text-accent">
                Próximo passo
              </p>
              <p className="mt-0.5 text-base text-ivory/80">{action.hint}</p>
            </div>
          </div>
          <Link
            href={`/journey/${featured.id}${action.anchor}`}
            className="action-link mt-5 w-full"
          >
            {action.label}{' '}
            <span className="ml-2" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
        <div className="relative mt-5 grid grid-cols-3 divide-x divide-ivory/15 text-center">
          <Metric
            value={
              summary.durationDays
                ? `${Math.min(trackingDay(summary.planCreatedAt ?? featured.startedAt, now), summary.durationDays)}/${summary.durationDays}`
                : '—'
            }
            label="dias do ciclo"
          />
          <Metric value={`${consistency}%`} label="consistência" />
          <Metric value={String(summary.photoCount)} label="memórias" />
        </div>
      </section>
      <section className="mt-8" aria-labelledby="active-journey-title">
        <div className="flex items-end justify-between gap-4 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">
              {featured.status === 'ACTIVE' ? 'Jornada ativa' : 'Jornada guardada'}
            </p>
            <h2 id="active-journey-title" className="mt-1 font-serif text-3xl">
              <Link href={`/journey/${featured.id}`} className="rounded-md">
                {featured.name}
              </Link>
            </h2>
          </div>
          <Link
            href={`/journey/${featured.id}`}
            className="min-h-11 rounded-full px-3 py-3 text-base font-semibold text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            Ver trilha
          </Link>
        </div>
        <p className="mt-2 px-1 text-base text-ivory/80">
          {regionLabels[featured.skinArea.region]} ·{' '}
          {summary.nextPhotoAt
            ? `próxima foto ${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(summary.nextPhotoAt)}`
            : 'prepare seu primeiro checkpoint'}
        </p>
      </section>
      {remaining.length > 0 && (
        <details className="mt-8 border-t border-ivory/10 pt-5">
          <summary className="cursor-pointer text-base font-semibold text-accent">
            Outras jornadas ({remaining.length})
          </summary>
          <ul className="mt-3 divide-y divide-ivory/10">
            {remaining.map((journey) => (
              <li key={journey.id}>
                <Link
                  href={`/journey/${journey.id}`}
                  className="flex min-h-16 items-center justify-between py-3"
                >
                  <span className="font-serif text-xl">{journey.name}</span>
                  <span className="text-xs text-ivory/80">
                    Dia {journeyDay(journey.startedAt, now)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2">
      <strong className="block text-lg tabular-nums">{value}</strong>
      <span className="mt-0.5 block text-xs text-ivory/80">{label}</span>
    </div>
  );
}
