'use client';

import type { JourneyStatus } from '@memyra/domain';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function JourneyActions({ id, status }: { id: string; status: JourneyStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function changeStatus(nextStatus: JourneyStatus) {
    setPending(true);
    setError('');
    try {
      const response = await fetch(`/api/journeys/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error('STATUS_UPDATE_FAILED');
      router.refresh();
    } catch {
      setError('Não foi possível atualizar a jornada. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-8" aria-labelledby="manage-journey">
      <h2 id="manage-journey" className="font-serif text-2xl">Gerenciar jornada</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link className="inline-flex min-h-11 items-center rounded-full border border-graphite/15 px-5 text-sm font-semibold text-forest" href={`/journey/${id}/edit`}>
          Editar informações
        </Link>
        {status === 'ACTIVE' ? (
          <button disabled={pending} className="min-h-11 rounded-full border border-graphite/15 px-5 text-sm font-semibold" onClick={() => void changeStatus('ARCHIVED')}>
            Arquivar jornada
          </button>
        ) : (
          <button disabled={pending} className="min-h-11 rounded-full bg-forest px-5 text-sm font-semibold text-ivory" onClick={() => void changeStatus('ACTIVE')}>
            Reativar jornada
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-clay">{error}</p>}
    </section>
  );
}
