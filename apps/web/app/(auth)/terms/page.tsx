import Link from 'next/link';
export const metadata = { title: 'Informações de uso' };
export default function TermsPage() {
  return (
    <article className="grid gap-5 py-4 text-base">
      <p className="text-sm font-semibold text-accent">Uso do aplicativo · Pelmorya</p>
      <h1 className="title-display">Um acompanhamento, não um diagnóstico.</h1>
      <p>
        A Pelmorya organiza jornadas, fotografias e registros de cuidado cosmético. A comparação de
        imagens não mede eficácia clínica e pode ser afetada por iluminação, posição e distância.
      </p>
      <p>
        O ciclo de acompanhamento não define um tratamento. Quantidade e frequência de uso dos
        produtos devem seguir as orientações oficiais do respectivo rótulo.
      </p>
      <p>
        Proteja suas credenciais e envie apenas imagens que você tenha autorização para armazenar.
        Não use o aplicativo para obter diagnósticos ou prescrição.
      </p>
      <p className="rounded-xl border border-ivory/25 p-4 text-sm">
        Documento informativo de desenvolvimento. Condições legais definitivas e identificação do
        responsável pelo serviço dependem de aprovação antes do lançamento público.
      </p>
      <Link className="text-accent underline" href="/privacy">
        Ler informações de privacidade
      </Link>
      <Link className="text-accent underline" href="/register">
        Voltar ao cadastro
      </Link>
    </article>
  );
}
