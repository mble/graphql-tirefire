import {
  createHandler,
  OperationContext,
  Request as RawRequest,
} from "graphql-http";
import { HandlerOptions, RequestContext } from "graphql-http/lib/use/express";
import {
  parse,
  specifiedRules,
  GraphQLError,
  NoSchemaIntrospectionCustomRule,
} from "graphql";
import { Handler, Request, Response } from "express";
import { maxAliasesRule } from "@escape.tech/graphql-armor-max-aliases";
import { maxDirectivesRule } from "@escape.tech/graphql-armor-max-directives";
import { maxDepthRule } from "@escape.tech/graphql-armor-max-depth";
import { costLimitRule } from "@escape.tech/graphql-armor-cost-limit";

import { schema } from "./schema";
import { limitFieldsRule } from "./rules";
import { config } from "./config";

const toRequest = (
  req: Request,
  res: Response
): RawRequest<Request, RequestContext> => {
  return {
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: () => {
      if (req.body) {
        return req.body;
      }
      return new Promise<string>((resolve) => {
        let body = "";
        req.setEncoding("utf-8");
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => resolve(body));
      });
    },
    raw: req,
    context: { res },
  };
};

const handleFunc = <Context extends OperationContext = undefined>(
  options: HandlerOptions<Context>
): Handler => {
  const handle = createHandler(options);
  return async (req, res) => {
    try {
      const [body, init] = await handle(toRequest(req, res));
      res.writeHead(init.status, init.statusText, init.headers).end(body);
    } catch (err) {
      if (err instanceof GraphQLError) {
        res
          .status(400)
          .json({ errors: [err] })
          .end();

        return;
      }

      res.writeHead(500).end();
    }
  };
};

const graphQLHandler = handleFunc({
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
