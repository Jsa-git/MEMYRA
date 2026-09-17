'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@memyra/ui';
import { usePrivatePhoto } from './use-private-photo';

type ComparisonPhoto = { id: string; label: string; date: string };
export function PhotoComparison({
  before,
  after,
}: {
  before: ComparisonPhoto;
  after: ComparisonPhoto;
}) {
  const first = usePrivatePhoto(before.id);
  const last = usePrivatePhoto(after.id);
  const [position, setPosition] = useState(50);
  const [mode, setMode] = useState<'slider' | 'side'>('slider');
  if (first.error || last.error)
    return (
      <div className="panel grid gap-4 p-6">
        <p role="alert">Não foi possível abrir os dois registros.</p>
        <Button
          onClick={() => {
            first.retry();
            last.retry();
          }}
        >
          Tentar novamente
        </Button>
      </div>
    );
  if (!first.url || !last.url)
    return (
      <div role="status" className="panel grid aspect-[3/4] place-items-center p-6 text-center">
        Preparando comparação privada…
      </div>
    );
  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2" aria-label="Modo de comparação">
        {(['slider', 'side'] as const).map((value) => (
          <Button
            key={value}
            variant={mode === value ? 'primary' : 'secondary'}
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
          >
            {value === 'slider' ? 'Deslizar' : 'Lado a lado'}
          </Button>
        ))}
      </div>
      {mode === 'slider' ? (
        <>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-graphite">
            <Image
              src={last.url}
              alt={`Registro de ${after.date}`}
              fill
              unoptimized
              className="object-contain"
              onError={last.imageError}
            />
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              <Image
                src={first.url}
                alt={`Registro de ${before.date}`}
                fill
                unoptimized
                className="object-contain"
                onError={first.imageError}
              />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-0.5 bg-ivory"
              style={{ left: `clamp(1px, ${position}%, calc(100% - 1px))` }}
            >
              <span className="absolute top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-xl text-graphite">
                ↔
              </span>
            </div>
            <label className="absolute inset-0">
              <span className="sr-only">Revelar primeiro registro</span>
              <input
                type="range"
                min="0"
                max="100"
                value={position}
                onChange={(event) => setPosition(Number(event.target.value))}
                className="h-full w-full cursor-ew-resize opacity-0 focus:opacity-100"
                aria-valuetext={`${position}% do primeiro registro visível`}
              />
            </label>
          </div>
          <label className="mt-4 block text-sm">
            Arraste sobre a foto ou ajuste abaixo
            <input
              aria-label="Posição da comparação"
              type="range"
              min="0"
              max="100"
              value={position}
              onChange={(event) => setPosition(Number(event.target.value))}
              className="mt-3 min-h-11 w-full accent-accent"
            />
          </label>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {[
            { photo: before, access: first },
            { photo: after, access: last },
          ].map(({ photo, access }) => (
            <div
              key={photo.id}
              className="relative aspect-[3/4] overflow-hidden rounded-xl bg-graphite"
            >
              <Image
                src={access.url}
                alt={photo.date}
                fill
                unoptimized
                className="object-contain"
                onError={access.imageError}
              />
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        {[before, after].map((photo) => (
          <p key={photo.id}>
            <strong className="block text-base">{photo.label}</strong>
            <span className="text-sm text-ivory/80">{photo.date}</span>
          </p>
        ))}
      </div>
      <p className="mt-5 text-sm text-ivory/80">
        Imagens integrais, sem alinhamento automático. Luz, posição e distância podem mudar a
        percepção.
      </p>
    </div>
  );
}
