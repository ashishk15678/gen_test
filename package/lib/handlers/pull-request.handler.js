"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestHandler = void 0;
const review_service_1 = require("../services/review.service");
class PullRequestHandler {
    static async handle(context) {
        const pr = context.payload.pull_request;
        context.log.info(`Received PR event for ${pr.html_url}`);
        if (pr.state !== "open") {
            return;
        }
        try {
            const review = await review_service_1.ReviewService.review(context);
            const prComment = context.issue({
                body: review,
            });
            await context.octokit.issues.createComment(prComment);
            context.log.info("Posted review comment");
        }
        catch (error) {
            context.log.error(error, "Failed to review PR");
        }
    }
}
exports.PullRequestHandler = PullRequestHandler;
