'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};
type InstallResult = 'accepted' | 'dismissed' | 'manual' | 'error';
type PwaState = {
  installed: boolean;
  canPrompt: boolean;
  unavailable: boolean;
  install: () => Promise<InstallResult>;
};
const PwaContext = createContext<PwaState | null>(null);

export function PwaProvider({ children }: { children: ReactNode }) {
  const promptRef = useRef<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const display = window.matchMedia('(display-mode: standalone)');
    const updateDisplay = () => {
      const ios = navigator as Navigator & { standalone?: boolean };
      setInstalled(display.matches || ios.standalone === true);
    };
    const beforeInstall = (event: Event) => {
      const candidate = event as InstallPrompt;
      if (typeof candidate.prompt !== 'function') return;
      event.preventDefault();
      promptRef.current = candidate;
      setCanPrompt(true);
    };
    const didInstall = () => {
      promptRef.current = null;
      setCanPrompt(false);
      setInstalled(true);
    };
    updateDisplay();
    display.addEventListener('change', updateDisplay);
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', didInstall);
    if ('serviceWorker' in navigator && window.isSecureContext) {
      void navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .catch(() => setUnavailable(true));
    }
    return () => {
      display.removeEventListener('change', updateDisplay);
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', didInstall);
    };
  }, []);

  async function install(): Promise<InstallResult> {
    const event = promptRef.current;
    if (!event) return 'manual';
    promptRef.current = null;
    setCanPrompt(false);
    try {
      await event.prompt();
      return (await event.userChoice).outcome;
    } catch {
      return 'error';
    }
  }

  return (
    <PwaContext.Provider value={{ installed, canPrompt, unavailable, install }}>
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const value = useContext(PwaContext);
  if (!value) throw new Error('PWA_PROVIDER_REQUIRED');
  return value;
}
