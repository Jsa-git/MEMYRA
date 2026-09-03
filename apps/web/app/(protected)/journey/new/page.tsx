import type { Metadata } from 'next';

import { JourneyWizard } from './journey-wizard';

export const metadata: Metadata = { title: 'Nova jornada' };

export default function NewJourneyPage() {
  return (
    <main className="page-shell">
      <JourneyWizard />
    </main>
  );
}
