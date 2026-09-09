import { Surface } from '@memyra/ui';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { CheckpointPhoto } from '../../../../../components/checkpoint-photo';
import { requireCurrentActor } from '../../../../../../src/server/current-actor';
import { getDatabase } from '../../../../../../src/server/database';

export const metadata = { title: 'Checkpoint da jornada' };
export const dynamic = 'force-dynamic';

export default async function CheckpointPage({
  params,
}: {
  params: Promise<{ id: string; photoId: string }>;
}) {
  const actor = await requireCurrentActor(await headers());
  const { id, photoId } = await params;
  const photos = await getDatabase().photoRecord.findMany({
    where: { journeyId: id, journey: { userId: actor.userId } },
    orderBy: { capturedAt: 'asc' },
    select: {
      id: true,
      capturedAt: true,
      width: true,
      height: true,
      orientation: true,
      distance: true,
      lighting: true,
      qualityStatus: true,
      journey: {
        select: {
          name: true,
          routinePlan: { select: { photoIntervalDays: true } },
          skinArea: { select: { bodyRegion: true, side: true } },
        },
      },
    },
  });
  const index = photos.findIndex((photo) => photo.id === photoId);
  if (index < 0) notFound();
  const photo = photos[index]!;
  const nextPhotoAt = photo.journey.routinePlan
    ? new Date(
        photo.capturedAt.getTime() + photo.journey.routinePlan.photoIntervalDays * 86_400_000,
      )
    : null;
  return (
    <main className="page-shell mx-auto max-w-2xl py-8">
      <Link
        href={`/journey/${id}`}
        className="inline-flex min-h-11 items-center text-sm font-semibold text-forest"
      >
        ← Voltar à trilha
      </Link>
      <header className="pt-7 text-center">
        <p className="text-[.68rem] font-bold uppercase tracking-[.2em] text-forest">
          Memória {String(index + 1).padStart(2, '0')} · {photo.journey.name}
        </p>
        <h1 className="mt-3 font-serif text-[clamp(2.8rem,13vw,4.2rem)] leading-[.88] tracking-[-.045em]">
          Um instante da sua trajetória.
        </h1>
        <p className="mt-4 text-sm text-graphite/55">
          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(
            photo.capturedAt,
          )}
        </p>
      </header>

      <section
        className="relative mx-auto mt-8 max-w-md rounded-[2.4rem] bg-forest p-3 pb-5 shadow-[0_24px_70px_rgb(35_72_59/22%)]"
        aria-label="Fotografia do checkpoint"
      >
        <CheckpointPhoto photoId={photo.id} />
        <div className="flex items-center justify-between px-3 pt-4 text-xs text-ivory">
          <span>
            Checkpoint {index + 1} de {photos.length}
          </span>
          <span className="rounded-full bg-ivory/10 px-3 py-1">Privada · protegida</span>
        </div>
      </section>

      {photos.length > 1 && (
        <Link
          href={`/journey/${id}/compare`}
          className="mx-auto mt-5 flex min-h-13 max-w-md items-center justify-center rounded-full bg-forest px-6 text-sm font-bold text-ivory shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          Comparar antes e agora{' '}
          <span className="ml-2" aria-hidden="true">
            →
          </span>
        </Link>
      )}

      <Surface className="mt-8 overflow-hidden p-6 text-left shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wider text-forest">
          Leitura do registro
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-none">
          Fotografia pronta para acompanhar o tempo.
        </h2>
        <p className="mt-4 text-sm leading-6 text-graphite/62">
          Este registro documenta a aparência visual nesta data. A análise por IA ainda não está
          ativa; nenhuma condição ou resultado foi inferido.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-graphite/10 pt-5 text-sm">
          <Data
            label="Qualidade"
            value={photo.qualityStatus === 'ACCEPTED' ? 'Boa captura' : 'Revisar'}
          />
          <Data label="Enquadramento" value="Centralizado" />
          <Data label="Distância" value={photo.distance === 'CLOSE' ? 'Próxima' : 'Média'} />
          <Data label="Formato" value={`${photo.width} × ${photo.height}`} />
        </dl>
      </Surface>

      <section className="mt-5 rounded-[2rem] bg-sand/55 p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-forest">
          Enquanto o tempo passa
        </p>
        <ul className="mt-4 grid gap-4 text-sm leading-6 text-graphite/65">
          <li className="flex gap-3">
            <span aria-hidden="true" className="text-forest">
              01
            </span>
            <span>Siga somente o modo de uso presente no rótulo dos produtos.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="text-forest">
              02
            </span>
            <span>Mantenha uma rotina suave e evite manipular a região.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="text-forest">
              03
            </span>
            <span>Use proteção solar conforme orientação do produto escolhido.</span>
          </li>
        </ul>
        <p className="mt-5 border-t border-graphite/10 pt-4 text-xs leading-5 text-graphite/48">
          Orientações cosméticas gerais, sem diagnóstico ou prescrição.
        </p>
      </section>

      <section className="mt-5 rounded-[2rem] border border-graphite/10 bg-surface p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-forest">Próximo marco</p>
        <h2 className="mt-3 font-serif text-3xl">Sua próxima memória</h2>
        <p className="mt-3 text-sm leading-6 text-graphite/62">
          {nextPhotoAt ? (
            <>
              Programada pelo seu ciclo para{' '}
              <strong>
                {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(nextPhotoAt)}
              </strong>
              .
            </>
          ) : (
            'Configure seu ciclo para escolher o intervalo entre fotografias.'
          )}
        </p>
        {index > 0 && (
          <Link
            href={`/journey/${id}/checkpoint/${photos[index - 1]!.id}`}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-forest"
          >
            ← Memória anterior
          </Link>
        )}
      </section>
    </main>
  );
}

function Data({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-graphite/45">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
