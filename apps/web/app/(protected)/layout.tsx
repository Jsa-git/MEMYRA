import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { AppShell } from '../components/app-shell';
import { getCurrentActor } from '../../src/server/current-actor';

export default async function ProtectedLayout({ children }: Readonly<{ children: ReactNode }>) {
  if (!(await getCurrentActor(await headers()))) redirect('/login');
  return <AppShell>{children}</AppShell>;
}
