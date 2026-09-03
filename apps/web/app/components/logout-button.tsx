'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authClient } from '../../src/client/auth-client';

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function logout() {
    setPending(true);
    setError('');
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error('SIGN_OUT_FAILED');
      router.replace('/login');
      router.refresh();
    } catch {
      setError('Não foi possível sair. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() => void logout()}
        className="min-h-11 rounded-full px-3 text-xs font-semibold text-graphite/60 hover:text-forest focus-visible:outline-2 focus-visible:outline-forest disabled:opacity-50"
      >
        {pending ? 'Saindo…' : 'Sair'}
      </button>
      {error && (
        <p className="max-w-48 text-right text-xs text-clay" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
