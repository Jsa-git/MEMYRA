import { calculateConsistency } from '@memyra/domain';
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
  }).format(date);
}

function localDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(date);
}

export default async function ComparisonPage({ params }: { params: Promise<{ id: string }> }) {
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
          className="inline-flex min-h-11 items-center pt-5 text-sm font-semibold text-forest"
        >
          ← Voltar à trilha
        </Link>
        <div className="mx-auto mt-14 max-w-md rounded-[2rem] bg-forest p-8 text-ivory shadow-soft">
          <span
            className="mx-auto grid size-14 place-items-center rounded-full bg-ivory/10 text-2xl"
            aria-hidden="true"
          >
            ◇
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.19em] text-ivory/60">
            Próximo marco
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-none">
            Sua comparação será desbloqueada aqui.
          </h1>
          <p className="mt-4 text-sm leading-6 text-ivory/65">
            Registre mais um checkpoint da mesma região para observar sua trajetória lado a lado.
          </p>
          <Link
            href={`/journey/${id}#fotografia`}
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-ivory px-5 text-sm font-bold text-forest"
          >
            Ir para a fotografia
          </Link>
        </div>
      </main>
    );

  const before = journey.photos[0]!;
  const after = journey.photos.at(-1)!;
  const intervalDays = Math.max(
    1,
    Math.round((after.capturedAt.getTime() - before.capturedAt.getTime()) / 86_400_000),
  );
  const completed =
    journey.routinePlan?.checkIns.filter(
      (item) =>
        item.localDate >= localDate(before.capturedAt) &&
        item.localDate <= localDate(after.capturedAt),
    ).length ?? 0;
  const consistency = journey.routinePlan
    ? calculateConsistency({
        completedCheckIns: completed,
        activeDays: intervalDays + 1,
        periodsPerDay: journey.routinePlan.periods.length,
      })
    : null;
  const technicallyComparable =
    before.qualityStatus === 'ACCEPTED' &&
    after.qualityStatus === 'ACCEPTED' &&
    before.framing === after.framing &&
    before.lighting === after.lighting &&
    before.distance === after.distance;

  return (
    <main className="page-shell">
      <Link
        href={`/journey/${id}`}
        className="inline-flex min-h-11 items-center pt-5 text-sm font-semibold text-forest"
      >
        ← Voltar à trilha
      </Link>
      <header className="mx-auto max-w-xl pt-7 text-center">
        <p className="text-[.68rem] font-bold uppercase tracking-[.2em] text-forest">
          Evolução · {journey.name}
        </p>
        <h1 className="mt-3 font-serif text-[clamp(2.8rem,13vw,4.2rem)] leading-[.88] tracking-[-.045em]">
          Antes e agora, no mesmo caminho.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-graphite/60">
          Compare os registros visuais com calma. Diferenças de luz e enquadramento podem alterar a
          percepção.
        </p>
      </header>
      <section className="mx-auto mt-8 max-w-md" aria-label="Comparação fotográfica privada">
        <PhotoComparison
          before={{ id: before.id, label: 'Checkpoint 1', date: shortDate(before.capturedAt) }}
          after={{
            id: after.id,
            label: `Checkpoint ${journey.photos.length}`,
            date: shortDate(after.capturedAt),
          }}
        />
      </section>
      <section
        className="mx-auto mt-8 max-w-xl rounded-[2rem] bg-forest p-6 text-ivory shadow-soft"
        aria-labelledby="period-title"
      >
        <p className="text-[.68rem] font-bold uppercase tracking-[.18em] text-ivory/60">
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
            <span className="text-xs text-ivory/55">consistência registrada</span>
          </div>
          <div>
            <strong className="block text-2xl">{technicallyComparable ? 'Boa' : 'Revisar'}</strong>
            <span className="text-xs text-ivory/55">comparabilidade técnica</span>
          </div>
        </div>
      </section>
      <section className="mx-auto mt-5 max-w-xl rounded-[2rem] border border-graphite/10 bg-surface p-6">
        <p className="text-xs font-bold uppercase tracking-[.17em] text-forest">
          Leitura responsável
        </p>
        <h2 className="mt-3 font-serif text-3xl">A imagem conta parte da história.</h2>
        <p className="mt-3 text-sm leading-6 text-graphite/62">
          Esta comparação organiza registros visuais e sua consistência. Ela não mede eficácia
          clínica, não identifica condições e não substitui avaliação profissional.
        </p>
      </section>
    </main>
  );
}
