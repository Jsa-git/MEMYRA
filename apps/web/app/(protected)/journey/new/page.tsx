import type { Metadata } from 'next';

import { JourneyWizard } from './journey-wizard';

export const metadata: Metadata = { title: 'Nova jornada' };

export default async function NewJourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ guided?: string }>;
}) {
  const { guided } = await searchParams;
  return (
    <main className="page-shell">
      <JourneyWizard guided={guided === '1'} />
    </main>
  );
}
