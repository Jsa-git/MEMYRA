'use client';

import { Button } from '@memyra/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const steps = [
  {
    number: '01',
    eyebrow: 'A pele tem memória',
    title: 'Uma trajetória que você consegue ver.',
    text: 'A MEMYRA reúne rotina, fotografias da mesma região e tempo em um caminho simples de acompanhar.',
    visual: 'path' as const,
  },
  {
    number: '02',
    eyebrow: 'Um cuidado por vez',
    title: 'Consistência cabe na vida real.',
    text: 'Check-ins rápidos ajudam você a perceber sua constância sem cobranças, competição ou promessas.',
    visual: 'week' as const,
  },
  {
    number: '03',
    eyebrow: 'Sua primeira memória',
    title: 'Fotografe com o mesmo olhar.',
    text: 'Você escolherá uma região e abrirá a câmera dentro do app. As imagens ficam privadas e não são usadas para diagnóstico.',
    visual: 'camera' as const,
  },
] as const;

export function OnboardingFlow({ alreadyCompleted }: { alreadyCompleted: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const current = steps[step]!;

  async function finish() {
    setPending(true);
    const response = await fetch('/api/onboarding', { method: 'POST' });
    if (response.ok) {
      router.replace('/journey/new?guided=1');
      router.refresh();
    } else setPending(false);
  }

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden px-5 pb-7 pt-6 text-center">
      <div className="pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-glow/35 blur-3xl" />
      <header className="relative flex items-center justify-between">
        <span className="font-serif text-lg tracking-[.2em]">MEMYRA</span>
        <span className="text-[.66rem] font-bold uppercase tracking-[.18em] text-graphite/45">
          {step + 1} de {steps.length}
        </span>
      </header>
      <section className="relative flex flex-1 flex-col justify-center py-7" aria-live="polite">
        <OnboardingVisual type={current.visual} />
        <p className="mt-8 text-[.68rem] font-bold uppercase tracking-[.21em] text-forest">
          {current.eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-[clamp(2.8rem,13vw,4rem)] leading-[.88] tracking-[-.045em]">
          {current.title}
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-graphite/62">{current.text}</p>
      </section>
      <footer className="relative">
        <div
          className="mb-5 grid grid-cols-3 gap-2"
          aria-label={`Etapa ${step + 1} de ${steps.length}`}
        >
          {steps.map((item, index) => (
            <span
              key={item.number}
              className={`h-1 rounded-full transition-colors motion-reduce:transition-none ${index <= step ? 'bg-forest' : 'bg-mineral'}`}
            />
          ))}
        </div>
        {step < steps.length - 1 ? (
          <Button className="w-full" onClick={() => setStep(step + 1)}>
            Continuar{' '}
            <span className="ml-2" aria-hidden="true">
              →
            </span>
          </Button>
        ) : (
          <Button className="w-full" disabled={pending} onClick={() => void finish()}>
            {pending
              ? 'Preparando sua jornada…'
              : alreadyCompleted
                ? 'Criar uma nova jornada'
                : 'Começar minha jornada'}
          </Button>
        )}
        {step > 0 && (
          <button
            className="mt-2 min-h-11 w-full text-sm font-semibold text-graphite/52"
            onClick={() => setStep(step - 1)}
          >
            Voltar
          </button>
        )}
      </footer>
    </main>
  );
}

function OnboardingVisual({ type }: { type: 'path' | 'week' | 'camera' }) {
  if (type === 'week')
    return (
      <div className="mx-auto w-full max-w-xs rounded-[2rem] bg-forest p-5 text-ivory shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-left text-xs uppercase tracking-wider text-ivory/60">
            Sua semana
          </span>
          <strong className="font-serif text-2xl">4 dias</strong>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => (
            <span
              key={`${day}-${index}`}
              className={`grid aspect-square place-items-center rounded-full text-[.65rem] ${index < 4 ? 'bg-glow font-bold text-forest' : 'border border-ivory/20 text-ivory/45'}`}
            >
              {index < 4 ? '✓' : day}
            </span>
          ))}
        </div>
      </div>
    );
  if (type === 'camera')
    return (
      <div className="relative mx-auto aspect-[4/3] w-52 overflow-hidden rounded-[2rem] bg-forest p-3 shadow-soft">
        <div className="grid h-full place-items-center rounded-[1.4rem] border border-ivory/35 bg-ivory/8">
          <span className="h-20 w-14 rounded-[45%] border border-ivory/75" />
        </div>
        <span className="absolute bottom-5 left-1/2 size-8 -translate-x-1/2 rounded-full border-2 border-ivory bg-ivory/20" />
      </div>
    );
  return (
    <div className="relative mx-auto h-40 w-44" aria-hidden="true">
      <span className="absolute left-1/2 top-2 h-32 w-px -translate-x-1/2 bg-gradient-to-b from-forest via-moss to-mineral" />
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          className={`absolute left-1/2 grid -translate-x-1/2 place-items-center rounded-full ${item === 1 ? 'current-step size-12 bg-forest text-ivory' : 'size-8 bg-glow text-forest'}`}
          style={{ top: `${item * 3.5 + 0.25}rem` }}
        >
          {item < 2 ? '✓' : '3'}
        </span>
      ))}
    </div>
  );
}
