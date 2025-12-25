import "dotenv/config";
import { Probot } from "probot";
import { PullRequestHandler } from "./handlers/pull-request.handler";

export = (app: Probot) => {
  app.log.info("Rabbit Bot app loaded!");

  app.on(["pull_request.opened", "pull_request.synchronize", "pull_request.reopened"], async (context) => {
      await PullRequestHandler.handle(context);
  });
  
  // Future: Add IssueHandler here
  // app.on("issues.opened", IssueHandler.handle);
};
