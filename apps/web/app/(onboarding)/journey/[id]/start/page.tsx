import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

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
  const consent = await getDatabase().consentRecord.findFirst({
    where: { userId: actor.userId, type: 'PHOTO_PROCESSING', accepted: true, revokedAt: null },
    select: { id: true },
  });

  return (
    <main className="page-shell">
      <div className="flex items-center justify-between pt-2">
        <span className="font-serif text-lg tracking-[.2em]">Pelmorya</span>
        <Link
          href={`/journey/${id}`}
          className="inline-flex min-h-11 items-center text-base font-semibold text-accent"
        >
          Fazer depois
        </Link>
      </div>
      <header className="mx-auto max-w-xl pt-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">{journey.name}</p>
        <h1 className="mt-3 font-serif text-[clamp(2.8rem,13vw,4.2rem)] leading-tight tracking-[-.045em]">
          {journey.photos.length
            ? 'Um novo registro do seu caminho.'
            : 'Guarde o seu ponto de partida.'}
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-base leading-6 text-ivory/80">
          Fotografe a mesma região e revise antes de enviar. Você controla seus registros.
        </p>
      </header>
      <PhotoJournal
        journeyId={journey.id}
        photos={[]}
        hasConsent={Boolean(consent)}
        canCapture={journey.status === 'ACTIVE'}
        firstCapture={journey.photos.length === 0}
      />
    </main>
  );
}
