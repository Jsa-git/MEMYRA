'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePwa } from '../components/pwa-provider';
import styles from './install.module.css';

type Platform = 'ios' | 'android' | 'desktop';
const instructions: Record<Platform, readonly string[]> = {
  ios: [
    'Abra esta página no Safari.',
    'Toque em Compartilhar (quadrado com seta para cima).',
    'Escolha “Adicionar à Tela de Início”. Se aparecer, mantenha “Abrir como App” ativado e toque em “Adicionar”.',
  ],
  android: [
    'Abra esta página no Chrome.',
    'Toque no menu de três pontos ⋮.',
    'Escolha “Instalar aplicativo” ou “Adicionar à tela inicial” e confirme.',
  ],
  desktop: [
    'Abra esta página no Chrome ou Edge.',
    'Procure o ícone de instalação na barra de endereço ou a opção de instalar no menu do navegador.',
    'Confirme a instalação. Para levar ao celular, abra este mesmo endereço nele.',
  ],
};

export function InstallAction() {
  const { installed, canPrompt, unavailable, install } = usePwa();
  const [platform, setPlatform] = useState<Platform>('android');
  const [expanded, setExpanded] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const busy = useRef(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setPlatform(
      /iPad|iPhone|iPod/.test(ua) || (/Mac/.test(ua) && navigator.maxTouchPoints > 1)
        ? 'ios'
        : /Android/.test(ua)
          ? 'android'
          : 'desktop',
    );
  }, []);

  async function handleInstall() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setMessage('');
    try {
      const result = await install();
      if (result === 'accepted') {
        setMessage(
          'Instalação solicitada. Aguarde a confirmação do navegador e procure o ícone Pelmorya.',
        );
        setExpanded(false);
      } else {
        setExpanded(true);
        if (result === 'dismissed')
          setMessage('Tudo bem. Você pode instalar quando quiser, pelo menu do navegador.');
        if (result === 'error')
          setMessage('Não foi possível abrir a instalação. Use o passo a passo abaixo.');
      }
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  if (installed)
    return (
      <div className={styles.actions}>
        <p className={styles.installed} role="status">
          Pelmorya já está instalada neste dispositivo.
        </p>
        <Link className={styles.installButton} href="/journey">
          Abrir minha jornada <span aria-hidden="true">↗</span>
        </Link>
      </div>
    );

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.installButton}
        disabled={pending}
        onClick={() => void handleInstall()}
        aria-expanded={expanded}
        aria-controls="install-instructions"
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
        </svg>
        {pending ? 'Abrindo instalação…' : 'Instalar Pelmorya'}
      </button>
      <p className={styles.installHint}>
        {canPrompt
          ? 'Confirme no navegador para adicionar o app.'
          : 'O botão mostra como instalar no seu dispositivo.'}
      </p>
      <p className={styles.status} role="status" aria-live="polite">
        {message}
      </p>
      {unavailable && (
        <p className={styles.installHint}>
          A preparação do app não foi concluída. Recarregue a página ou use o navegador por
          enquanto.
        </p>
      )}
      <section
        id="install-instructions"
        hidden={!expanded}
        className={styles.instructions}
        aria-labelledby="instructions-title"
      >
        <h2 id="instructions-title">Leve para a tela inicial.</h2>
        <div className={styles.platforms} role="group" aria-label="Seu dispositivo">
          {(
            [
              ['ios', 'iPhone / iPad'],
              ['android', 'Android'],
              ['desktop', 'Computador'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={platform === value}
              onClick={() => setPlatform(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <ol>
          {instructions[platform].map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p>
          Veio pelo Instagram ou WhatsApp? Abra o link no navegador do celular. Se a opção não
          aparecer, tente fora da navegação privada ou use “Entrar pelo navegador”.
        </p>
        <button className={styles.closeHelp} type="button" onClick={() => setExpanded(false)}>
          Fechar instruções
        </button>
      </section>
      <noscript>
        <p>
          Para instalar, abra o menu do navegador e escolha “Adicionar à Tela de Início”. No iPhone,
          use o menu Compartilhar do Safari.
        </p>
      </noscript>
    </div>
  );
}
