'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@memyra/ui';

export function ConsentRecovery() {
  const router = useRouter();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/consents', {
        method: 'POST',
        signal: AbortSignal.timeout(15_000),
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ types: ['TERMS', 'PRIVACY'], version: '2026-09-08' }),
      });
      if (!response.ok) throw new Error('consent');
      router.replace('/onboarding');
      router.refresh();
    } catch {
      setError('Não foi possível salvar. Sua conta continua criada; tente novamente.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <main className="page-shell pt-12">
      <p className="text-accent">Pelmorya</p>
      <h1 className="title-display mt-6">Vamos concluir seu cadastro.</h1>
      <p className="mt-4 text-ivory/80">
        Sua conta já existe. Falta registrar a confirmação das informações de uso e privacidade.
      </p>
      <form action={submit} className="mt-6 grid gap-5">
        <label className="flex gap-3">
          <input type="checkbox" required className="mt-1 size-5 accent-accent" />
          <span>
            Li as{' '}
            <Link href="/terms" className="underline" target="_blank">
              informações de uso
            </Link>{' '}
            e{' '}
            <Link href="/privacy" className="underline" target="_blank">
              privacidade
            </Link>{' '}
            e aceito continuar.
          </span>
        </label>
        {error && <p role="alert">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando…' : 'Continuar minha jornada'}
        </Button>
      </form>
    </main>
  );
}
