'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type ComparisonPhoto = { id: string; label: string; date: string };

export function PhotoComparison({
  before,
  after,
}: {
  before: ComparisonPhoto;
  after: ComparisonPhoto;
}) {
  const [urls, setUrls] = useState<{ before: string; after: string } | null>(null);
  const [error, setError] = useState(false);
  const [position, setPosition] = useState(50);
  const [mode, setMode] = useState<'slider' | 'side'>('slider');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      [before.id, after.id].map(async (id) => {
        const response = await fetch(`/api/photos/${id}/access`, {
          method: 'POST',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('PRIVATE_PHOTO_UNAVAILABLE');
        return ((await response.json()) as { url: string }).url;
      }),
    )
      .then(([beforeUrl, afterUrl]) => setUrls({ before: beforeUrl!, after: afterUrl! }))
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [before.id, after.id]);

  if (error)
    return (
      <div role="alert" className="rounded-[2rem] bg-clay/10 p-8 text-center text-sm text-clay">
        Não foi possível abrir esta comparação privada agora.
      </div>
    );
  if (!urls)
    return (
      <div className="flex aspect-[3/4] animate-pulse items-center justify-center rounded-[2rem] bg-mineral text-sm">
        Preparando comparação privada…
      </div>
    );

  return (
    <div>
      <div
        className="mb-4 grid grid-cols-2 rounded-full bg-sand/65 p-1"
        aria-label="Modo de comparação"
      >
        <ModeButton active={mode === 'slider'} onClick={() => setMode('slider')}>
          Deslizar
        </ModeButton>
        <ModeButton active={mode === 'side'} onClick={() => setMode('side')}>
          Lado a lado
        </ModeButton>
      </div>
      {mode === 'slider' ? (
        <>
          <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-mineral shadow-soft">
            <Image
              src={urls.after}
              alt={`Fotografia mais recente, ${after.date}`}
              fill
              unoptimized
              className="object-cover"
            />
            <div
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-ivory"
              style={{ width: `${position}%` }}
            >
              <div className="relative h-full" style={{ width: `${10000 / position}%` }}>
                <Image
                  src={urls.before}
                  alt={`Fotografia inicial, ${before.date}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>
            <span className="absolute left-3 top-3 rounded-full bg-graphite/75 px-3 py-1 text-[.65rem] font-bold uppercase tracking-wider text-ivory">
              Antes
            </span>
            <span className="absolute right-3 top-3 rounded-full bg-graphite/75 px-3 py-1 text-[.65rem] font-bold uppercase tracking-wider text-ivory">
              Agora
            </span>
            <span
              className="pointer-events-none absolute top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-ivory bg-forest text-ivory shadow-soft"
              style={{ left: `${position}%` }}
              aria-hidden="true"
            >
              ↔
            </span>
          </div>
          <label className="mt-4 block text-center text-xs font-semibold text-graphite/60">
            Mova para comparar as mesmas áreas
            <input
              className="mt-3 w-full accent-forest"
              type="range"
              min="8"
              max="92"
              value={position}
              onChange={(event) => setPosition(Number(event.target.value))}
            />
          </label>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <ComparisonFrame url={urls.before} label="Antes" date={before.date} />
          <ComparisonFrame url={urls.after} label="Agora" date={after.date} />
        </div>
      )}
      <div className="mt-5 grid grid-cols-2 text-center text-xs">
        <p>
          <strong className="block text-sm">{before.label}</strong>
          <span className="text-graphite/50">{before.date}</span>
        </p>
        <p>
          <strong className="block text-sm">{after.label}</strong>
          <span className="text-graphite/50">{after.date}</span>
        </p>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 rounded-full text-xs font-bold ${active ? 'bg-surface text-forest shadow-sm' : 'text-graphite/55'}`}
    >
      {children}
    </button>
  );
}
function ComparisonFrame({ url, label, date }: { url: string; label: string; date: string }) {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-[1.4rem] bg-mineral">
      <Image src={url} alt={`${label}, ${date}`} fill unoptimized className="object-cover" />
      <span className="absolute left-2 top-2 rounded-full bg-graphite/75 px-2.5 py-1 text-[.6rem] font-bold uppercase tracking-wider text-ivory">
        {label}
      </span>
    </div>
  );
}
