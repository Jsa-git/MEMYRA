'use client';

import Image from 'next/image';
import { Button } from '@memyra/ui';
import { usePrivatePhoto } from './use-private-photo';

export function CheckpointPhoto({ photoId }: { photoId: string }) {
  const photo = usePrivatePhoto(photoId);
  if (photo.error)
    return (
      <div className="grid aspect-[3/4] content-center gap-4 rounded-2xl bg-graphite p-6 text-center">
        <p role="alert">Não foi possível abrir esta foto.</p>
        <Button onClick={photo.retry}>Tentar novamente</Button>
      </div>
    );
  if (!photo.url)
    return (
      <div
        role="status"
        className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-graphite p-6 text-center"
      >
        Carregando registro privado…
      </div>
    );
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-graphite">
      <Image
        src={photo.url}
        alt="Fotografia integral deste checkpoint, sem filtro"
        fill
        unoptimized
        className="object-contain"
        onError={photo.imageError}
      />
    </div>
  );
}
