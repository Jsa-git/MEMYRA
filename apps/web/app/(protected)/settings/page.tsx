import { headers } from 'next/headers';
import { PageIntro } from '../../components/app-shell';
import { AccountSettings } from '../../components/account-settings';
import { requireCurrentActor } from '../../../src/server/current-actor';
import { getDatabase } from '../../../src/server/database';

export const metadata = { title: 'Ajustes' };

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const actor = await requireCurrentActor(await headers());
  const consents = await getDatabase().consentRecord.findMany({
    where: { userId: actor.userId, accepted: true, revokedAt: null },
    distinct: ['type'], orderBy: { createdAt: 'desc' },
    select: { type: true, version: true, acceptedAt: true },
  });
  return (
    <main className="page-shell">
      <PageIntro eyebrow="Preferências" title="Você controla sua experiência.">
        <p>Conta, consentimentos, notificações e dados pessoais serão gerenciados nesta área.</p>
      </PageIntro>
      <AccountSettings consents={consents} />
    </main>
  );
}
