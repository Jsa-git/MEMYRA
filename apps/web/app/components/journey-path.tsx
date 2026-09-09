import { calculateConsistency, calculateCycleProgress } from '@memyra/domain';
import Link from 'next/link';

type Plan = {
  durationDays: number;
  photoIntervalDays: number;
  periods: string[];
  checkIns: { localDate: string; period: string; completed: boolean }[];
} | null;

type PathPhoto = { id: string; capturedAt: Date | string };

function localDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
}

export function JourneyPath({
  journeyId,
  day,
  plan,
  photos,
}: {
  journeyId: string;
  day: number;
  plan: Plan;
  photos: readonly PathPhoto[];
}) {
  const now = new Date();
  const today = localDate(now);
  const todayCompleted =
    plan?.checkIns.filter((item) => item.localDate === today && item.completed).length ?? 0;
  const todayDone = Boolean(plan?.periods.length && todayCompleted >= plan.periods.length);
  const recentCompleted =
    plan?.checkIns.filter(
      (item) =>
        item.completed && item.localDate >= localDate(new Date(Date.now() - 6 * 86_400_000)),
    ).length ?? 0;
  const activeDays = Math.min(7, day);
  const consistency = plan
    ? calculateConsistency({
        completedCheckIns: recentCompleted,
        activeDays,
        periodsPerDay: plan.periods.length,
      })
    : 0;
  const progress = plan ? calculateCycleProgress(day, plan.durationDays) : 0;
  const lastPhoto = photos[0];
  const nextPhotoDate =
    lastPhoto && plan
      ? new Date(new Date(lastPhoto.capturedAt).getTime() + plan.photoIntervalDays * 86_400_000)
      : null;
  const nextPhotoDue = Boolean(nextPhotoDate && nextPhotoDate <= now);

  const steps = [
    { title: 'Jornada iniciada', detail: `Dia ${day} da sua trajetória`, state: 'done' as const },
    photos.length
      ? {
          title: 'Primeira memória registrada',
          detail: `${photos.length} checkpoint${photos.length > 1 ? 's' : ''} protegido${photos.length > 1 ? 's' : ''}`,
          state: 'done' as const,
        }
      : {
          title: 'Registre a primeira memória',
          detail: 'Fotografe a região com a câmera guiada',
          state: 'current' as const,
          href: '#fotografia',
        },
    plan
      ? {
          title: 'Ciclo de cuidado criado',
          detail: `${plan.durationDays} dias · fotos a cada ${plan.photoIntervalDays}`,
          state: 'done' as const,
        }
      : {
          title: 'Prepare seu ciclo',
          detail: 'Escolha quando cuidar e acompanhar',
          state: photos.length ? ('current' as const) : ('next' as const),
          href: '#rotina',
        },
    plan
      ? {
          title: todayDone ? 'Cuidado de hoje concluído' : 'Seu cuidado de hoje',
          detail: todayDone
            ? 'Mais um dia de consistência'
            : `${todayCompleted} de ${plan.periods.length} momentos registrados`,
          state: todayDone ? ('done' as const) : ('current' as const),
          href: '#rotina',
        }
      : {
          title: 'Primeiro check-in',
          detail: 'Disponível depois de criar o ciclo',
          state: 'locked' as const,
        },
    lastPhoto && plan
      ? {
          title: nextPhotoDue ? 'Novo checkpoint disponível' : 'Próxima fotografia',
          detail: nextPhotoDate ? formatDate(nextPhotoDate) : '',
          state: nextPhotoDue ? ('current' as const) : ('next' as const),
          href: '#fotografia',
        }
      : {
          title: 'Próxima fotografia',
          detail: 'A data aparecerá após seu primeiro registro',
          state: 'locked' as const,
        },
    photos.length >= 2
      ? {
          title: 'Comparação desbloqueada',
          detail: 'Observe sua trajetória lado a lado',
          state: 'done' as const,
          href: `/journey/${journeyId}/compare`,
        }
      : {
          title: 'Comparação visual',
          detail: 'Desbloqueia com dois checkpoints',
          state: 'locked' as const,
        },
  ];

  return (
    <section
      className="relative mx-auto mt-7 w-full max-w-xl overflow-hidden rounded-[2rem] bg-forest px-5 py-7 text-ivory shadow-[0_24px_70px_rgb(35_72_59/22%)] sm:px-8"
      aria-labelledby="path-title"
    >
      <div className="pointer-events-none absolute -right-16 -top-14 size-52 rounded-full bg-moss/30 blur-2xl" />
      <div className="relative flex items-start justify-between gap-5">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[.2em] text-ivory/65">
            Trilha da memória
          </p>
          <h2 id="path-title" className="mt-2 max-w-xs font-serif text-[2.25rem] leading-[.95]">
            Seu caminho, um cuidado de cada vez.
          </h2>
        </div>
        <div className="grid size-16 shrink-0 place-items-center rounded-full border border-ivory/20 bg-ivory/10 text-center">
          <span>
            <strong className="block text-lg leading-none tabular-nums">{progress}%</strong>
            <small className="text-[.58rem] uppercase tracking-wider text-ivory/65">ciclo</small>
          </span>
        </div>
      </div>

      {plan && (
        <div className="relative mt-6 flex items-center justify-between rounded-2xl bg-ivory/9 px-4 py-3 text-sm">
          <span className="text-ivory/68">Consistência recente</span>
          <strong className="tabular-nums">{consistency}%</strong>
        </div>
      )}

      <ol className="relative mt-8 space-y-0">
        <div
          className="absolute bottom-8 left-[1.12rem] top-8 w-px bg-gradient-to-b from-glow via-ivory/35 to-ivory/10"
          aria-hidden="true"
        />
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="relative grid grid-cols-[2.25rem_1fr] gap-4 pb-7 last:pb-0"
          >
            <span
              className={`relative z-10 grid size-9 place-items-center rounded-full border text-xs font-bold ${step.state === 'done' ? 'border-glow bg-glow text-forest' : step.state === 'current' ? 'current-step border-ivory bg-ivory text-forest' : 'border-ivory/25 bg-forest text-ivory/45'}`}
              aria-hidden="true"
            >
              {step.state === 'done' ? '✓' : step.state === 'locked' ? '·' : index + 1}
            </span>
            <div className={`${step.state === 'locked' ? 'opacity-45' : ''}`}>
              <p className="font-semibold leading-5">{step.title}</p>
              <p className="mt-1 text-xs leading-5 text-ivory/58">{step.detail}</p>
              {step.href &&
                (step.state === 'current' || step.title === 'Comparação desbloqueada') && (
                  <Link
                    href={step.href}
                    className="mt-3 inline-flex min-h-10 items-center rounded-full bg-ivory px-4 text-xs font-bold text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
                  >
                    {step.title === 'Comparação desbloqueada'
                      ? 'Comparar agora'
                      : 'Continuar agora'}{' '}
                    <span className="ml-2" aria-hidden="true">
                      →
                    </span>
                  </Link>
                )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
