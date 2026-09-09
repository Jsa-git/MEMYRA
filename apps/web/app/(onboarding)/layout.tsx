import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCurrentActor } from '../../src/server/current-actor';

export default async function OnboardingLayout({ children }: Readonly<{ children: ReactNode }>) {
  if (!(await getCurrentActor(await headers()))) redirect('/login');
  return <>{children}</>;
}
