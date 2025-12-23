import { Context } from "probot";
import { ConfigService } from "../services/config.service";
import { AIService } from "../services/ai.service";

export class PullRequestHandler {
  static async handle(context: Context<"pull_request">) {
    const logger = context.log;
    logger.info("Handling pull request event...");

    const config = await ConfigService.loadConfig(context);
    if (!config.enableReviews) {
      logger.info("Reviews are disabled in config. Skipping.");
      return;
    }

    const pr = context.payload.pull_request;
    
    // Check if PR is opened or synchronized (updated)
    if (["opened", "synchronize", "reopened"].includes(context.payload.action)) {
       // In a real app, you might want to fetch the diff here
       // const diff = await context.octokit.pulls.get({ ...context.repo(), pull_number: pr.number, mediaType: { format: "diff" } });

       // Initializing AI Service (ApiKey would come from env or secrets)
       const aiService = new AIService(process.env.OPENAI_API_KEY || "dummy-key");
       
       const reviewComment = await aiService.reviewPR(pr);

       const issueComment = context.issue({
         body: reviewComment,
       });

       await context.octokit.issues.createComment(issueComment);
       logger.info("Posted review comment on PR.");
    }
  }
}
