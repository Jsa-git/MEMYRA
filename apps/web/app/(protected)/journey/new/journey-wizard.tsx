'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Eyebrow, Surface } from '@memyra/ui';
import { createJourneyInputSchema } from '@memyra/validation';
import type {
  ApproximateAge,
  JourneyContext,
  JourneyGoal,
  SkinAreaRegion,
  SkinAreaSide,
} from '@memyra/domain';

const regions: ReadonlyArray<{ value: SkinAreaRegion; label: string }> = [
  { value: 'FACE', label: 'Rosto' },
  { value: 'NECK', label: 'Pescoço' },
  { value: 'CHEST', label: 'Colo ou peito' },
  { value: 'BACK', label: 'Costas' },
  { value: 'ARM', label: 'Braço' },
  { value: 'HAND', label: 'Mão' },
  { value: 'LEG', label: 'Perna' },
  { value: 'OTHER', label: 'Outra região' },
];
const sides: ReadonlyArray<{ value: SkinAreaSide; label: string }> = [
  { value: 'LEFT', label: 'Lado esquerdo' },
  { value: 'RIGHT', label: 'Lado direito' },
  { value: 'NOT_APPLICABLE', label: 'Não se aplica' },
];
const contexts: ReadonlyArray<{ value: JourneyContext; label: string }> = [
  { value: 'POST_ACNE_MARK', label: 'Marca pós-acne' },
  { value: 'AFTER_INJURY_MARK', label: 'Marca após machucado' },
  { value: 'TONE_CHANGE', label: 'Alteração de tonalidade' },
  { value: 'POST_INFLAMMATORY_MARK', label: 'Marca pós-inflamatória' },
  { value: 'OTHER', label: 'Outra' },
  { value: 'UNKNOWN', label: 'Não sei informar' },
];
const ages: ReadonlyArray<{ value: ApproximateAge; label: string }> = [
  { value: 'LESS_THAN_ONE_MONTH', label: 'Menos de 1 mês' },
  { value: 'ONE_TO_THREE_MONTHS', label: 'De 1 a 3 meses' },
  { value: 'THREE_TO_SIX_MONTHS', label: 'De 3 a 6 meses' },
  { value: 'SIX_TO_TWELVE_MONTHS', label: 'De 6 a 12 meses' },
  { value: 'ONE_TO_TWO_YEARS', label: 'De 1 a 2 anos' },
  { value: 'MORE_THAN_TWO_YEARS', label: 'Mais de 2 anos' },
  { value: 'UNKNOWN', label: 'Não sei informar' },
];
const goals: ReadonlyArray<{ value: JourneyGoal; label: string }> = [
  { value: 'EVEN_APPEARANCE', label: 'Melhorar a uniformidade percebida' },
  { value: 'REDUCE_MARK_APPEARANCE', label: 'Acompanhar a aparência da marca' },
  { value: 'BUILD_CONSISTENT_ROUTINE', label: 'Criar consistência no cuidado' },
  { value: 'TRACK_EVOLUTION', label: 'Registrar minha trajetória' },
  { value: 'OTHER', label: 'Outro objetivo cosmético' },
];

type FormState = {
  name: string;
  region?: SkinAreaRegion;
  side?: SkinAreaSide;
  context?: JourneyContext;
  approximateAge?: ApproximateAge;
  goal?: JourneyGoal;
};

const stepTitles = ['Região', 'Seu contexto', 'Confirmar'] as const;
function labelFor<T extends string>(
  options: ReadonlyArray<{ value: T; label: string }>,
  value?: T,
) {
  return options.find((option) => option.value === value)?.label ?? 'Não informado';
}

export function JourneyWizard({ guided = false }: { guided?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    name: '',
    context: 'UNKNOWN',
    approximateAge: 'UNKNOWN',
    goal: 'TRACK_EVOLUTION',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const allowedSides =
    form.region && ['ARM', 'HAND', 'LEG'].includes(form.region)
      ? sides.filter((side) => side.value !== 'NOT_APPLICABLE')
      : sides;
  function move(next: number) {
    if (step === 0 && next > 0 && (!form.region || !form.side)) {
      setError('Escolha a região e o lado para continuar.');
      return;
    }
    setError('');
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  }
  async function submit() {
    if (busy.current) return;
    const payload = {
      name: form.name,
      skinArea: { region: form.region, side: form.side },
      context: form.context,
      approximateAge: form.approximateAge,
      goal: form.goal,
    };
    if (!createJourneyInputSchema.safeParse(payload).success) {
      setError('Revise o nome e a região da jornada.');
      return;
    }
    busy.current = true;
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/journeys', {
        method: 'POST',
        signal: AbortSignal.timeout(20_000),
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { id?: string };
      if (!response.ok || !result.id) throw new Error('create');
      router.push(`/journey/${result.id}/start`);
    } catch {
      setError(
        'Não foi possível confirmar a criação. Confira suas jornadas antes de tentar de novo.',
      );
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }
  return (
    <section className="mx-auto max-w-xl pt-6">
      <Eyebrow>{guided ? 'Seu ponto de partida' : 'Nova jornada'}</Eyebrow>
      <div className="mt-4 flex justify-between gap-3 text-sm">
        <span>Etapa {step + 1} de 3</span>
        <span>{stepTitles[step]}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2" aria-hidden="true">
        {stepTitles.map((title, index) => (
          <span
            key={title}
            className={`h-1 rounded-full ${index <= step ? 'bg-accent' : 'bg-mineral'}`}
          />
        ))}
      </div>
      <h1 ref={heading} tabIndex={-1} className="title-display mt-8">
        {
          [
            'Qual região vamos acompanhar?',
            'Conte só o que você sabe.',
            'Pronta para sua primeira memória?',
          ][step]
        }
      </h1>
      <div className="my-7">
        {step === 0 && (
          <>
            <Choices
              label="Região da pele"
              name="region"
              options={regions}
              value={form.region}
              onChange={(region) =>
                setForm((current) => ({
                  ...current,
                  region,
                  side: undefined,
                  name: 'Minha jornada — ' + labelFor(regions, region),
                }))
              }
            />
            {form.region && (
              <div className="mt-6">
                <Choices
                  label="Lado"
                  name="side"
                  options={allowedSides}
                  value={form.side}
                  onChange={(side) => setForm({ ...form, side })}
                />
              </div>
            )}
          </>
        )}
        {step === 1 && (
          <div className="grid gap-6">
            <p className="text-base text-ivory/80">
              Estas informações representam sua percepção, não um diagnóstico. Você pode manter “Não
              sei informar”.
            </p>
            <Select
              label="Como você descreve essa marca?"
              options={contexts}
              value={form.context}
              onChange={(context) => setForm({ ...form, context })}
            />
            <Select
              label="Há quanto tempo você percebe?"
              options={ages}
              value={form.approximateAge}
              onChange={(approximateAge) => setForm({ ...form, approximateAge })}
            />
            <Select
              label="O que você quer acompanhar?"
              options={goals}
              value={form.goal}
              onChange={(goal) => setForm({ ...form, goal })}
            />
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-6">
            <label className="grid gap-2 font-semibold">
              Nome da jornada
              <input
                value={form.name}
                maxLength={80}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="min-h-12 w-full rounded-xl border border-ivory/30 bg-surface px-4 text-base font-normal"
              />
            </label>
            <Surface className="p-5">
              <dl className="grid gap-4">
                {[
                  ['Região', labelFor(regions, form.region)],
                  ['Lado', labelFor(sides, form.side)],
                  ['Contexto informado', labelFor(contexts, form.context)],
                  ['Tempo percebido', labelFor(ages, form.approximateAge)],
                  ['Objetivo', labelFor(goals, form.goal)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-ivory/80">{label}</dt>
                    <dd className="mt-1 text-base font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </Surface>
            <p className="text-base text-ivory/80">
              Depois de criar, você poderá abrir a câmera ou fotografar mais tarde. A jornada criada
              permanece salva na sua conta.
            </p>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-ivory/30 p-4">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 border-t border-ivory/20 pt-5">
        {step > 0 && (
          <Button variant="secondary" disabled={submitting} onClick={() => move(step - 1)}>
            Voltar
          </Button>
        )}
        <Button
          className={step === 0 ? 'col-span-2' : ''}
          disabled={submitting}
          onClick={() => (step < 2 ? move(step + 1) : void submit())}
        >
          {submitting ? 'Criando…' : step < 2 ? 'Continuar' : 'Criar jornada'}
        </Button>
      </div>
      <p className="mt-4 text-sm text-ivory/80">
        Antes da confirmação, estas escolhas ficam apenas nesta página.
      </p>
    </section>
  );
}

function Choices<T extends string>({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: readonly { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 font-semibold">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-14 cursor-pointer items-center gap-2 rounded-xl border p-3 focus-within:ring-2 focus-within:ring-accent ${option.value === value ? 'border-accent bg-sand' : 'border-ivory/25 bg-surface'}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="size-4 shrink-0 accent-accent"
            />
            <span className="text-base">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
function Select<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-base font-semibold">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="min-h-12 min-w-0 rounded-xl border border-ivory/30 bg-surface px-3 font-normal"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
