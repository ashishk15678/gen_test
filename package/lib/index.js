"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const octokit_1 = require("octokit");
const webhooks_1 = require("@octokit/webhooks");
const pull_request_handler_1 = require("./handlers/pull-request.handler");
const app = new octokit_1.App({
    appId: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    oauth: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    },
    webhooks: {
        secret: process.env.WEBHOOK_SECRET,
    },
});
const port = process.env.PORT || 3000;
const server = (0, express_1.default)();
// Set up webhook middleware
server.use((0, webhooks_1.createNodeMiddleware)(app.webhooks, { path: "/api/github/webhooks" }));
// Register event listeners
app.webhooks.on(["pull_request.opened", "pull_request.synchronize", "pull_request.reopened"], async ({ octokit, payload }) => {
    await pull_request_handler_1.PullRequestHandler.handle(octokit, payload);
});
app.webhooks.onError((error) => {
    if (error instanceof Error && error.name === "AggregateError") {
        console.error(`Error processing request: ${error}`);
    }
    else {
        console.error(error);
    }
});
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
