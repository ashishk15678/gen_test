import { Context } from "probot";
import { ReviewService } from "../services/review.service";

export class PullRequestHandler {
  async handle(context: Context<"pull_request">) {
    const pr = context.payload.pull_request;
    context.log.info(`Received PR event for ${pr.html_url}`);

    if (pr.state !== "open") {
      return;
    }

    try {
      const review = await ReviewService.review(context);

      const prComment = context.issue({
        body: review,
      });

      await context.octokit.issues.createComment(prComment);
      context.log.info("Posted review comment");
    } catch (error) {
      context.log.error(error, "Failed to review PR");
    }
  }
}
