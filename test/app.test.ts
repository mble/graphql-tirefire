import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app";

describe("app", () => {
  it("should return 200", async () => {
    const response = await request(app)
      .post("/graphql")
      .send({ query: "{ __typename }" });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { __typename: "ListWidgets" } });
  });

  it("should return errors when introspecting schema", async () => {
    const response = await request(app)
      .post("/graphql")
      .send({ query: "{ __schema { types { name } } }" });
    expect(response.status).toBe(200);
    expect(response.body.errors).toHaveLength(2);
    expect(response.body.errors[0].message).toMatch(
      /GraphQL introspection has been disabled/
    );
  });

  it("should return a 400 when exceeding the field limit", async () => {
    const response = await request(app)
      .post("/graphql")
      .send({ query: "{ a a a }" });
    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toMatch(/Query validation error/);
  });

  it("should return a 400 when exceeding the alias limit", async () => {
    const response = await request(app)
      .post("/graphql")
      .send({ query: "{ a: a b: b c: c d: d e: e f: f }" });
    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toMatch(/Query validation error/);
  });

  it("should return a 400 when exceeding the directives limit", async () => {
    const response = await request(app)
      .post("/graphql")
      .send({ query: "{ __typename @a@a@a@a@a@a@a@a }" });
    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toMatch(/Query validation error/);
  });
});
