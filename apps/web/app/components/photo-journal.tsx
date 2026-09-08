'use client';

import { Button, Surface } from '@memyra/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type PhotoView = { id: string; capturedAt: Date | string; width: number; height: number; orientation: string };

export function PhotoJournal({ journeyId, photos, hasConsent, canCapture }: { journeyId: string; photos: readonly PhotoView[]; hasConsent: boolean; canCapture: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(formData: FormData) {
    const file = formData.get('photo');
    if (!(file instanceof File) || file.size === 0) return setError('Escolha uma fotografia para continuar.');
    setPending(true); setError('');
    try {
      if (!hasConsent) {
        const accepted = formData.get('photoConsent') === 'on';
        if (!accepted) throw new Error('CONSENT_REQUIRED');
        const consent = await fetch('/api/consents', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ types: ['PHOTO_PROCESSING'], version: '2026-09-08' }) });
        if (!consent.ok) throw new Error('CONSENT_FAILED');
      }
      const dimensions = await readDimensions(file);
      formData.set('capturedAt', new Date().toISOString());
      formData.set('width', String(dimensions.width));
      formData.set('height', String(dimensions.height));
      formData.set('orientation', dimensions.width === dimensions.height ? 'SQUARE' : dimensions.width > dimensions.height ? 'LANDSCAPE' : 'PORTRAIT');
      formData.set('framing', 'CENTERED'); formData.set('lighting', 'EVEN');
      const response = await fetch(`/api/journeys/${journeyId}/photos`, { method: 'POST', body: formData });
      const body = await response.json() as { code?: string };
      if (!response.ok) throw new Error(body.code ?? 'UPLOAD_FAILED');
      router.refresh();
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : '';
      setError(code === 'PHOTO_STORAGE_NOT_CONFIGURED' ? 'O armazenamento privado ainda não está configurado.' : code === 'CONSENT_REQUIRED' ? 'Aceite o tratamento da fotografia para continuar.' : 'Não foi possível guardar a fotografia. Revise o arquivo e tente novamente.');
    } finally { setPending(false); }
  }

  async function openPhoto(id: string) {
    const response = await fetch(`/api/photos/${id}/access`, { method: 'POST' });
    const body = await response.json() as { url?: string };
    if (response.ok && body.url) window.open(body.url, '_blank', 'noopener,noreferrer');
    else setError('Não foi possível abrir a fotografia.');
  }

  async function removePhoto(id: string) {
    if (!window.confirm('Excluir permanentemente esta fotografia?')) return;
    setPending(true);
    const response = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
    setPending(false);
    if (response.ok) router.refresh(); else setError('Não foi possível excluir a fotografia.');
  }

  return <section className="mt-12" aria-labelledby="photo-journal-title">
    <p className="text-xs font-bold uppercase tracking-[.17em] text-forest">Fotografia padronizada</p>
    <h2 id="photo-journal-title" className="mt-2 font-serif text-3xl">Registros da mesma região</h2>
    <Surface className="mt-5 p-6">
      <ol className="grid gap-2 text-sm leading-6 text-graphite/65"><li>1. Use luz uniforme e evite sombras.</li><li>2. Centralize a mesma região e mantenha distância semelhante.</li><li>3. Não use filtros nem inclua outras pessoas.</li></ol>
      {canCapture ? <form action={submit} className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">Fotografia<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" required className="min-h-12 rounded-2xl border border-graphite/20 bg-surface p-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-semibold">Distância aproximada<select name="distance" defaultValue="CLOSE" className="min-h-12 rounded-2xl border border-graphite/20 bg-surface px-4 font-normal"><option value="CLOSE">Próxima</option><option value="MEDIUM">Média</option></select></label>
        {!hasConsent && <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" name="photoConsent" required className="mt-1 size-4 accent-forest" /><span>Autorizo o armazenamento privado desta fotografia para acompanhar minha jornada. Ela não será usada para diagnóstico.</span></label>}
        <Button type="submit" disabled={pending}>{pending ? 'Protegendo e enviando…' : 'Adicionar fotografia'}</Button>
      </form> : <p className="mt-5 text-sm text-graphite/60">Reative a jornada para adicionar uma nova fotografia.</p>}
    </Surface>
    {error && <p role="alert" className="mt-4 rounded-xl bg-clay/10 p-4 text-sm text-clay">{error}</p>}
    {photos.length > 0 && <ul className="mt-6 divide-y divide-graphite/10 border-y border-graphite/10">{photos.map((photo) => <li key={photo.id} className="flex items-center justify-between gap-4 py-4"><span><strong className="block text-sm">{new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(photo.capturedAt))}</strong><span className="text-xs text-graphite/55">{photo.width} × {photo.height} · {photo.orientation.toLowerCase()}</span></span><span className="flex gap-2"><button className="min-h-11 px-3 text-sm font-semibold text-forest" onClick={() => void openPhoto(photo.id)}>Visualizar</button><button disabled={pending} className="min-h-11 px-3 text-sm font-semibold text-clay" onClick={() => void removePhoto(photo.id)}>Excluir</button></span></li>)}</ul>}
  </section>;
}

async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const dimensions = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return dimensions;
}
