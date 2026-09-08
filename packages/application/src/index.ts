import type { CreateJourneyInput, Journey, JourneyRepository } from '@memyra/domain';

export interface ActorContext {
  readonly userId: string;
}

export interface ApplicationServices {
  readonly repository: JourneyRepository;
  readonly createId: () => string;
  readonly now: () => Date;
}

export async function createJourney(
  actor: ActorContext,
  input: CreateJourneyInput,
  services: ApplicationServices,
): Promise<Journey> {
  const now = services.now();
  const journey: Journey = {
    id: services.createId(),
    userId: actor.userId,
    name: input.name.trim(),
    status: 'ACTIVE',
    skinArea: input.skinArea,
    context: input.context,
    approximateAge: input.approximateAge,
    goal: input.goal,
    startedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  return services.repository.create(journey);
}

export async function getJourney(
  actor: ActorContext,
  journeyId: string,
  repository: JourneyRepository,
): Promise<Journey | null> {
  return repository.findByIdForUser(journeyId, actor.userId);
}

export async function listJourneys(
  actor: ActorContext,
  repository: JourneyRepository,
): Promise<readonly Journey[]> {
  return repository.listForUser(actor.userId);
}

export async function updateJourneyStatus(
  actor: ActorContext,
  journeyId: string,
  status: Journey['status'],
  repository: JourneyRepository,
  now: () => Date,
): Promise<Journey | null> {
  return repository.updateStatusForUser(journeyId, actor.userId, status, now());
}

export async function updateJourney(
  actor: ActorContext,
  journeyId: string,
  input: CreateJourneyInput,
  repository: JourneyRepository,
  now: () => Date,
): Promise<Journey | null> {
  return repository.updateForUser(
    journeyId,
    actor.userId,
    { ...input, name: input.name.trim() },
    now(),
  );
}
