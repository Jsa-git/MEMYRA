import { getJourney } from '@memyra/application';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { JourneyEditForm } from '../../../../components/journey-edit-form';
import { requireCurrentActor } from '../../../../../src/server/current-actor';
import { getJourneyServices } from '../../../../../src/server/journey-services';

export const metadata = { title: 'Editar jornada' };
export const dynamic = 'force-dynamic';

export default async function EditJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const journey = await getJourney(await requireCurrentActor(await headers()), id, getJourneyServices().repository);
  if (!journey) notFound();
  return <main className="page-shell py-8"><Link href={`/journey/${id}`} className="text-sm font-semibold text-forest">← Voltar</Link><h1 className="title-display mt-8">Editar jornada.</h1><p className="mt-3 text-sm text-graphite/60">Atualize apenas o que mudou na sua percepção.</p><JourneyEditForm journey={journey} /></main>;
}
