import { Surface } from '@memyra/ui';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { CheckpointPhoto } from '../../../../../components/checkpoint-photo';
import { requireCurrentActor } from '../../../../../../src/server/current-actor';
import { getDatabase } from '../../../../../../src/server/database';

export const metadata = { title: 'Checkpoint da jornada' };
export const dynamic = 'force-dynamic';

export default async function CheckpointPage({ params }: { params: Promise<{ id: string; photoId: string }> }) {
  const actor = await requireCurrentActor(await headers());
  const { id, photoId } = await params;
  const photos = await getDatabase().photoRecord.findMany({
    where: { journeyId: id, journey: { userId: actor.userId } }, orderBy: { capturedAt: 'asc' },
    select: { id: true, capturedAt: true, width: true, height: true, orientation: true, distance: true, lighting: true, qualityStatus: true, journey: { select: { name: true, routinePlan: { select: { photoIntervalDays: true } }, skinArea: { select: { bodyRegion: true, side: true } } } } },
  });
  const index = photos.findIndex((photo) => photo.id === photoId);
  if (index < 0) notFound();
  const photo = photos[index]!;
  const nextPhotoAt = photo.journey.routinePlan
    ? new Date(photo.capturedAt.getTime() + photo.journey.routinePlan.photoIntervalDays * 86_400_000)
    : null;
  return <main className="page-shell mx-auto max-w-2xl py-8">
    <Link href={`/journey/${id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-forest">← Voltar à jornada</Link>
    <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-forest">Checkpoint {index + 1}</p>
    <h1 className="title-display mt-3">Um ponto na sua trajetória.</h1>
    <p className="mt-3 text-sm text-graphite/60">{new Intl.DateTimeFormat('pt-BR',{dateStyle:'long',timeStyle:'short'}).format(photo.capturedAt)}</p>
    <div className="mx-auto mt-8 max-w-md"><CheckpointPhoto photoId={photo.id} /></div>
    <Surface className="mt-8 p-6 text-left">
      <p className="text-xs font-bold uppercase tracking-wider text-forest">Leitura do registro</p>
      <h2 className="mt-3 font-serif text-2xl">Fotografia pronta para acompanhamento.</h2>
      <p className="mt-3 text-sm leading-6 text-graphite/65">Este checkpoint registra a aparência visual nesta data. A análise por IA ainda não está ativa; nenhuma condição ou resultado foi inferido a partir da imagem.</p>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-graphite/50">Dimensões</dt><dd className="font-semibold">{photo.width} × {photo.height}</dd></div><div><dt className="text-graphite/50">Orientação</dt><dd className="font-semibold">{photo.orientation.toLowerCase()}</dd></div><div><dt className="text-graphite/50">Distância</dt><dd className="font-semibold">{photo.distance === 'CLOSE' ? 'Próxima' : 'Média'}</dd></div><div><dt className="text-graphite/50">Qualidade técnica</dt><dd className="font-semibold">{photo.qualityStatus === 'ACCEPTED' ? 'Aceita' : 'Revisar'}</dd></div></dl>
    </Surface>
    <Surface className="mt-5 p-6 text-left"><p className="text-xs font-bold uppercase tracking-wider text-forest">Cuidados de apoio</p><ul className="mt-4 grid gap-3 text-sm leading-6 text-graphite/65"><li>• Siga somente o modo de uso presente no rótulo dos produtos.</li><li>• Mantenha uma rotina suave e evite manipular a região.</li><li>• Use proteção solar conforme orientação do rótulo do produto escolhido.</li></ul><p className="mt-4 text-xs leading-5 text-graphite/50">Estas são orientações cosméticas gerais, não diagnóstico ou prescrição.</p></Surface>
    <Surface className="mt-5 p-6 text-left"><p className="text-xs font-bold uppercase tracking-wider text-forest">Próxima comparação</p><p className="mt-3 text-sm leading-6 text-graphite/65">{nextPhotoAt ? <>Programada pelo seu ciclo para <strong>{new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'}).format(nextPhotoAt)}</strong>.</> : 'Configure seu ciclo de acompanhamento para escolher o intervalo entre fotografias.'}</p>{index > 0 && <Link href={`/journey/${id}/checkpoint/${photos[index - 1]!.id}`} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-forest">Ver checkpoint anterior</Link>}</Surface>
  </main>;
}
