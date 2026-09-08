'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export function CheckpointPhoto({ photoId }: { photoId: string }) {
  const [url, setURL] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/photos/${photoId}/access`, { method: 'POST', signal: controller.signal })
      .then(async (response) => response.ok ? response.json() as Promise<{ url: string }> : Promise.reject(new Error()))
      .then((body) => setURL(body.url)).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [photoId]);
  if (error) return <div className="flex aspect-[3/4] items-center justify-center rounded-[2rem] bg-mineral p-6 text-center text-sm">Não foi possível abrir esta fotografia agora.</div>;
  if (!url) return <div className="flex aspect-[3/4] animate-pulse items-center justify-center rounded-[2rem] bg-mineral text-sm">Carregando registro privado…</div>;
  return <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-mineral"><Image src={url} alt="Fotografia privada deste checkpoint" fill unoptimized className="object-cover" /></div>;
}
