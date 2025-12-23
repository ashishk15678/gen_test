"use strict";
const pull_request_handler_1 = require("./handlers/pull-request.handler");
module.exports = (app) => {
    app.log.info("Rabbit Bot app loaded!");
    app.on(["pull_request.opened", "pull_request.synchronize", "pull_request.reopened"], async (context) => {
        await pull_request_handler_1.PullRequestHandler.handle(context);
    });
    // Future: Add IssueHandler here
    // app.on("issues.opened", IssueHandler.handle);
};
