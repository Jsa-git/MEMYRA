'use client';

import { RouteErrorState } from '../../../components/ui-states';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorState title="Não foi possível retomar esta jornada." onRetry={reset} />;
}
