import { describe, expect, it } from "@jest/globals";
import { limitFieldsRule } from "../src/rules";
import { buildSchema, validate, parse } from "graphql";

describe("limitFieldsRule", () => {
  it("should be defined", () => {
    expect(limitFieldsRule).toBeDefined();

    limitFieldsRule();
    limitFieldsRule({});
    limitFieldsRule({ n: 1 });
  });

  const schema = buildSchema(`
    type Query {
      a: String
      b: String
      c: String
    }
  `);

  it("rejects a query with too many duplicate fields", () => {
    const query = `
      query {
        a
        a
        a
      }
    `;

    expect(() =>
      validate(schema, parse(query), [limitFieldsRule({ n: 1 })])
    ).toThrow("Max duplicate fields exceeded: 1");
  });

  it("accepts a query with the correct number of duplicate fields", () => {
    const query = `
      query {
        a
        a
        b
      }
    `;

    expect(() =>
      validate(schema, parse(query), [limitFieldsRule({ n: 2 })])
    ).not.toThrow();
  });

  it("supresses the error message when exposeLimits is false", () => {
    const query = `
      query {
        a
        a
        a
      }
    `;

    expect(() =>
      validate(schema, parse(query), [
        limitFieldsRule({ n: 1, exposeLimits: false }),
      ])
    ).toThrow("Query validation error.");
  });
});
