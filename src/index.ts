import express from "express";
import morgan from "morgan";
import { createHandler } from "graphql-http/lib/use/express";
import { parse, NoSchemaIntrospectionCustomRule } from "graphql";
import bodyParser from "body-parser";
import { maxAliasesRule } from "@escape.tech/graphql-armor-max-aliases";
import { maxDirectivesRule } from "@escape.tech/graphql-armor-max-directives";

import { schema } from "./schema";

const app = express();

const handler = createHandler({
  schema,
  parse: (query) => parse(query, { maxTokens: 5000 }),
  validationRules: [
    NoSchemaIntrospectionCustomRule,
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
