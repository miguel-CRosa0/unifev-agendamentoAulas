/** Converte erros vindos das funções de servidor em uma mensagem para o usuário. */
export function mensagemErro(e: unknown, padrao = "Não foi possível concluir a operação.") {
  if (!(e instanceof Error) || !e.message) return padrao;
  // Erros de validação (zod) chegam como JSON com a lista de problemas
  if (e.message.trimStart().startsWith("[")) return "Dados inválidos. Confira os campos e tente novamente.";
  return e.message;
}
