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
});
