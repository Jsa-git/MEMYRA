import { journeyNextStep, trackingDate, trackingDay } from '@memyra/domain';
import Link from 'next/link';

type Plan = {
  durationDays: number;
  photoIntervalDays: number;
  periods: string[];
  createdAt: Date;
  checkIns: { localDate: string; period: string; completed: boolean }[];
} | null;
type PathPhoto = { id: string; capturedAt: Date | string };

export function JourneyPath({
  journeyId,
  day,
  plan,
  photos,
  active = true,
}: {
  journeyId: string;
  day: number;
  plan: Plan;
  photos: readonly PathPhoto[];
  active?: boolean;
}) {
  const now = new Date();
  const today = trackingDate(now);
  const todayCompleted = new Set(
    plan?.checkIns
      .filter((item) => item.localDate === today && item.completed)
      .map((item) => item.period),
  );
  const todayDone = Boolean(plan && plan.periods.every((period) => todayCompleted.has(period)));
  const first = photos.at(-1);
  const last = photos[0];
  const nextDate =
    last && plan
      ? new Date(new Date(last.capturedAt).getTime() + plan.photoIntervalDays * 86_400_000)
      : null;
  const step = journeyNextStep({
    active,
    photoCount: photos.length,
    hasPlan: Boolean(plan),
    todayComplete: todayDone,
    photoDue: Boolean(nextDate && nextDate <= now),
  });
  const actions = {
    inactive: {
      title: 'Um capítulo guardado',
      text: 'Seus registros continuam disponíveis. Reative a jornada quando quiser voltar.',
      label: 'Ver memórias',
      href: '#historico',
    },
    photo: {
      title: photos.length ? 'É hora de um novo registro' : 'O começo da sua memória',
      text: 'Prepare a luz e fotografe a mesma região. Sem pressa, sem filtros.',
      label: photos.length ? 'Registrar nova foto' : 'Tirar minha primeira foto',
      href: '/journey/' + journeyId + '/start',
    },
    plan: {
      title: 'Crie seu ritmo de cuidado',
      text: 'Escolha os momentos de acompanhamento, seguindo o rótulo do produto.',
      label: 'Preparar meu ciclo',
      href: '#rotina',
    },
    'check-in': {
      title: 'Seu pequeno ritual de hoje',
      text: 'Registre o cuidado que você realizou. Um momento de cada vez.',
      label: 'Registrar cuidado',
      href: '#rotina',
    },
    complete: {
      title: 'Por hoje, cuidado registrado',
      text: 'Você pode seguir seu dia. A sua história continua aqui.',
      label: 'Rever minhas memórias',
      href: '#historico',
    },
  };
  const action = actions[step];
  const nodes = [
    {
      title: 'O primeiro olhar',
      detail: first ? 'Sua referência está guardada' : 'Uma foto para marcar o começo',
      complete: Boolean(first),
      current: active && !first,
      href: first
        ? '/journey/' + journeyId + '/checkpoint/' + first.id
        : '/journey/' + journeyId + '/start',
      glyph: '01',
    },
    {
      title: 'Meu ritmo',
      detail: plan
        ? plan.durationDays + ' dias de acompanhamento'
        : 'Um ciclo que cabe na sua rotina',
      complete: Boolean(plan),
      current: step === 'plan',
      href: '#rotina',
      glyph: '02',
    },
    {
      title: 'Cuidado de hoje',
      detail: plan
        ? todayCompleted.size + ' de ' + plan.periods.length + ' momentos registrados'
        : 'Disponível depois de criar seu ciclo',
      complete: todayDone,
      current: step === 'check-in',
      href: plan ? '#rotina' : null,
      glyph: '03',
    },
    {
      title: 'Um novo olhar',
      detail: nextDate
        ? 'Próxima foto: ' +
          new Intl.DateTimeFormat('pt-BR', {
            day: 'numeric',
            month: 'short',
            timeZone: 'America/Sao_Paulo',
          }).format(nextDate)
        : 'A próxima foto ganha uma data no seu ciclo',
      complete: photos.length >= 2,
      current: step === 'photo' && Boolean(first),
      href: active && first && plan ? '/journey/' + journeyId + '/start' : null,
      glyph: '04',
    },
    {
      title: 'Minha trajetória',
      detail:
        photos.length >= 2
          ? 'Escolha duas memórias para comparar'
          : 'Desbloqueia com duas fotografias',
      complete: photos.length >= 2,
      current: false,
      href: photos.length >= 2 ? '/journey/' + journeyId + '/compare' : null,
      glyph: '05',
    },
  ];
  return (
    <section className="mt-7" aria-labelledby="path-title">
      <div className="panel p-6">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-accent">Seu próximo passo</span>
          <span className="text-ivory/80">Dia {day}</span>
        </div>
        <h2 id="path-title" className="mt-4 font-serif text-3xl leading-tight">
          {action.title}
        </h2>
        <p className="mt-3 text-base text-ivory/80">{action.text}</p>
        <Link href={action.href} className="action-link mt-5 w-full">
          {action.label}
        </Link>
        {plan && (
          <p className="mt-4 text-sm text-ivory/80">
            Dia {Math.min(trackingDay(plan.createdAt, now), plan.durationDays)} de{' '}
            {plan.durationDays} do acompanhamento · não é uma medida de resultado da pele.
          </p>
        )}
      </div>
      <div className="mt-9 flex items-center justify-between gap-3">
        <h3 className="font-serif text-3xl">Seu caminho</h3>
        <span className="text-sm text-ivory/80">{photos.length} memórias</span>
      </div>
      <ol className="journey-map mt-6" aria-label="Marcos da jornada">
        {nodes.map((node, index) => (
          <li key={node.title} className={`journey-node ${index % 2 ? 'journey-node-right' : ''}`}>
            <div
              className={`journey-marker ${node.current ? 'journey-marker-current' : node.complete ? 'journey-marker-done' : ''}`}
              aria-hidden="true"
            >
              {node.complete ? '✓' : node.glyph}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-ivory/80">
                {node.current
                  ? 'Você está aqui'
                  : node.complete
                    ? 'Registrado'
                    : node.href
                      ? 'Disponível'
                      : 'Mais adiante'}
              </span>
              {node.href ? (
                <Link
                  href={node.href}
                  className="mt-1 block min-h-11 rounded-md py-2 text-lg font-semibold text-ivory"
                >
                  {node.title}
                  <span aria-hidden="true" className="ml-2 text-accent">
                    ↗
                  </span>
                </Link>
              ) : (
                <h4 className="mt-2 text-lg font-semibold">{node.title}</h4>
              )}
              <p className="text-sm leading-6 text-ivory/80">{node.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm text-ivory/80">
        Uma pausa não apaga seu caminho. Retome no seu ritmo.
      </p>
    </section>
  );
}
