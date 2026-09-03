import type { ActorContext } from '@memyra/application';

import { getAuth } from './auth';

export async function getCurrentActor(requestHeaders: Headers): Promise<ActorContext | null> {
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  return session ? { userId: session.user.id } : null;
}

export async function requireCurrentActor(requestHeaders: Headers): Promise<ActorContext> {
  const actor = await getCurrentActor(requestHeaders);
  if (!actor) throw new Error('AUTHENTICATION_REQUIRED');
  return actor;
}
