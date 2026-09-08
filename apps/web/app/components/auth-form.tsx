'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button, Eyebrow } from '@memyra/ui';

import { authClient } from '../../src/client/auth-client';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(formData: FormData) {
    setPending(true);
    setError('');
    const emailValue = formData.get('email');
    const passwordValue = formData.get('password');
    const email = typeof emailValue === 'string' ? emailValue : '';
    const password = typeof passwordValue === 'string' ? passwordValue : '';

    try {
      const result = isRegister
        ? await authClient.signUp.email({ email, password, name: 'Pessoa MEMYRA' })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(
          isRegister
            ? 'Não foi possível criar sua conta. Revise os dados e tente novamente.'
            : 'Não foi possível entrar. Revise os dados e tente novamente.',
        );
        return;
      }

      if (isRegister) {
        const consentResponse = await fetch('/api/consents', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ types: ['TERMS', 'PRIVACY'], version: '2026-09-08' }),
        });
        if (!consentResponse.ok) {
          setError('Sua conta foi criada, mas não foi possível registrar os consentimentos. Entre novamente para continuar.');
          return;
        }
      }

      router.replace('/journey');
      router.refresh();
    } catch {
      setError('Não foi possível conectar ao serviço. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="w-full">
      <Eyebrow>{isRegister ? 'Sua trajetória começa aqui' : 'Continue sua trajetória'}</Eyebrow>
      <h1 className="title-display mt-4">{isRegister ? 'Crie sua conta.' : 'Entre na MEMYRA.'}</h1>
      <p className="mt-5 text-sm leading-6 text-graphite/62">
        {isRegister
          ? 'Use seu e-mail para manter suas jornadas acessíveis com segurança.'
          : 'Suas jornadas permanecem vinculadas à sua conta.'}
      </p>

      <form action={submit} className="mt-9 grid gap-5">
        <div>
          <label className="text-sm font-semibold" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            className="mt-2 min-h-12 w-full rounded-2xl border border-graphite/20 bg-surface px-4 text-base outline-none focus:border-forest focus:ring-2 focus:ring-forest/20"
          />
        </div>

        {isRegister && (
          <label className="flex items-start gap-3 text-sm leading-5 text-graphite/70">
            <input type="checkbox" name="consent" required className="mt-1 size-4 accent-forest" />
            <span>Li e aceito os Termos de Uso e a Política de Privacidade da MEMYRA.</span>
          </label>
        )}
        <div>
          <label className="text-sm font-semibold" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            minLength={8}
            className="mt-2 min-h-12 w-full rounded-2xl border border-graphite/20 bg-surface px-4 text-base outline-none focus:border-forest focus:ring-2 focus:ring-forest/20"
          />
          {isRegister && (
            <p className="mt-2 text-xs leading-5 text-graphite/55">Use pelo menos 8 caracteres.</p>
          )}
        </div>

        {error && (
          <p
            className="rounded-xl bg-clay/10 px-4 py-3 text-sm font-medium text-clay"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        <Button type="submit" className="mt-1 w-full" disabled={pending}>
          {pending ? 'Aguarde…' : isRegister ? 'Criar conta' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-graphite/62">
        {isRegister ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
        <Link
          href={isRegister ? '/login' : '/register'}
          className="font-semibold text-forest underline decoration-forest/30 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          {isRegister ? 'Entrar' : 'Criar conta'}
        </Link>
      </p>
    </section>
  );
}
