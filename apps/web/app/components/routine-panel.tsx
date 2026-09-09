'use client';

import { Button, Surface } from '@memyra/ui';
import { calculateRoutineStreak } from '@memyra/domain';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type Plan = {
  durationDays: number;
  photoIntervalDays: number;
  periods: string[];
  checkIns: { localDate: string; period: string; completed: boolean }[];
};

export function RoutinePanel({ journeyId, plan }: { journeyId: string; plan: Plan | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [celebration, setCelebration] = useState('');
  const today = useMemo(
    () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date()),
    [],
  );
  const completed = new Set(
    plan?.checkIns
      .filter((item) => item.completed)
      .map((item) => `${item.localDate}:${item.period}`),
  );
  const fullyCompletedDates = plan
    ? Array.from(new Set(plan.checkIns.map((item) => item.localDate))).filter((date) =>
        plan.periods.every((period) => completed.has(`${date}:${period}`)),
      )
    : [];
  const streak = calculateRoutineStreak(fullyCompletedDates, today);
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(date);
    return {
      key,
      day: new Intl.DateTimeFormat('pt-BR', { weekday: 'narrow' }).format(date),
      number: new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(date),
      done: fullyCompletedDates.includes(key),
      current: key === today,
    };
  });

  async function savePlan(formData: FormData) {
    setPending(true);
    setError('');
    const periods = ['MORNING', 'EVENING'].filter((period) => formData.get(period) === 'on');
    const response = await fetch(`/api/journeys/${journeyId}/routine`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        durationDays: Number(formData.get('durationDays')),
        photoIntervalDays: Number(formData.get('photoIntervalDays')),
        periods,
      }),
    });
    setPending(false);
    if (response.ok) router.refresh();
    else setError('Revise o ciclo e escolha ao menos um momento.');
  }

  async function toggle(period: string, value: boolean) {
    setPending(true);
    setError('');
    const response = await fetch(`/api/journeys/${journeyId}/check-ins`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ localDate: today, period, completed: value }),
    });
    setPending(false);
    if (response.ok) {
      setCelebration(
        value ? 'Mais um cuidado registrado. Sua jornada continua.' : 'Registro atualizado.',
      );
      router.refresh();
    } else setError('Não foi possível registrar este check-in.');
  }

  return (
    <section className="mx-auto mt-12 w-full max-w-xl" aria-labelledby="routine-title">
      <p className="text-center text-xs font-bold uppercase tracking-[.17em] text-forest">Rotina</p>
      <h2 id="routine-title" className="mt-2 text-center font-serif text-3xl">
        Consistência, um dia por vez
      </h2>
      <Surface className="mt-6 overflow-hidden p-5 shadow-soft sm:p-6">
        {!plan ? (
          <form action={savePlan} className="grid gap-5">
            <p className="text-sm leading-6 text-graphite/65">
              Configure um ciclo de acompanhamento seguindo a frequência indicada no rótulo. Isto
              não altera o modo de uso do produto.
            </p>
            <Select
              name="durationDays"
              label="Duração do acompanhamento"
              values={[
                [30, '30 dias'],
                [60, '60 dias'],
                [90, '90 dias'],
              ]}
              defaultValue="30"
            />
            <Select
              name="photoIntervalDays"
              label="Intervalo entre fotografias"
              values={[
                [7, '7 dias'],
                [14, '14 dias'],
                [30, '30 dias'],
              ]}
              defaultValue="14"
            />
            <fieldset>
              <legend className="text-sm font-semibold">Momentos indicados no seu rótulo</legend>
              <div className="mt-3 flex gap-5">
                <label className="flex gap-2 text-sm">
                  <input type="checkbox" name="MORNING" className="accent-forest" />
                  Manhã
                </label>
                <label className="flex gap-2 text-sm">
                  <input type="checkbox" name="EVENING" className="accent-forest" />
                  Noite
                </label>
              </div>
            </fieldset>
            <Button type="submit" disabled={pending}>
              Criar ciclo
            </Button>
          </form>
        ) : (
          <div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-graphite/50">Cuidado de hoje</p>
                <p className="mt-1 font-serif text-3xl">Seu pequeno ritual</p>
              </div>
              <p className="rounded-full bg-sand px-3 py-1.5 text-right text-xs font-semibold text-forest">
                Ciclo de {plan.durationDays} dias
              </p>
            </div>
            <div className="mt-6 grid gap-3">
              {plan.periods.map((period) => {
                const isDone = completed.has(`${today}:${period}`);
                return (
                  <label
                    key={period}
                    className={`flex min-h-16 cursor-pointer items-center justify-between rounded-2xl border px-4 text-sm font-semibold transition-colors ${isDone ? 'border-forest bg-forest text-ivory' : 'border-graphite/8 bg-sand/40 hover:bg-sand/65'}`}
                  >
                    <span>
                      <span className="block">
                        {period === 'MORNING' ? 'Rotina da manhã' : 'Rotina da noite'}
                      </span>
                      <small
                        className={`mt-0.5 block font-normal ${isDone ? 'text-ivory/65' : 'text-graphite/50'}`}
                      >
                        {isDone ? 'Cuidado registrado' : 'Toque para concluir'}
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      checked={isDone}
                      disabled={pending}
                      onChange={(event) => void toggle(period, event.target.checked)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`grid size-8 place-items-center rounded-full border ${isDone ? 'border-ivory/30 bg-ivory text-forest' : 'border-forest/25 text-forest'}`}
                    >
                      {isDone ? '✓' : '○'}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="mt-6 border-t border-graphite/10 pt-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-forest">
                    Últimos 7 dias
                  </p>
                  <p className="mt-1 text-xs text-graphite/50">
                    Cada círculo completo é um dia cuidado.
                  </p>
                </div>
                <p className="shrink-0 text-right">
                  <strong className="block font-serif text-2xl leading-none">{streak}</strong>
                  <span className="text-[.62rem] text-graphite/50">dias seguidos</span>
                </p>
              </div>
              <ol
                className="mt-5 grid grid-cols-7 gap-1"
                aria-label="Consistência nos últimos sete dias"
              >
                {week.map((item) => (
                  <li key={item.key} className="text-center">
                    <span className="block text-[.6rem] uppercase text-graphite/45">
                      {item.day}
                    </span>
                    <span
                      className={`mx-auto mt-1 grid size-8 place-items-center rounded-full text-[.66rem] font-bold ${item.done ? 'bg-forest text-ivory' : item.current ? 'border-2 border-forest text-forest' : 'bg-sand/55 text-graphite/45'}`}
                    >
                      {item.done ? '✓' : item.number}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="mt-4 text-xs leading-5 text-graphite/50">
              Registre apenas a realização. Quantidade e aplicação seguem o rótulo oficial.
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-4 text-sm text-clay">
            {error}
          </p>
        )}
        {celebration && !error && (
          <p
            aria-live="polite"
            className="mt-4 rounded-2xl bg-forest px-4 py-3 text-center text-sm font-semibold text-ivory"
          >
            <span aria-hidden="true">✦ </span>
            {celebration}
          </p>
        )}
      </Surface>
    </section>
  );
}

function Select({
  name,
  label,
  values,
  defaultValue,
}: {
  name: string;
  label: string;
  values: readonly (readonly [number, string])[];
  defaultValue: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-12 rounded-2xl border border-graphite/20 bg-surface px-4 font-normal"
      >
        {values.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
