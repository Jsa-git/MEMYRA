'use client';

import { Button, Surface } from '@memyra/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authClient } from '../../src/client/auth-client';

type ConsentView = { type: string; version: string; acceptedAt: string | Date | null };

export function AccountSettings({ consents }: { consents: readonly ConsentView[] }) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const labels: Record<string,string> = { TERMS: 'Termos de uso', PRIVACY: 'Política de privacidade', PHOTO_PROCESSING: 'Tratamento de fotografias' };

  async function deleteAccount() {
    setPending(true); setError('');
    try {
      const response = await fetch('/api/account', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ confirmation }) });
      if (!response.ok) throw new Error('DELETE_FAILED');
      await authClient.signOut();
      router.replace('/login'); router.refresh();
    } catch { setError('Não foi possível excluir a conta. Confira a confirmação e tente novamente.'); }
    finally { setPending(false); }
  }

  return <div className="grid gap-8">
    <Surface className="p-6">
      <h2 className="font-serif text-2xl">Privacidade e consentimentos</h2>
      <ul className="mt-4 divide-y divide-graphite/10">
        {consents.map((record) => <li key={`${record.type}-${record.version}`} className="flex justify-between gap-4 py-3 text-sm"><span>{labels[record.type] ?? record.type}</span><span className="text-forest">Aceito · versão {record.version}</span></li>)}
      </ul>
      <p className="mt-4 text-xs leading-5 text-graphite/55">O consentimento para fotografias será solicitado somente quando a captura for disponibilizada.</p>
    </Surface>
    <Surface className="border-clay/20 p-6">
      <h2 className="font-serif text-2xl">Excluir conta e dados</h2>
      <p className="mt-3 text-sm leading-6 text-graphite/60">Esta ação remove permanentemente a conta, jornadas e consentimentos vinculados. Fotografias futuras também deverão seguir este fluxo.</p>
      <label className="mt-5 grid gap-2 text-sm font-semibold">Digite EXCLUIR MINHA CONTA<input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="min-h-12 rounded-2xl border border-clay/30 bg-surface px-4 font-normal" /></label>
      {error && <p role="alert" className="mt-3 text-sm text-clay">{error}</p>}
      <Button className="mt-5" variant="secondary" disabled={pending || confirmation !== 'EXCLUIR MINHA CONTA'} onClick={() => void deleteAccount()}>{pending ? 'Excluindo…' : 'Excluir permanentemente'}</Button>
    </Surface>
  </div>;
}
