import "dotenv/config";
import express from "express";
import { App } from "octokit";
import { createNodeMiddleware } from "@octokit/webhooks";
import { PullRequestHandler } from "./handlers/pull-request.handler";

const app = new App({
  appId: process.env.APP_ID!,
  privateKey: process.env.PRIVATE_KEY!,
  oauth: {
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
  },
  webhooks: {
    secret: process.env.WEBHOOK_SECRET!,
  },
});

const port = process.env.PORT || 3000;
const server = express();

// Set up webhook middleware
server.use(createNodeMiddleware(app.webhooks, { path: "/" }));

// Register event listeners
app.webhooks.on(
  ["pull_request.opened", "pull_request.synchronize", "pull_request.reopened"],
  async ({ octokit, payload }) => {
    await PullRequestHandler.handle(octokit, payload);
  }
);

app.webhooks.onError((error) => {
  if (error instanceof Error && error.name === "AggregateError") {
    console.error(`Error processing request: ${error}`);
  } else {
    console.error(error);
  }
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
