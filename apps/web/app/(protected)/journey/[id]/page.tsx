import { getJourney } from '@memyra/application';
import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { requireCurrentActor } from '../../../../src/server/current-actor';
import { getJourneyServices } from '../../../../src/server/journey-services';
import { getDatabase } from '../../../../src/server/database';
import { JourneyActions } from '../../../components/journey-actions';
import { PhotoJournal } from '../../../components/photo-journal';
import { RoutinePanel } from '../../../components/routine-panel';
import { JourneyPath } from '../../../components/journey-path';

export const metadata: Metadata = { title: 'Jornada' };
export const dynamic = 'force-dynamic';

const skinAreaLabels: Record<string, string> = {
  FACE: 'Rosto',
  NECK: 'Pescoço',
  CHEST: 'Colo ou peito',
  BACK: 'Costas',
  ARM: 'Braço',
  HAND: 'Mão',
  LEG: 'Perna',
  OTHER: 'Outra região',
};

const sideLabels: Record<string, string> = {
  LEFT: 'Lado esquerdo',
  RIGHT: 'Lado direito',
  NOT_APPLICABLE: 'Não se aplica',
};

const contextLabels: Record<string, string> = {
  POST_ACNE_MARK: 'Marca pós-acne',
  AFTER_INJURY_MARK: 'Marca após machucado',
  TONE_CHANGE: 'Alteração de tonalidade',
  POST_INFLAMMATORY_MARK: 'Marca pós-inflamatória',
  OTHER: 'Outro contexto',
  UNKNOWN: 'Não sei informar',
};

const ageLabels: Record<string, string> = {
  LESS_THAN_ONE_MONTH: 'Menos de 1 mês',
  ONE_TO_THREE_MONTHS: 'De 1 a 3 meses',
  THREE_TO_SIX_MONTHS: 'De 3 a 6 meses',
  SIX_TO_TWELVE_MONTHS: 'De 6 a 12 meses',
  ONE_TO_TWO_YEARS: 'De 1 a 2 anos',
  MORE_THAN_TWO_YEARS: 'Mais de 2 anos',
  UNKNOWN: 'Não sei informar',
};

const goalLabels: Record<string, string> = {
  EVEN_APPEARANCE: 'Melhorar a uniformidade percebida',
  REDUCE_MARK_APPEARANCE: 'Acompanhar a aparência da marca',
  BUILD_CONSISTENT_ROUTINE: 'Criar consistência no cuidado',
  TRACK_EVOLUTION: 'Registrar minha trajetória',
  OTHER: 'Outro objetivo cosmético',
};

export default async function JourneyDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  try {
    const { id } = await params;
    const journey = await getJourney(
      await requireCurrentActor(await headers()),
      id,
      getJourneyServices().repository,
    );
    if (!journey) notFound();
    const day = Math.max(
      1,
      Math.floor((Date.now() - journey.startedAt.getTime()) / 86_400_000) + 1,
    );
    const prisma = getDatabase();
    const [photos, photoConsent, routinePlan] = await Promise.all([
      prisma.photoRecord.findMany({
        where: { journeyId: journey.id },
        orderBy: { capturedAt: 'desc' },
        select: { id: true, capturedAt: true, width: true, height: true, orientation: true },
      }),
      prisma.consentRecord.findFirst({
        where: {
          userId: journey.userId,
          type: 'PHOTO_PROCESSING',
          accepted: true,
          revokedAt: null,
        },
        select: { id: true },
      }),
      prisma.routinePlan.findUnique({
        where: { journeyId: journey.id },
        select: {
          durationDays: true,
          photoIntervalDays: true,
          periods: true,
          checkIns: {
            orderBy: { localDate: 'desc' },
            take: 180,
            select: { localDate: true, period: true, completed: true },
          },
        },
      }),
    ]);
    return (
      <main className="page-shell">
        <Link
          href="/journey"
          className="inline-flex min-h-11 items-center pt-5 text-sm font-semibold text-forest focus-visible:outline-2 focus-visible:outline-forest"
        >
          ← Suas jornadas
        </Link>
        <div className="pt-7 text-center">
          <p className="text-[0.68rem] font-bold uppercase tracking-[.22em] text-forest">
            Jornada REEDUCA · Dia {day}
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2.8rem,13vw,4.4rem)] leading-[.88] tracking-[-.045em]">
            {journey.name}
          </h1>
          <p className="mt-4 text-sm text-graphite/58">
            {skinAreaLabels[journey.skinArea.region]} · {sideLabels[journey.skinArea.side]}
          </p>
        </div>
        <JourneyPath journeyId={journey.id} day={day} plan={routinePlan} photos={photos} />
        <details className="mx-auto mt-7 max-w-xl rounded-2xl border border-graphite/10 bg-surface/65 px-5 py-4">
          <summary className="cursor-pointer text-sm font-semibold text-forest">
            Contexto desta jornada
          </summary>
          <p className="mt-3 text-sm leading-6 text-graphite/62">
            Contexto informado: {contextLabels[journey.context]}. Este registro organiza sua
            percepção cosmética e não representa diagnóstico.
          </p>
          <dl className="mt-4 grid gap-3 border-t border-graphite/10 pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-graphite/55">Tempo percebido</dt>
              <dd className="text-right font-semibold">{ageLabels[journey.approximateAge]}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-graphite/55">Objetivo</dt>
              <dd className="text-right font-semibold">{goalLabels[journey.goal]}</dd>
            </div>
          </dl>
        </details>
        <JourneyActions id={journey.id} status={journey.status} />
        <div id="rotina" className="scroll-mt-8">
          <RoutinePanel journeyId={journey.id} plan={routinePlan} />
        </div>
        <div id="fotografia" className="scroll-mt-8">
          <PhotoJournal
            journeyId={journey.id}
            photos={photos}
            hasConsent={Boolean(photoConsent)}
            canCapture={journey.status === 'ACTIVE'}
          />
        </div>
      </main>
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return (
        <main className="page-shell">
          <h1 className="title-display pt-12">Ambiente indisponível.</h1>
          <p className="mt-5 max-w-md leading-7 text-graphite/65">
            Não foi possível consultar suas jornadas agora. Tente novamente mais tarde.
          </p>
        </main>
      );
    }
    throw error;
  }
}
