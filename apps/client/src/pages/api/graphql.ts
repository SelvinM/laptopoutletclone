import { ApolloServer } from "apollo-server-micro";
import schema from "../../libs/graphql/schema";
import serverContextMiddleware from "../../utils/serverContextMiddleware";
import { dbConnect } from "@laptopoutlet-packages/utils";
import { IncomingMessage, ServerResponse } from "http";
const cors = require("micro-cors")({});

dbConnect();

const apolloServer = new ApolloServer({
	schema,
	context: serverContextMiddleware,
});

export const config = {
	api: {
		bodyParser: false,
	},
};
const handler = apolloServer.createHandler({ path: "/api/graphql" });

export default cors((req: IncomingMessage, res: ServerResponse) =>
	req.method === "OPTIONS" ? res.end() : handler(req, res)
);
