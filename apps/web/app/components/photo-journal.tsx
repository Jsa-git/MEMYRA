'use client';

import { Button, Surface } from '@memyra/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type PhotoView = { id: string; capturedAt: Date | string; width: number; height: number; orientation: string };

export function PhotoJournal({ journeyId, photos, hasConsent, canCapture }: { journeyId: string; photos: readonly PhotoView[]; hasConsent: boolean; canCapture: boolean }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busyRef = useRef(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [captured, setCaptured] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState('');
  const [uploadId, setUploadId] = useState(() => crypto.randomUUID());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => stopCamera(streamRef.current), []);
  useEffect(() => () => { if (previewURL) URL.revokeObjectURL(previewURL); }, [previewURL]);

  async function startCamera() {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) return setError('A câmera não está disponível neste navegador. Use a opção de arquivo.');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1080 }, height: { ideal: 1440 } }, audio: false });
      streamRef.current = stream; setCameraOpen(true);
      requestAnimationFrame(() => { if (videoRef.current) { videoRef.current.srcObject = stream; void videoRef.current.play(); } });
    } catch { setError('Não foi possível abrir a câmera. Autorize o acesso ou use a opção de arquivo.'); }
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return setError('A câmera ainda está preparando a imagem.');
    const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return setError('Não foi possível capturar a fotografia.');
      const file = new File([blob], 'captura-memyra.jpg', { type: 'image/jpeg', lastModified: Date.now() });
      if (previewURL) URL.revokeObjectURL(previewURL);
      setCaptured(file); setPreviewURL(URL.createObjectURL(file)); setUploadId(crypto.randomUUID());
      stopCamera(streamRef.current); streamRef.current = null; setCameraOpen(false);
    }, 'image/jpeg', 0.92);
  }

  function chooseFile(file?: File) {
    if (!file) return;
    if (previewURL) URL.revokeObjectURL(previewURL);
    setCaptured(file); setPreviewURL(URL.createObjectURL(file)); setUploadId(crypto.randomUUID()); setError('');
  }

  async function submit(formData: FormData) {
    if (busyRef.current) return;
    if (!captured) return setError('Tire uma fotografia antes de enviar.');
    busyRef.current = true; setPending(true); setError('');
    try {
      if (!hasConsent) {
        if (formData.get('photoConsent') !== 'on') throw new Error('CONSENT_REQUIRED');
        const consent = await fetch('/api/consents', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ types: ['PHOTO_PROCESSING'], version: '2026-09-08' }) });
        if (!consent.ok) throw new Error('CONSENT_FAILED');
      }
      const dimensions = await readDimensions(captured);
      formData.set('photo', captured); formData.set('uploadId', uploadId);
      formData.set('capturedAt', new Date(captured.lastModified).toISOString());
      formData.set('width', String(dimensions.width)); formData.set('height', String(dimensions.height));
      formData.set('orientation', dimensions.width === dimensions.height ? 'SQUARE' : dimensions.width > dimensions.height ? 'LANDSCAPE' : 'PORTRAIT');
      formData.set('framing', 'CENTERED'); formData.set('lighting', 'EVEN');
      const response = await fetch(`/api/journeys/${journeyId}/photos`, { method: 'POST', body: formData });
      const body = await response.json() as { code?: string; id?: string };
      if (!response.ok || !body.id) throw new Error(body.code ?? 'UPLOAD_FAILED');
      setCaptured(null); setPreviewURL(''); setUploadId(crypto.randomUUID());
      router.push(`/journey/${journeyId}/checkpoint/${body.id}`); router.refresh();
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : '';
      setError(code === 'CONSENT_REQUIRED' ? 'Aceite o tratamento da fotografia para continuar.' : 'Não foi possível guardar a fotografia. Revise a captura e tente novamente.');
    } finally { busyRef.current = false; setPending(false); }
  }

  async function removePhoto(id: string) {
    if (!window.confirm('Excluir permanentemente esta fotografia?')) return;
    setPending(true); const response = await fetch(`/api/photos/${id}`, { method: 'DELETE' }); setPending(false);
    if (response.ok) router.refresh(); else setError('Não foi possível excluir a fotografia.');
  }

  return <section className="mx-auto mt-12 w-full max-w-xl text-center" aria-labelledby="photo-journal-title">
    <p className="text-xs font-bold uppercase tracking-[.17em] text-forest">Próximo checkpoint</p>
    <h2 id="photo-journal-title" className="mt-2 font-serif text-3xl">Fotografe a mesma região</h2>
    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-graphite/60">Luz uniforme, região centralizada e distância semelhante tornam a comparação mais consistente.</p>
    <Surface className="mt-6 overflow-hidden p-4 sm:p-6">
      {cameraOpen && <div className="relative mx-auto aspect-[3/4] max-h-[65vh] overflow-hidden rounded-[2rem] bg-graphite"><video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" /><div className="pointer-events-none absolute inset-[12%] rounded-[40%] border border-ivory/80" aria-hidden="true" /><button type="button" onClick={takePhoto} className="absolute bottom-5 left-1/2 size-16 -translate-x-1/2 rounded-full border-4 border-ivory bg-ivory/30" aria-label="Tirar fotografia" /></div>}
      {!cameraOpen && previewURL && <div className="relative mx-auto aspect-[3/4] overflow-hidden rounded-[2rem] bg-mineral"><Image src={previewURL} alt="Prévia privada da fotografia capturada" fill unoptimized className="object-cover" /></div>}
      {!cameraOpen && !previewURL && <div className="mx-auto flex aspect-[3/4] max-h-96 items-center justify-center rounded-[2rem] border border-dashed border-forest/30 bg-sand/40 px-8"><p className="font-serif text-2xl text-forest">Enquadre sua pele com calma.</p></div>}
      {canCapture ? <form action={submit} className="mt-5 grid gap-4 text-left">
        {!cameraOpen && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Button type="button" onClick={() => void startCamera()}>{captured ? 'Tirar novamente' : 'Abrir câmera'}</Button><label className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-graphite/15 px-5 text-sm font-semibold text-forest">Usar arquivo<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} /></label></div>}
        {!cameraOpen && captured && <><label className="grid gap-2 text-sm font-semibold">Distância aproximada<select name="distance" defaultValue="CLOSE" className="min-h-12 rounded-2xl border border-graphite/20 bg-surface px-4 font-normal"><option value="CLOSE">Próxima</option><option value="MEDIUM">Média</option></select></label>{!hasConsent && <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" name="photoConsent" required className="mt-1 size-4 accent-forest" /><span>Autorizo o armazenamento privado desta fotografia para acompanhar minha jornada. Ela não será usada para diagnóstico.</span></label>}<Button type="submit" disabled={pending}>{pending ? 'Protegendo e enviando…' : 'Enviar fotografia'}</Button></>}
      </form> : <p className="mt-5 text-sm text-graphite/60">Reative a jornada para criar um novo checkpoint.</p>}
    </Surface>
    {error && <p role="alert" className="mt-4 rounded-xl bg-clay/10 p-4 text-sm text-clay">{error}</p>}
    {photos.length > 0 && <div className="mt-10 text-left"><h3 className="font-serif text-2xl">Linha do tempo</h3><ul className="mt-4 divide-y divide-graphite/10 border-y border-graphite/10">{photos.map((photo, index) => <li key={photo.id} className="flex items-center justify-between gap-4 py-4"><span><strong className="block text-sm">Checkpoint {photos.length - index}</strong><span className="text-xs text-graphite/55">{new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium'}).format(new Date(photo.capturedAt))} · {photo.width} × {photo.height}</span></span><span className="flex gap-1"><Link className="min-h-11 px-3 py-3 text-sm font-semibold text-forest" href={`/journey/${journeyId}/checkpoint/${photo.id}`}>Abrir</Link><button disabled={pending} className="min-h-11 px-3 text-sm font-semibold text-clay" onClick={() => void removePhoto(photo.id)}>Excluir</button></span></li>)}</ul></div>}
  </section>;
}

function stopCamera(stream: MediaStream | null) { stream?.getTracks().forEach((track) => track.stop()); }
async function readDimensions(file: File) { const bitmap = await createImageBitmap(file); const value = { width: bitmap.width, height: bitmap.height }; bitmap.close(); return value; }
