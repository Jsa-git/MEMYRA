import { calculateConsistency, calendarDaysBetween, trackingDate } from '@memyra/domain';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { PhotoComparison } from '../../../../components/photo-comparison';
import { requireCurrentActor } from '../../../../../src/server/current-actor';
import { getDatabase } from '../../../../../src/server/database';

export const metadata = { title: 'Comparação visual' };
export const dynamic = 'force-dynamic';

function shortDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

function localDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(date);
}

export default async function ComparisonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const actor = await requireCurrentActor(await headers());
  const { id } = await params;
  const journey = await getDatabase().journey.findFirst({
    where: { id, userId: actor.userId },
    select: {
      name: true,
      photos: {
        orderBy: { capturedAt: 'asc' },
        select: {
          id: true,
          capturedAt: true,
          qualityStatus: true,
          framing: true,
          lighting: true,
          distance: true,
        },
      },
      routinePlan: {
        select: {
          createdAt: true,
          periods: true,
          checkIns: { where: { completed: true }, select: { localDate: true } },
        },
      },
    },
  });
  if (!journey) notFound();
  if (journey.photos.length < 2)
    return (
      <main className="page-shell text-center">
        <Link
          href={`/journey/${id}`}
          className="inline-flex min-h-11 items-center pt-5 text-base font-semibold text-accent"
        >
          ← Voltar à trilha
        </Link>
        <div className="mx-auto mt-14 max-w-md rounded-[2rem] bg-forest p-8 text-ivory shadow-soft">
          <span
            className="mx-auto grid size-14 place-items-center rounded-full bg-surface/10 text-2xl"
            aria-hidden="true"
          >
            ◇
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.19em] text-ivory/80">
            Próximo marco
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-none">
            Sua comparação será desbloqueada aqui.
          </h1>
          <p className="mt-4 text-base leading-6 text-ivory/80">
            Registre mais um checkpoint da mesma região para observar sua trajetória lado a lado.
          </p>
          <Link
            href={`/journey/${id}#fotografia`}
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-surface px-5 text-base font-bold text-accent"
          >
            Ir para a fotografia
          </Link>
        </div>
      </main>
    );

  const selection = await searchParams;
  const selectedFrom =
    journey.photos.find((photo) => photo.id === selection.from) ?? journey.photos[0]!;
  const selectedTo =
    journey.photos.find((photo) => photo.id === selection.to && photo.id !== selectedFrom.id) ??
    [...journey.photos].reverse().find((photo) => photo.id !== selectedFrom.id)!;
  const [before, after] = [selectedFrom, selectedTo].sort(
    (a, b) => a.capturedAt.getTime() - b.capturedAt.getTime(),
  ) as [typeof selectedFrom, typeof selectedTo];
  const intervalDays = calendarDaysBetween(
    trackingDate(before.capturedAt),
    trackingDate(after.capturedAt),
  );
  const consistencyStart = journey.routinePlan
    ? [localDate(before.capturedAt), localDate(journey.routinePlan.createdAt)].sort().at(-1)!
    : localDate(before.capturedAt);
  const completed =
    journey.routinePlan?.checkIns.filter(
      (item) => item.localDate >= consistencyStart && item.localDate <= localDate(after.capturedAt),
    ).length ?? 0;
  const consistency = journey.routinePlan
    ? calculateConsistency({
        completedCheckIns: completed,
        activeDays: Math.max(
          0,
          calendarDaysBetween(consistencyStart, localDate(after.capturedAt)) + 1,
        ),
        periodsPerDay: journey.routinePlan.periods.length,
      })
    : null;

  return (
    <main className="page-shell">
      <Link
        href={`/journey/${id}`}
        className="inline-flex min-h-11 items-center pt-5 text-base font-semibold text-accent"
      >
        ← Voltar à trilha
      </Link>
      <header className="mx-auto max-w-xl pt-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">
          Evolução · {journey.name}
        </p>
        <h1 className="mt-3 font-serif text-[clamp(2.8rem,13vw,4.2rem)] leading-tight tracking-[-.045em]">
          Antes e agora, no mesmo caminho.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-6 text-ivory/80">
          Compare os registros visuais com calma. Diferenças de luz e enquadramento podem alterar a
          percepção.
        </p>
      </header>
      <section className="mx-auto mt-8 max-w-md" aria-label="Comparação fotográfica privada">
        <form className="panel mb-6 grid gap-4 p-4">
          <p className="font-semibold">Escolha suas duas memórias</p>
          {(['from', 'to'] as const).map((field) => (
            <label key={field} className="grid min-w-0 gap-2 text-sm">
              {field === 'from' ? 'Primeiro registro' : 'Segundo registro'}
              <select
                name={field}
                defaultValue={field === 'from' ? before.id : after.id}
                className="min-h-12 min-w-0 rounded-xl border border-ivory/30 bg-surface px-3 text-base"
              >
                {journey.photos.map((photo, index) => (
                  <option value={photo.id} key={photo.id}>
                    Memória {index + 1} · {shortDate(photo.capturedAt)}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button className="action-link" type="submit">
            Atualizar comparação
          </button>
          <p className="text-sm text-ivory/80">
            Se escolher a mesma foto duas vezes, usaremos outro registro disponível.
          </p>
        </form>
        <PhotoComparison
          key={`${before.id}:${after.id}`}
          before={{
            id: before.id,
            label: `Memória ${journey.photos.findIndex((photo) => photo.id === before.id) + 1}`,
            date: shortDate(before.capturedAt),
          }}
          after={{
            id: after.id,
            label: `Memória ${journey.photos.findIndex((photo) => photo.id === after.id) + 1}`,
            date: shortDate(after.capturedAt),
          }}
        />
      </section>
      <section
        className="mx-auto mt-8 max-w-xl rounded-[2rem] bg-forest p-6 text-ivory shadow-soft"
        aria-labelledby="period-title"
      >
        <p className="text-xs font-bold uppercase tracking-[.18em] text-ivory/80">
          Entre os registros
        </p>
        <h2 id="period-title" className="mt-2 font-serif text-3xl">
          {intervalDays} {intervalDays === 1 ? 'dia' : 'dias'} de trajetória
        </h2>
        <div className="mt-6 grid grid-cols-2 divide-x divide-ivory/15 text-center">
          <div>
            <strong className="block text-2xl">
              {consistency === null ? '—' : `${consistency}%`}
            </strong>
            <span className="text-xs text-ivory/80">consistência registrada</span>
          </div>
          <div>
            <strong className="block text-lg">Não avaliada</strong>
            <span className="text-sm text-ivory/80">qualidade comparativa</span>
          </div>
        </div>
      </section>
      <section className="mx-auto mt-5 max-w-xl rounded-[2rem] border border-ivory/10 bg-surface p-6">
        <p className="text-xs font-bold uppercase tracking-[.17em] text-accent">
          Leitura responsável
        </p>
        <h2 className="mt-3 font-serif text-3xl">A imagem conta parte da história.</h2>
        <p className="mt-3 text-base leading-6 text-ivory/80">
          Esta comparação organiza registros visuais e sua consistência. Ela não mede eficácia
          clínica, não identifica condições e não substitui avaliação profissional.
        </p>
      </section>
    </main>
  );
}
