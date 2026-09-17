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
  const [showPassword, setShowPassword] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError('');
    const emailValue = formData.get('email');
    const passwordValue = formData.get('password');
    const email = typeof emailValue === 'string' ? emailValue : '';
    const password = typeof passwordValue === 'string' ? passwordValue : '';

    try {
      const result = isRegister
        ? await authClient.signUp.email({ email, password, name: 'Pessoa Pelmorya' })
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
        try {
          const consentResponse = await fetch('/api/consents', {
            method: 'POST',
            signal: AbortSignal.timeout(15_000),
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ types: ['TERMS', 'PRIVACY'], version: '2026-09-08' }),
          });
          if (!consentResponse.ok) {
            router.replace('/consent');
            return;
          }
        } catch {
          router.replace('/consent');
          router.refresh();
          return;
        }
      }

      let destination = '/journey';
      if (isRegister) destination = '/onboarding';
      else {
        const consent = await fetch('/api/consents', {
          cache: 'no-store',
          signal: AbortSignal.timeout(15_000),
        });
        if (!consent.ok) {
          setError('Não foi possível verificar suas preferências. Tente entrar novamente.');
          return;
        }
        const { records } = (await consent.json()) as {
          records: { type: string; accepted: boolean; revokedAt: string | null }[];
        };
        if (
          !['TERMS', 'PRIVACY'].every((type) =>
            records.some((record) => record.type === type && record.accepted && !record.revokedAt),
          )
        ) {
          router.replace('/consent');
          return;
        }
        const profile = await fetch('/api/me', { signal: AbortSignal.timeout(15_000) }).then(
          (response) =>
            response.ok
              ? (response.json() as Promise<{ onboardingCompleted: boolean; resumePath: string }>)
              : null,
        );
        if (!profile) {
          setError('Não foi possível retomar sua jornada. Tente novamente.');
          return;
        }
        destination = profile.resumePath;
      }
      router.replace(destination);
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
      <h1 className="title-display mt-4">
        {isRegister ? 'Crie sua conta.' : 'Entre na Pelmorya.'}
      </h1>
      <p className="mt-5 text-base leading-6 text-ivory/80">
        {isRegister
          ? 'Use seu e-mail para manter suas jornadas acessíveis com segurança.'
          : 'Suas jornadas permanecem vinculadas à sua conta.'}
      </p>

      <form action={submit} className="mt-9 grid gap-5">
        <div>
          <label className="text-base font-semibold" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            className="mt-2 min-h-12 w-full rounded-2xl border border-ivory/20 bg-surface px-4 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent"
          />
        </div>

        {isRegister && (
          <label className="flex items-start gap-3 text-base leading-5 text-ivory/70">
            <input type="checkbox" name="consent" required className="mt-1 size-4 accent-accent" />
            <span>
              Li os{' '}
              <Link href="/terms" target="_blank" rel="noreferrer" className="underline">
                Termos de Uso
              </Link>{' '}
              e a{' '}
              <Link href="/privacy" target="_blank" rel="noreferrer" className="underline">
                Política de Privacidade
              </Link>{' '}
              da Pelmorya e aceito continuar.
            </span>
          </label>
        )}
        <div>
          <label className="text-base font-semibold" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            minLength={8}
            className="mt-2 min-h-12 w-full rounded-2xl border border-ivory/20 bg-surface px-4 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            aria-controls="password"
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value) => !value)}
            className="mt-2 min-h-11 rounded-lg px-1 text-sm font-semibold text-accent"
          >
            {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          </button>
          {isRegister && (
            <p className="mt-2 text-xs leading-5 text-ivory/80">Use pelo menos 8 caracteres.</p>
          )}
        </div>

        {error && (
          <p
            className="rounded-xl bg-clay/10 px-4 py-3 text-base font-medium text-clay"
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

      <p className="mt-7 text-center text-base text-ivory/80">
        {isRegister ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
        <Link
          href={isRegister ? '/login' : '/register'}
          className="font-semibold text-accent underline decoration-forest/30 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {isRegister ? 'Entrar' : 'Criar conta'}
        </Link>
      </p>
    </section>
  );
}
