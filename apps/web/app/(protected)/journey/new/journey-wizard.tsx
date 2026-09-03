'use client';

import { useMemo, useState } from 'react';
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

const stepTitles = ['Região', 'Contexto', 'Tempo', 'Objetivo', 'Nome', 'Revisão'] as const;

function labelFor<T extends string>(
  options: ReadonlyArray<{ value: T; label: string }>,
  value?: T,
) {
  return options.find((option) => option.value === value)?.label ?? 'Não informado';
}

export function JourneyWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({ name: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const allowedSides = useMemo(() => {
    if (!form.region) return sides;
    if (['ARM', 'HAND', 'LEG'].includes(form.region))
      return sides.filter((item) => item.value !== 'NOT_APPLICABLE');
    return sides;
  }, [form.region]);

  function canContinue() {
    if (step === 0) return Boolean(form.region && form.side);
    if (step === 1) return Boolean(form.context);
    if (step === 2) return Boolean(form.approximateAge);
    if (step === 3) return Boolean(form.goal);
    if (step === 4) return form.name.trim().length >= 2 && form.name.trim().length <= 80;
    return true;
  }

  function next() {
    if (!canContinue()) {
      setError(step === 4 ? 'Use entre 2 e 80 caracteres.' : 'Escolha uma opção para continuar.');
      return;
    }
    setError('');
    setStep((current) => Math.min(current + 1, stepTitles.length - 1));
  }

  function selectRegion(region: SkinAreaRegion) {
    setForm((current) => {
      const next = { ...current, region };
      delete next.side;
      return next;
    });
  }

  async function submit() {
    const payload = {
      name: form.name,
      skinArea: { region: form.region, side: form.side },
      context: form.context,
      approximateAge: form.approximateAge,
      goal: form.goal,
    };
    if (!createJourneyInputSchema.safeParse(payload).success) {
      setError('Revise os dados da jornada antes de continuar.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/journeys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { id?: string; code?: string };
      if (!response.ok || !result.id) {
        setError(
          result.code === 'DATABASE_NOT_CONFIGURED'
            ? 'O banco local ainda não está configurado. Consulte o runbook de desenvolvimento.'
            : 'Não foi possível criar a jornada agora. Tente novamente.',
        );
        return;
      }
      router.push(`/journey/${result.id}`);
    } catch {
      setError('Não foi possível conectar ao serviço. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl pt-8">
      <Eyebrow>Método REEDUCA</Eyebrow>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold">
          Etapa {step + 1} de {stepTitles.length}
        </p>
        <p className="text-sm text-graphite/55">{stepTitles[step]}</p>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-mineral" aria-hidden="true">
        <div
          className="h-full bg-forest transition-[width] motion-reduce:transition-none"
          style={{ width: `${((step + 1) / stepTitles.length) * 100}%` }}
        />
      </div>

      <div className="mt-10 min-h-[25rem]">
        {step === 0 && (
          <ChoiceStep<SkinAreaRegion>
            title="Qual região você quer acompanhar?"
            name="region"
            options={regions}
            value={form.region}
            onChange={selectRegion}
          />
        )}
        {step === 0 && form.region && (
          <div className="mt-8">
            <ChoiceStep<SkinAreaSide>
              title="Qual lado?"
              name="side"
              options={allowedSides}
              value={form.side}
              onChange={(side) => setForm({ ...form, side })}
            />
          </div>
        )}
        {step === 1 && (
          <ChoiceStep<JourneyContext>
            title="Como você descreve esse contexto?"
            description="Escolha a opção que mais se aproxima da sua percepção. Isso não é um diagnóstico."
            name="context"
            options={contexts}
            value={form.context}
            onChange={(context) => setForm({ ...form, context })}
          />
        )}
        {step === 2 && (
          <ChoiceStep<ApproximateAge>
            title="Há quanto tempo você percebe essa marca?"
            description="Uma faixa aproximada é suficiente."
            name="approximateAge"
            options={ages}
            value={form.approximateAge}
            onChange={(approximateAge) => setForm({ ...form, approximateAge })}
          />
        )}
        {step === 3 && (
          <ChoiceStep<JourneyGoal>
            title="Qual é seu objetivo principal?"
            name="goal"
            options={goals}
            value={form.goal}
            onChange={(goal) => setForm({ ...form, goal })}
          />
        )}
        {step === 4 && (
          <div>
            <h1 className="font-serif text-4xl leading-tight">Dê um nome à sua jornada.</h1>
            <p className="mt-3 text-sm leading-6 text-graphite/60">
              Use algo simples que ajude você a reconhecer este acompanhamento.
            </p>
            <label className="mt-8 block text-sm font-semibold" htmlFor="journey-name">
              Nome da jornada
            </label>
            <input
              id="journey-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              maxLength={80}
              className="mt-2 min-h-12 w-full rounded-2xl border border-graphite/20 bg-surface px-4 text-base outline-none focus:border-forest focus:ring-2 focus:ring-forest/20"
              placeholder={
                form.region ? `Minha jornada — ${labelFor(regions, form.region)}` : 'Minha jornada'
              }
            />
            <p className="mt-2 text-right text-xs text-graphite/50">{form.name.length}/80</p>
          </div>
        )}
        {step === 5 && (
          <div>
            <h1 className="font-serif text-4xl leading-tight">Sua trajetória começa aqui.</h1>
            <p className="mt-3 text-sm leading-6 text-graphite/60">
              Revise o que será registrado. Você poderá acompanhar esta mesma região ao longo do
              tempo.
            </p>
            <Surface className="mt-8 divide-y divide-graphite/8 px-5">
              {[
                ['Jornada', form.name.trim()],
                ['Região', labelFor(regions, form.region)],
                ['Lado', labelFor(sides, form.side)],
                ['Contexto', labelFor(contexts, form.context)],
                ['Tempo percebido', labelFor(ages, form.approximateAge)],
                ['Objetivo', labelFor(goals, form.goal)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-4 py-4">
                  <dt className="w-28 shrink-0 text-xs font-bold uppercase tracking-wide text-graphite/50">
                    {label}
                  </dt>
                  <dd className="text-sm leading-5">{value}</dd>
                </div>
              ))}
            </Surface>
          </div>
        )}
      </div>

      {error && (
        <p
          className="mb-4 rounded-xl bg-clay/10 px-4 py-3 text-sm font-medium text-clay"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
      <div className="flex gap-3 border-t border-graphite/10 pt-5">
        {step > 0 && (
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setError('');
              setStep((current) => current - 1);
            }}
          >
            Voltar
          </Button>
        )}
        {step < 5 ? (
          <Button className="flex-1" onClick={next}>
            Continuar
          </Button>
        ) : (
          <Button className="flex-1" disabled={submitting} onClick={() => void submit()}>
            {submitting ? 'Criando…' : 'Criar jornada'}
          </Button>
        )}
      </div>
    </section>
  );
}

function ChoiceStep<T extends string>({
  title,
  description,
  name,
  options,
  value,
  onChange,
}: Readonly<{
  title: string;
  description?: string | undefined;
  name: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T | undefined;
  onChange: (value: T) => void;
}>) {
  return (
    <fieldset>
      <legend className="font-serif text-4xl leading-tight">{title}</legend>
      {description && <p className="mt-3 text-sm leading-6 text-graphite/60">{description}</p>}
      <div className="mt-7 grid gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors focus-within:ring-2 focus-within:ring-forest/30 ${value === option.value ? 'border-forest bg-forest text-ivory' : 'border-graphite/12 bg-surface hover:border-forest/40'}`}
          >
            <input
              type="radio"
              className="size-4 accent-forest"
              name={name}
              value={option.value}
              checked={value === option.value}
              readOnly
              onClick={() => onChange(option.value)}
            />
            <span className="text-sm font-semibold">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
