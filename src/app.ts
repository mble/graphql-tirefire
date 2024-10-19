import express from "express";
import bodyParser from "body-parser";

import { graphQLHandler } from "./handler";

const app = express();

app.use(bodyParser.json({ limit: "64kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "64kb" }));
app.post("/graphql", graphQLHandler);

export { app };
