'use client';

import { Button, Surface } from '@memyra/ui';
import { calculateRoutineStreak } from '@memyra/domain';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { trackingDate } from '@memyra/domain';

type Plan = {
  durationDays: number;
  photoIntervalDays: number;
  periods: string[];
  checkIns: { localDate: string; period: string; completed: boolean }[];
};

export function RoutinePanel({
  journeyId,
  plan,
  canEdit = true,
}: {
  journeyId: string;
  plan: Plan | null;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [celebration, setCelebration] = useState('');
  const busy = useRef(false);
  const [today, setToday] = useState(() => trackingDate(new Date()));
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setOverrides((current) =>
      Object.fromEntries(
        Object.entries(current).filter(
          ([key, value]) =>
            !plan?.checkIns.some(
              (item) => `${item.localDate}:${item.period}` === key && item.completed === value,
            ),
        ),
      ),
    );
  }, [plan]);
  useEffect(() => {
    const update = () => setToday(trackingDate(new Date()));
    const timer = setInterval(update, 30_000);
    window.addEventListener('focus', update);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', update);
    };
  }, []);
  const completed = new Set(
    plan?.checkIns
      .filter((item) => item.completed)
      .map((item) => `${item.localDate}:${item.period}`),
  );
  for (const [key, value] of Object.entries(overrides)) {
    if (value) completed.add(key);
    else completed.delete(key);
  }
  const fullyCompletedDates = plan
    ? Array.from(new Set(plan.checkIns.map((item) => item.localDate))).filter((date) =>
        plan.periods.every((period) => completed.has(`${date}:${period}`)),
      )
    : [];
  const streak = calculateRoutineStreak(fullyCompletedDates, today);
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - (6 - index));
    const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(date);
    return {
      key,
      day: new Intl.DateTimeFormat('pt-BR', {
        weekday: 'narrow',
        timeZone: 'America/Sao_Paulo',
      }).format(date),
      number: new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        timeZone: 'America/Sao_Paulo',
      }).format(date),
      done: fullyCompletedDates.includes(key),
      current: key === today,
    };
  });

  async function savePlan(formData: FormData) {
    if (busy.current || !canEdit) return;
    busy.current = true;
    setPending(true);
    setError('');
    const periods = ['MORNING', 'EVENING'].filter((period) => formData.get(period) === 'on');
    try {
      const response = await fetch(`/api/journeys/${journeyId}/routine`, {
        method: 'PUT',
        signal: AbortSignal.timeout(15000),
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          durationDays: Number(formData.get('durationDays')),
          photoIntervalDays: Number(formData.get('photoIntervalDays')),
          periods,
        }),
      });
      if (response.ok) router.refresh();
      else setError('Revise o ciclo e escolha ao menos um momento.');
    } catch {
      setError(
        'Não foi possível confirmar seu ciclo. Atualize a página antes de tentar novamente.',
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function toggle(period: string, value: boolean) {
    if (busy.current || !canEdit) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      const response = await fetch(`/api/journeys/${journeyId}/check-ins`, {
        method: 'POST',
        signal: AbortSignal.timeout(45000),
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ localDate: today, period, completed: value }),
      });
      if (response.ok) {
        setOverrides((current) => ({ ...current, [`${today}:${period}`]: value }));
        setCelebration(
          value ? 'Mais um cuidado registrado. Sua jornada continua.' : 'Registro atualizado.',
        );
        router.refresh();
      } else setError('Não foi possível registrar este check-in.');
    } catch {
      setError('Não foi possível confirmar o registro. Atualize a página ou tente novamente.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <section className="mx-auto mt-12 w-full max-w-xl" aria-labelledby="routine-title">
      <p className="text-center text-xs font-bold uppercase tracking-[.17em] text-accent">Rotina</p>
      <h2 id="routine-title" className="mt-2 text-center font-serif text-3xl">
        Consistência, um dia por vez
      </h2>
      <Surface className="mt-6 overflow-hidden p-5 shadow-soft sm:p-6">
        {!plan ? (
          <form action={savePlan} className="grid gap-5">
            <p className="text-base leading-6 text-ivory/80">
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
              <legend className="text-base font-semibold">Momentos indicados no seu rótulo</legend>
              <div className="mt-3 flex gap-5">
                <label className="flex gap-2 text-base">
                  <input type="checkbox" name="MORNING" className="accent-accent" />
                  Manhã
                </label>
                <label className="flex gap-2 text-base">
                  <input type="checkbox" name="EVENING" className="accent-accent" />
                  Noite
                </label>
              </div>
            </fieldset>
            <Button type="submit" disabled={pending || !canEdit}>
              Criar ciclo
            </Button>
          </form>
        ) : (
          <div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-ivory/80">Cuidado de hoje</p>
                <p className="mt-1 font-serif text-3xl">Seu pequeno ritual</p>
              </div>
              <p className="rounded-full bg-sand px-3 py-1.5 text-right text-xs font-semibold text-accent">
                Ciclo de {plan.durationDays} dias
              </p>
            </div>
            <div className="mt-6 grid gap-3">
              {plan.periods.map((period) => {
                const isDone = completed.has(`${today}:${period}`);
                return (
                  <label
                    key={period}
                    className={`flex min-h-16 cursor-pointer items-center justify-between rounded-2xl border px-4 text-base font-semibold transition-colors focus-within:ring-2 focus-within:ring-accent ${isDone ? 'border-accent bg-forest text-ivory' : 'border-ivory/20 bg-sand/40 hover:bg-sand/65'}`}
                  >
                    <span>
                      <span className="block">
                        {period === 'MORNING' ? 'Rotina da manhã' : 'Rotina da noite'}
                      </span>
                      <small
                        className={`mt-0.5 block font-normal ${isDone ? 'text-ivory/80' : 'text-ivory/80'}`}
                      >
                        {isDone ? 'Cuidado registrado' : 'Toque para concluir'}
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      checked={isDone}
                      disabled={pending || !canEdit}
                      onChange={(event) => void toggle(period, event.target.checked)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`grid size-8 place-items-center rounded-full border ${isDone ? 'border-ivory/30 bg-surface text-accent' : 'border-forest/25 text-accent'}`}
                    >
                      {isDone ? '✓' : '○'}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="mt-6 border-t border-ivory/10 pt-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-accent">
                    Últimos 7 dias
                  </p>
                  <p className="mt-1 text-xs text-ivory/80">
                    Cada círculo completo é um dia cuidado.
                  </p>
                </div>
                <p className="shrink-0 text-right">
                  <strong className="block font-serif text-2xl leading-none">{streak}</strong>
                  <span className="text-xs text-ivory/80">dias seguidos</span>
                </p>
              </div>
              <ol
                className="mt-5 grid grid-cols-7 gap-1"
                aria-label="Consistência nos últimos sete dias"
              >
                {week.map((item) => (
                  <li key={item.key} className="text-center">
                    <span className="block text-xs uppercase text-ivory/80">{item.day}</span>
                    <span
                      className={`mx-auto mt-1 grid size-8 place-items-center rounded-full text-xs font-bold ${item.done ? 'bg-forest text-ivory' : item.current ? 'border-2 border-forest text-accent' : 'bg-sand/55 text-ivory/80'}`}
                    >
                      {item.done ? '✓' : item.number}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="mt-4 text-xs leading-5 text-ivory/80">
              Registre apenas a realização. Quantidade e aplicação seguem o rótulo oficial.
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-4 text-base text-clay">
            {error}
          </p>
        )}
        {celebration && !error && (
          <p
            aria-live="polite"
            className="mt-4 rounded-2xl bg-forest px-4 py-3 text-center text-base font-semibold text-ivory"
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
    <label className="grid gap-2 text-base font-semibold">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-12 rounded-2xl border border-ivory/20 bg-surface px-4 font-normal"
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
