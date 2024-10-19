import { createHandler } from "graphql-http/lib/use/express";
import {
  parse,
  specifiedRules,
  NoSchemaIntrospectionCustomRule,
} from "graphql";
import { maxAliasesRule } from "@escape.tech/graphql-armor-max-aliases";
import { maxDirectivesRule } from "@escape.tech/graphql-armor-max-directives";
import { maxDepthRule } from "@escape.tech/graphql-armor-max-depth";
import { costLimitRule } from "@escape.tech/graphql-armor-cost-limit";

import { schema } from "./schema";
import { limitFieldsRule } from "./rules";
import { config } from "./config";

const graphQLHandler = createHandler({
  schema,
  parse: (query) => parse(query, { maxTokens: config.graphqlMaxTokens }),
  validationRules: [
    ...specifiedRules,
    NoSchemaIntrospectionCustomRule,
    limitFieldsRule({
      n: config.graphqlMaxDuplicateFields,
      exposeLimits: false,
    }),
    maxDepthRule({
      exposeLimits: false,
    }),
    costLimitRule({
      exposeLimits: false,
    }),
    maxDirectivesRule({
      n: config.graphqlMaxDirectives,
      exposeLimits: false,
    }),
    maxAliasesRule({
      n: config.graphqlMaxAliases,
      exposeLimits: false,
    }),
  ],
});

export { graphQLHandler };
