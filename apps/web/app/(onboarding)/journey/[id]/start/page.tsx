import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { PhotoJournal } from '../../../../components/photo-journal';
import { requireCurrentActor } from '../../../../../src/server/current-actor';
import { getDatabase } from '../../../../../src/server/database';

export const metadata = { title: 'Primeira memória' };
export const dynamic = 'force-dynamic';

export default async function JourneyStartPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireCurrentActor(await headers());
  const { id } = await params;
  const journey = await getDatabase().journey.findFirst({
    where: { id, userId: actor.userId },
    select: {
      id: true,
      name: true,
      status: true,
      photos: {
        orderBy: { capturedAt: 'desc' },
        select: { id: true, capturedAt: true, width: true, height: true, orientation: true },
      },
    },
  });
  if (!journey) notFound();
  if (journey.photos[0]) redirect(`/journey/${id}/checkpoint/${journey.photos[0].id}`);
  const consent = await getDatabase().consentRecord.findFirst({
    where: { userId: actor.userId, type: 'PHOTO_PROCESSING', accepted: true, revokedAt: null },
    select: { id: true },
  });

  return (
    <main className="page-shell">
      <div className="flex items-center justify-between pt-2">
        <span className="font-serif text-lg tracking-[.2em]">MEMYRA</span>
        <Link
          href={`/journey/${id}`}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-forest"
        >
          Fazer depois
        </Link>
      </div>
      <header className="mx-auto max-w-xl pt-5 text-center">
        <div
          className="mx-auto mb-7 grid max-w-xs grid-cols-3 items-center gap-2"
          aria-label="Passo 3 de 3"
        >
          <span className="h-1 rounded-full bg-forest" />
          <span className="h-1 rounded-full bg-forest" />
          <span className="h-1 rounded-full bg-forest" />
        </div>
        <p className="text-[.68rem] font-bold uppercase tracking-[.2em] text-forest">
          {journey.name} está pronta
        </p>
        <h1 className="mt-3 font-serif text-[clamp(2.8rem,13vw,4.2rem)] leading-[.88] tracking-[-.045em]">
          Agora crie sua primeira memória.
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-graphite/60">
          Esta fotografia será a referência inicial da sua trilha. Você poderá excluí-la quando
          quiser.
        </p>
      </header>
      <PhotoJournal
        journeyId={journey.id}
        photos={journey.photos}
        hasConsent={Boolean(consent)}
        canCapture={journey.status === 'ACTIVE'}
        firstCapture
      />
    </main>
  );
}
