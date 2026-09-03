import Link from 'next/link';
import { listJourneys } from '@memyra/application';
import { headers } from 'next/headers';

import { PageIntro } from '../../components/app-shell';
import { JourneyHub } from '../../components/journey-hub';
import { EmptyJourneys } from '../../components/ui-states';
import { requireCurrentActor } from '../../../src/server/current-actor';
import { getJourneyServices } from '../../../src/server/journey-services';

export const metadata = { title: 'Jornada' };
export const dynamic = 'force-dynamic';

export default async function JourneyPage() {
  const actor = await requireCurrentActor(await headers());
  const journeys = await listJourneys(actor, getJourneyServices().repository);

  return (
    <main className="page-shell">
      <PageIntro eyebrow="Método REEDUCA" title="Suas jornadas, no seu tempo.">
        <p>Acompanhe cada região com contexto e consistência, sem pressa e sem promessas.</p>
      </PageIntro>
      {journeys.length === 0 ? <EmptyJourneys /> : <JourneyHub journeys={journeys} />}
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
