import { env, int } from "@fnando/env_vars";

const config = env(({ optional }) => {
  optional("GRAPHQL_MAX_TOKENS", int, 1000);
  optional("GRAPHQL_MAX_DUPLICATE_FIELDS", int, 2);
  optional("GRAPHQL_MAX_ALIASES", int, 5);
  optional("GRAPHQL_MAX_DIRECTIVES", int, 5);
  optional("PORT", int, 3000);
});

export { config };
