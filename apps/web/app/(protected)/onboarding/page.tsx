import { headers } from 'next/headers';
import { OnboardingFlow } from '../../components/onboarding-flow';
import { requireCurrentActor } from '../../../src/server/current-actor';
import { getDatabase } from '../../../src/server/database';

export const metadata = { title: 'Comece sua jornada' };
export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const actor = await requireCurrentActor(await headers());
  const user = await getDatabase().user.findUniqueOrThrow({ where: { id: actor.userId }, select: { onboardingCompletedAt: true } });
  return <OnboardingFlow alreadyCompleted={Boolean(user.onboardingCompletedAt)} />;
}
