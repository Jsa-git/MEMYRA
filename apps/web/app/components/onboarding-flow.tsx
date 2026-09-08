'use client';

import { Button } from '@memyra/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const steps = [
  { number: '01', eyebrow: 'A pele tem memória', title: 'Acompanhe sua trajetória.', text: 'A MEMYRA organiza registros da mesma região ao longo do tempo. Sem pressa, promessas ou diagnóstico.' },
  { number: '02', eyebrow: 'Rotina', title: 'Consistência antes de intensidade.', text: 'Você seguirá o modo de uso oficial dos produtos e registrará sua constância em check-ins simples.' },
  { number: '03', eyebrow: 'Fotografia', title: 'Repita o enquadramento.', text: 'A câmera guiada ajuda a manter região, distância e luz semelhantes. As imagens permanecem privadas.' },
  { number: '04', eyebrow: 'Evolução', title: 'Compare checkpoints.', text: 'Cada fotografia vira um ponto da linha do tempo. A IA, quando ativada, explicará apenas diferenças visuais aparentes com cautela.' },
] as const;

export function OnboardingFlow({ alreadyCompleted }: { alreadyCompleted: boolean }) {
  const router = useRouter(); const [step, setStep] = useState(0); const [pending, setPending] = useState(false);
  const current = steps[step]!;
  async function finish() { setPending(true); const response = await fetch('/api/onboarding',{method:'POST'}); if (response.ok) { router.replace('/journey/new'); router.refresh(); } else setPending(false); }
  return <main className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md flex-col justify-between px-5 py-8 text-center sm:justify-center">
    <div><div className="mx-auto flex size-14 items-center justify-center rounded-full bg-forest font-serif text-xl text-ivory">{current.number}</div><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-forest">{current.eyebrow}</p><h1 className="mt-4 font-serif text-5xl leading-[.95]">{current.title}</h1><p className="mx-auto mt-6 max-w-sm text-base leading-7 text-graphite/65">{current.text}</p></div>
    <div className="mt-12"><div className="mb-6 flex justify-center gap-2" aria-label={`Etapa ${step + 1} de ${steps.length}`}>{steps.map((item,index)=><span key={item.number} className={`h-1.5 rounded-full ${index === step ? 'w-8 bg-forest' : 'w-2 bg-mineral'}`} />)}</div>{step < steps.length - 1 ? <Button className="w-full" onClick={()=>setStep(step+1)}>Continuar</Button> : <Button className="w-full" disabled={pending} onClick={()=>void finish()}>{pending ? 'Preparando…' : alreadyCompleted ? 'Criar nova jornada' : 'Começar minha jornada'}</Button>}{step > 0 && <button className="mt-3 min-h-11 w-full text-sm font-semibold text-graphite/55" onClick={()=>setStep(step-1)}>Voltar</button>}</div>
  </main>;
}
