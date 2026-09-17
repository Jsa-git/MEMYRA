'use client';

import { Button } from '@memyra/ui';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export function OnboardingFlow({ alreadyCompleted }: { alreadyCompleted: boolean }) {
  const router = useRouter();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function begin() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error('onboarding');
      router.replace('/journey/new?guided=1');
      router.refresh();
    } catch {
      setError('Não foi possível continuar agora. Tente novamente; nenhuma jornada foi criada.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <header className="font-serif text-2xl tracking-wider">Pelmorya</header>
      <section className="flex flex-1 flex-col justify-center py-10">
        <p className="text-sm font-semibold text-accent">A pele tem memória</p>
        <h1 className="title-display mt-4">
          Um caminho de cuidado.
          <br />
          No seu ritmo.
        </h1>
        <p className="mt-5 text-base text-ivory/80">
          Escolha uma região, guarde seu primeiro registro e acompanhe seus momentos de cuidado.
        </p>
        <ol className="journey-map mt-8" aria-label="Como funciona">
          {[
            ['01', 'Seu ponto de partida', 'Uma foto privada, tirada dentro do app.'],
            ['02', 'Seu pequeno ritual', 'Registre os cuidados que você realizou.'],
            ['03', 'Sua memória no tempo', 'Volte à mesma região e compare registros.'],
          ].map(([number, title, detail]) => (
            <li className="journey-node" key={number}>
              <span className="journey-marker" aria-hidden="true">
                {number}
              </span>
              <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-ivory/80">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-sm text-ivory/80">
          Sem diagnóstico, competição ou promessa de resultado.
        </p>
      </section>
      <footer>
        {error && (
          <p role="alert" className="mb-4 rounded-xl border border-ivory/30 p-4">
            {error}
          </p>
        )}
        <Button className="w-full" disabled={pending} onClick={() => void begin()}>
          {pending
            ? 'Preparando…'
            : alreadyCompleted
              ? 'Criar uma nova jornada'
              : 'Começar minha jornada'}
        </Button>
      </footer>
    </main>
  );
}
