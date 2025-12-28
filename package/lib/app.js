"use strict";
require("dotenv/config");
const pull_request_handler_1 = require("./handlers/pull-request.handler");
module.exports = (app) => {
    app.log.info("Rabbit Bot app loaded!");
    app.on([
        "pull_request.opened",
        "pull_request.synchronize",
        "pull_request.reopened",
    ], async (context) => {
        await pull_request_handler_1.PullRequestHandler.handle(context);
    });
    app.onAny(async (context) => {
        app.log.info(`Received event: ${context.name}`);
    });
    app.onError(async (error) => {
        app.log.error(error);
    });
    // Future: Add IssueHandler here
    // app.on("issues.opened", IssueHandler.handle);
};
