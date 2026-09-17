import Link from 'next/link';
export const metadata = { title: 'Privacidade' };
export default function PrivacyPage() {
  return (
    <article className="grid gap-5 py-4 text-base">
      <p className="text-sm font-semibold text-accent">Transparência · Pelmorya</p>
      <h1 className="title-display">Seus registros são pessoais.</h1>
      <p>
        O aplicativo utiliza e-mail e credenciais para sua conta, informações da jornada, registros
        de rotina e fotografias enviadas por você.
      </p>
      <h2 className="font-serif text-2xl">Fotografias</h2>
      <p>
        As imagens são armazenadas em um bucket privado. O acesso pela aplicação exige autenticação
        e autorização, com endereços temporários. No processamento, removemos metadados da imagem,
        incluindo localização GPS.
      </p>
      <p>
        Não há análise por IA ativa nem envio de fotografias para um provedor de IA. Qualquer
        mudança nessa finalidade exige revisão e comunicação antes de ser disponibilizada.
      </p>
      <h2 className="font-serif text-2xl">Controle dos registros</h2>
      <p>
        Você pode excluir fotografias na jornada e solicitar a exclusão da conta em Ajustes. Uma
        operação que falhar precisa ser tentada novamente; não considere os dados removidos antes da
        confirmação.
      </p>
      <p className="rounded-xl border border-ivory/25 p-4 text-sm">
        Documento informativo de desenvolvimento, não uma política legal final. Identificação do
        controlador, canal de atendimento, bases aplicáveis e prazos de retenção/backups precisam
        ser aprovados antes do lançamento público.
      </p>
      <Link className="text-accent underline" href="/register">
        Voltar ao cadastro
      </Link>
    </article>
  );
}
