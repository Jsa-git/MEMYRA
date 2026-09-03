'use client';

import { RouteErrorState } from '../../components/ui-states';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorState onRetry={reset} />;
}
