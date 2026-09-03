import { RouteErrorState } from '../../../components/ui-states';

export default function NotFound() {
  return (
    <RouteErrorState
      title="Jornada não encontrada."
      description="Ela pode não existir ou não estar disponível para esta conta."
    />
  );
}
