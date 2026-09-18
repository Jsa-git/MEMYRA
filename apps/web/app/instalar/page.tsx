import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

import { InstallAction } from './install-action';
import styles from './install.module.css';

export const metadata: Metadata = {
  title: 'Leve a Pelmorya com você',
  description:
    'Instale a Pelmorya na tela inicial do seu celular e mantenha sua trajetória de cuidado por perto.',
};

export default function InstallPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/login" className={styles.wordmark}>
          Pelmorya
        </Link>
        <Link href="/journey" className={styles.browserLink}>
          Entrar pelo navegador <span aria-hidden="true">↗</span>
        </Link>
      </header>
      <div className={styles.hero}>
        <section className={styles.copy} aria-labelledby="install-title">
          <p className={styles.eyebrow}>O seu cuidado, mais perto</p>
          <h1 id="install-title">
            Sua trajetória.
            <br />
            <em>A um toque.</em>
          </h1>
          <p className={styles.intro}>
            Um espaço para a sua rotina, suas memórias e cada novo passo. Agora, na tela do seu
            celular.
          </p>
          <InstallAction />
          <p className={styles.footnote}>
            Sem loja de aplicativos. Instalação pelo navegador.
            <br />
            Sua jornada precisa de conexão com a internet.
          </p>
        </section>
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.orbit} />
          <div className={styles.orbitInner} />
          <div className={styles.appTile}>
            <Image src="/app-icons/512" width={144} height={144} alt="" unoptimized priority />
            <span>Pelmorya</span>
          </div>
          <div className={styles.memoryLine}>
            <span /> <span /> <span />
          </div>
          <p className={styles.visualCaption}>
            A pele tem memória.
            <br />
            <i>O cuidado também.</i>
          </p>
          <span className={styles.orbitLabel}>ROTINA · FOTOGRAFIA · EVOLUÇÃO</span>
        </div>
      </div>
      <section className={styles.benefits} aria-label="Sua experiência Pelmorya">
        <div>
          <span>01 / PRESENÇA</span>
          <h2>Seu espaço, sempre perto.</h2>
          <p>Abra pelo ícone do celular e retome sua jornada.</p>
        </div>
        <div>
          <span>02 / CONTINUIDADE</span>
          <h2>A mesma conta. Sua história.</h2>
          <p>A instalação mantém o acesso à sua conta existente. Entre com seu e-mail e senha.</p>
        </div>
        <div>
          <span>03 / CUIDADO</span>
          <h2>Você no seu próprio ritmo.</h2>
          <p>Registre sua rotina e acompanhe suas fotografias ao longo do tempo.</p>
        </div>
      </section>
      <footer className={styles.footer}>
        <span>Pelmorya · A pele tem memória.</span>
        <Link href="/privacy">Privacidade</Link>
      </footer>
    </main>
  );
}
