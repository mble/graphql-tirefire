import express from "express"
import morgan from "morgan"
import { createHandler } from "graphql-http/lib/use/express"
import { schema } from "./schema"

const root = {
    hello: () => "Hello, world!"
}

const app = express()

app.use(morgan("common"))
app.use("/graphql", createHandler({ schema, rootValue: root }))
app.listen(3000, () => console.log("Server running on port 3000"))
