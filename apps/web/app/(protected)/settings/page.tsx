import { Surface } from '@memyra/ui';
import { PageIntro } from '../../components/app-shell';

export const metadata = { title: 'Ajustes' };

export default function SettingsPage() {
  return (
    <main className="page-shell">
      <PageIntro eyebrow="Preferências" title="Você controla sua experiência.">
        <p>Conta, consentimentos, notificações e dados pessoais serão gerenciados nesta área.</p>
      </PageIntro>
      <Surface className="divide-y divide-graphite/8">
        {['Conta e acesso', 'Privacidade e consentimentos', 'Notificações', 'Seus dados'].map(
          (item) => (
            <button
              type="button"
              disabled
              key={item}
              className="flex min-h-14 w-full items-center justify-between px-5 text-left text-sm font-medium disabled:opacity-55"
            >
              <span>{item}</span>
              <span aria-hidden="true">›</span>
            </button>
          ),
        )}
      </Surface>
      <p className="mt-5 text-center text-xs text-graphite/50">
        Configurações estarão disponíveis nas próximas etapas.
      </p>
    </main>
  );
}
