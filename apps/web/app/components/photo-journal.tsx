'use client';

import { Button, Surface } from '@memyra/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type PhotoView = {
  id: string;
  capturedAt: Date | string;
  width: number;
  height: number;
  orientation: string;
};

export function PhotoJournal({
  journeyId,
  photos,
  hasConsent,
  canCapture,
  firstCapture = false,
}: {
  journeyId: string;
  photos: readonly PhotoView[];
  hasConsent: boolean;
  canCapture: boolean;
  firstCapture?: boolean;
}) {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const busy = useRef(false);
  const cameraRequest = useRef(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [captured, setCaptured] = useState<File | null>(null);
  const [capturedAt, setCapturedAt] = useState('');
  const [imported, setImported] = useState(false);
  const [preview, setPreview] = useState('');
  const [uploadId, setUploadId] = useState(() => crypto.randomUUID());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  function closeCamera() {
    cameraRequest.current += 1;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    setCameraOpen(false);
    setOpening(false);
  }

  useEffect(() => {
    const stop = () => {
      cameraRequest.current += 1;
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
    };
    const hide = () => {
      if (document.hidden) {
        stop();
        setCameraOpen(false);
        setOpening(false);
      }
    };
    document.addEventListener('visibilitychange', hide);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', hide);
    };
  }, []);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  useEffect(() => {
    if (cameraOpen && video.current && stream.current) {
      video.current.srcObject = stream.current;
      void video.current
        .play()
        .catch(() => setError('Use Ativar prévia da câmera para tentar novamente.'));
    }
  }, [cameraOpen, facing]);

  async function startCamera(nextFacing = facing) {
    if (opening || busy.current) return;
    closeCamera();
    const request = ++cameraRequest.current;
    setOpening(true);
    setError('');
    setFacing(nextFacing);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unavailable');
      const next = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: nextFacing },
          width: { ideal: 1080 },
          height: { ideal: 1440 },
        },
        audio: false,
      });
      if (request !== cameraRequest.current) {
        next.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = next;
      setCameraOpen(true);
    } catch {
      if (request === cameraRequest.current)
        setError(
          'Não foi possível abrir a câmera. Confira a permissão nas configurações do navegador ou selecione um arquivo.',
        );
    } finally {
      if (request === cameraRequest.current) setOpening(false);
    }
  }

  async function preparePhoto(file: File, fromCamera: boolean) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 20_000_000)
        throw new Error('Formato não aceito. Use JPEG, PNG ou WebP de até 20 MB.');
      const bitmap = await createImageBitmap(file);
      try {
        if (
          Math.min(bitmap.width, bitmap.height) < 320 ||
          bitmap.width * bitmap.height > 40_000_000
        )
          throw new Error(
            'Escolha uma imagem nítida com pelo menos 320 pixels por lado e até 40 megapixels.',
          );
        const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Não foi possível preparar a imagem neste navegador.');
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', 0.9),
        );
        if (!blob || blob.size > 4_000_000)
          throw new Error('A imagem ainda está muito grande. Faça uma nova captura.');
        setCaptured(new File([blob], 'captura-pelmorya.jpg', { type: 'image/jpeg' }));
        setPreview(URL.createObjectURL(blob));
        setUploadId(crypto.randomUUID());
        setImported(!fromCamera);
        setCapturedAt(fromCamera ? new Date().toISOString() : '');
      } finally {
        bitmap.close();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível preparar a fotografia.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function takePhoto() {
    if (busy.current) return;
    const frame = video.current;
    if (!frame?.videoWidth || !frame.videoHeight)
      return setError('Aguarde a câmera preparar a imagem.');
    busy.current = true;
    setPending(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = frame.videoWidth;
      canvas.height = frame.videoHeight;
      canvas.getContext('2d')?.drawImage(frame, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.95),
      );
      if (!blob) throw new Error('capture');
      busy.current = false;
      await preparePhoto(new File([blob], 'camera.jpg', { type: 'image/jpeg' }), true);
      closeCamera();
    } catch {
      setError('Não foi possível capturar. Tente novamente.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function submit(form: FormData) {
    if (busy.current || !captured) return;
    if (!capturedAt || !Number.isFinite(new Date(capturedAt).getTime()))
      return setError('Informe quando esta fotografia foi tirada.');
    busy.current = true;
    setPending(true);
    setError('');
    try {
      if (!hasConsent) {
        if (form.get('photoConsent') !== 'on')
          throw new Error('Autorize o armazenamento privado para enviar.');
        const consent = await fetch('/api/consents', {
          method: 'POST',
          signal: AbortSignal.timeout(45000),
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ types: ['PHOTO_PROCESSING'], version: '2026-09-08' }),
        });
        if (!consent.ok)
          throw new Error('Não foi possível registrar sua autorização. Tente novamente.');
      }
      const bitmap = await createImageBitmap(captured);
      form.set('width', String(bitmap.width));
      form.set('height', String(bitmap.height));
      form.set(
        'orientation',
        bitmap.width === bitmap.height
          ? 'SQUARE'
          : bitmap.width > bitmap.height
            ? 'LANDSCAPE'
            : 'PORTRAIT',
      );
      bitmap.close();
      form.set('photo', captured);
      form.set('uploadId', uploadId);
      form.set('capturedAt', new Date(capturedAt).toISOString());
      form.set('framing', 'NOT_ASSESSED');
      form.set('lighting', 'NOT_ASSESSED');
      const response = await fetch(`/api/journeys/${journeyId}/photos`, {
        method: 'POST',
        signal: AbortSignal.timeout(45000),
        body: form,
      });
      if (response.status === 413)
        throw new Error('A imagem excedeu o limite de envio. Tente uma nova captura.');
      const result = (await response.json()) as { id?: string; code?: string };
      if (!response.ok || !result.id)
        throw new Error(
          result.code === 'INVALID_CAPTURE_TIME'
            ? 'Use uma fotografia dos últimos sete dias, sem data futura.'
            : 'Não foi possível enviar. Sua captura está preservada para tentar novamente.',
        );
      setCaptured(null);
      setPreview('');
      router.push(`/journey/${journeyId}/checkpoint/${result.id}`);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error && !['TimeoutError', 'AbortError', 'TypeError'].includes(cause.name)
          ? cause.message
          : 'Não foi possível confirmar o envio. Sua captura foi mantida: tente novamente para verificar o mesmo registro.',
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function removePhoto(id: string) {
    if (busy.current || !window.confirm('Excluir permanentemente esta fotografia?')) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      const response = await fetch(`/api/photos/${id}`, {
        signal: AbortSignal.timeout(15000),
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('delete');
      router.refresh();
    } catch {
      setError('Não foi possível confirmar a exclusão. Tente novamente.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-xl" aria-labelledby="photo-journal-title">
      <header className="mb-5">
        <p className="text-sm font-semibold text-accent">
          {firstCapture ? 'Sua primeira memória' : 'Fotografia guiada'}
        </p>
        <h2 id="photo-journal-title" className="mt-2 font-serif text-3xl">
          A mesma região. Um novo momento.
        </h2>
        <p className="mt-3 text-base text-ivory/80">
          Use luz uniforme e repita a distância. A imagem fica privada, sem filtros.
        </p>
      </header>
      <Surface className="p-4 sm:p-6">
        {cameraOpen && (
          <div>
            <div className="mb-3 flex justify-between gap-3">
              <Button variant="quiet" onClick={closeCamera} disabled={pending}>
                Fechar câmera
              </Button>
              <Button
                variant="quiet"
                onClick={() => void startCamera(facing === 'environment' ? 'user' : 'environment')}
                disabled={pending}
              >
                Trocar câmera
              </Button>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-graphite">
              <video
                ref={video}
                autoPlay
                muted
                playsInline
                controls={false}
                className="max-h-[60dvh] w-full object-contain"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[12%] rounded-3xl border border-ivory/70"
              />
            </div>
            <Button
              variant="quiet"
              className="mt-2 w-full"
              onClick={() => {
                void video.current
                  ?.play()
                  .then(() => setError(''))
                  .catch(() => setError('Feche a câmera e confira a permissão do navegador.'));
              }}
            >
              Ativar prévia da câmera
            </Button>
            <Button className="mt-4 w-full" disabled={pending} onClick={() => void takePhoto()}>
              {pending ? 'Preparando…' : 'Tirar fotografia'}
            </Button>
          </div>
        )}
        {!cameraOpen && preview && (
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-graphite">
            <Image
              src={preview}
              alt="Prévia integral da fotografia, sem recorte"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        )}
        {!cameraOpen && !preview && (
          <div className="rounded-2xl border border-dashed border-violet p-8 text-center">
            <p className="font-serif text-2xl">Sua pele, no seu tempo.</p>
            <p className="mt-2 text-base text-ivory/80">
              Abra a câmera quando estiver em um lugar bem iluminado.
            </p>
          </div>
        )}
        {canCapture && !cameraOpen && (
          <form action={submit} className="mt-5 grid gap-4">
            <Button type="button" disabled={pending || opening} onClick={() => void startCamera()}>
              {opening ? 'Abrindo câmera…' : captured ? 'Tirar novamente' : 'Abrir câmera'}
            </Button>
            {opening && (
              <Button variant="quiet" onClick={closeCamera}>
                Cancelar abertura
              </Button>
            )}
            <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-ivory/25 text-base focus-within:ring-2 focus-within:ring-accent">
              Selecionar arquivo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={pending || opening}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void preparePhoto(file, false);
                  event.target.value = '';
                }}
              />
            </label>
            <p className="text-sm text-ivory/80">
              JPEG, PNG ou WebP. Arquivos são reduzidos para envio; use fotos dos últimos sete dias.
            </p>
            {captured && (
              <>
                {imported && (
                  <label className="grid gap-2 text-base">
                    Quando você tirou esta foto?
                    <input
                      type="datetime-local"
                      required
                      value={capturedAt}
                      onChange={(event) => setCapturedAt(event.target.value)}
                      className="min-h-12 min-w-0 rounded-xl border border-ivory/30 bg-surface px-3"
                    />
                    <span className="text-sm text-ivory/80">
                      Informe a data da captura, não a data em que o arquivo foi copiado.
                    </span>
                  </label>
                )}
                <label className="grid gap-2 text-base">
                  Distância aproximada
                  <select
                    name="distance"
                    className="min-h-12 rounded-xl border border-ivory/30 bg-surface px-3"
                  >
                    <option value="CLOSE">Próxima</option>
                    <option value="MEDIUM">Média</option>
                  </select>
                </label>
                {!hasConsent && (
                  <label className="flex gap-3 text-base">
                    <input
                      type="checkbox"
                      name="photoConsent"
                      required
                      className="mt-1 size-5 shrink-0 accent-accent"
                    />
                    <span>
                      Autorizo guardar esta foto de forma privada para acompanhar minha jornada.{' '}
                      <Link href="/privacy" className="underline">
                        Como usamos as fotos
                      </Link>
                      .
                    </span>
                  </label>
                )}
                <Button type="submit" disabled={pending}>
                  {pending ? 'Enviando com segurança…' : 'Enviar fotografia'}
                </Button>
              </>
            )}
          </form>
        )}
        {!canCapture && (
          <p className="mt-4 text-base">
            Esta jornada não está ativa. Reative-a para registrar novas fotos.
          </p>
        )}
      </Surface>
      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-ivory/40 p-4 text-base">
          {error}
        </p>
      )}
      {photos.length > 0 && (
        <section id="historico" className="mt-10" aria-label="Histórico de fotografias">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-serif text-3xl">Suas memórias</h3>
            {photos.length > 1 && (
              <Link className="action-link" href={`/journey/${journeyId}/compare`}>
                Comparar registros
              </Link>
            )}
          </div>
          <ol className="mt-5 divide-y divide-ivory/15">
            {photos.map((photo, index) => (
              <li key={photo.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <Link
                  className="min-h-12 flex-1 rounded-lg py-2"
                  href={`/journey/${journeyId}/checkpoint/${photo.id}`}
                >
                  <strong className="block">Memória {photos.length - index}</strong>
                  <span className="text-sm text-ivory/80">
                    {new Intl.DateTimeFormat('pt-BR', {
                      dateStyle: 'medium',
                      timeZone: 'America/Sao_Paulo',
                    }).format(new Date(photo.capturedAt))}
                  </span>
                </Link>
                <button
                  className="min-h-12 rounded-xl px-3 text-sm underline"
                  disabled={pending}
                  onClick={() => void removePhoto(photo.id)}
                >
                  Excluir
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
    </section>
  );
}
