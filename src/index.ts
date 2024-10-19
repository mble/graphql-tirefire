import express from "express";
import morgan from "morgan";
import { createHandler } from "graphql-http/lib/use/express";
import {
  parse,
  specifiedRules,
  NoSchemaIntrospectionCustomRule,
} from "graphql";
import bodyParser from "body-parser";
import { maxAliasesRule } from "@escape.tech/graphql-armor-max-aliases";
import { maxDirectivesRule } from "@escape.tech/graphql-armor-max-directives";
import { maxDepthRule } from "@escape.tech/graphql-armor-max-depth";
import { costLimitRule } from "@escape.tech/graphql-armor-cost-limit";
import { schema } from "./schema";
import { limitFieldsRule } from "./rules";

const app = express();

const handler = createHandler({
  schema,
  parse: (query) => parse(query, { maxTokens: 1000 }),
  validationRules: [
    ...specifiedRules,
    NoSchemaIntrospectionCustomRule,
    limitFieldsRule({
      n: 2,
      exposeLimits: false,
    }),
    maxDepthRule({
      exposeLimits: false,
    }),
    costLimitRule({
      exposeLimits: false,
    }),
    maxDirectivesRule({
      n: 5,
      exposeLimits: false,
    }),
    maxAliasesRule({
      n: 5,
      exposeLimits: false,
    }),
  ],
});

app.use(morgan("common"));
app.use(bodyParser.json({ limit: "64kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "64kb" }));
app.post("/graphql", handler);
app.listen(3000, () => console.log("Server running on port 3000"));
