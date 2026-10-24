import { queryOptions } from "@tanstack/react-query";

import { getSessao } from "./api";

export const sessaoQueryOptions = queryOptions({
  queryKey: ["sessao"],
  queryFn: () => getSessao(),
  staleTime: Infinity,
});
