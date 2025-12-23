"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestHandler = void 0;
const config_service_1 = require("../services/config.service");
const ai_service_1 = require("../services/ai.service");
class PullRequestHandler {
    static async handle(context) {
        const logger = context.log;
        logger.info("Handling pull request event...");
        const config = await config_service_1.ConfigService.loadConfig(context);
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
            const aiService = new ai_service_1.AIService(process.env.OPENAI_API_KEY || "dummy-key");
            const reviewComment = await aiService.reviewPR(pr);
            const issueComment = context.issue({
                body: reviewComment,
            });
            await context.octokit.issues.createComment(issueComment);
            logger.info("Posted review comment on PR.");
        }
    }
}
exports.PullRequestHandler = PullRequestHandler;
