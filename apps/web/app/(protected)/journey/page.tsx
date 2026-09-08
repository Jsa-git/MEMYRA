import Link from 'next/link';
import { listJourneys } from '@memyra/application';
import { headers } from 'next/headers';

import { PageIntro } from '../../components/app-shell';
import { JourneyHub } from '../../components/journey-hub';
import { EmptyJourneys } from '../../components/ui-states';
import { requireCurrentActor } from '../../../src/server/current-actor';
import { getJourneyServices } from '../../../src/server/journey-services';
import { getDatabase } from '../../../src/server/database';

export const metadata = { title: 'Jornada' };
export const dynamic = 'force-dynamic';

export default async function JourneyPage() {
  const actor = await requireCurrentActor(await headers());
  const journeys = await listJourneys(actor, getJourneyServices().repository);
  const now = new Date();
  const recentDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(
    new Date(now.getTime() - 6 * 86_400_000),
  );
  const journeyData = journeys.length
    ? await getDatabase().journey.findMany({
        where: { id: { in: journeys.map((journey) => journey.id) }, userId: actor.userId },
        select: {
          id: true,
          photos: { orderBy: { capturedAt: 'desc' }, select: { capturedAt: true }, take: 1 },
          _count: { select: { photos: true } },
          routinePlan: {
            select: {
              durationDays: true,
              photoIntervalDays: true,
              periods: true,
              checkIns: {
                where: { completed: true, localDate: { gte: recentDate } },
                select: { id: true },
              },
            },
          },
        },
      })
    : [];
  const summaries = Object.fromEntries(
    journeyData.map((item) => {
      const lastPhoto = item.photos[0]?.capturedAt;
      return [
        item.id,
        {
          durationDays: item.routinePlan?.durationDays ?? null,
          periodsPerDay: item.routinePlan?.periods.length ?? 0,
          recentCompleted: item.routinePlan?.checkIns.length ?? 0,
          photoCount: item._count.photos,
          nextPhotoAt:
            lastPhoto && item.routinePlan
              ? new Date(lastPhoto.getTime() + item.routinePlan.photoIntervalDays * 86_400_000)
              : null,
        },
      ];
    }),
  );

  return (
    <main className="page-shell">
      <PageIntro eyebrow="Método REEDUCA" title="Olá. Qual é o cuidado de hoje?">
        <p>Um passo simples mantém viva a memória da sua jornada.</p>
      </PageIntro>
      {journeys.length === 0 ? (
        <EmptyJourneys />
      ) : (
        <JourneyHub journeys={journeys} summaries={summaries} now={now} />
      )}
      {journeys.length === 1 && (
        <Link
          href="/journey/new"
          className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full border border-graphite/15 bg-surface px-6 text-sm font-semibold text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          Criar outra jornada
        </Link>
      )}
    </main>
  );
}
