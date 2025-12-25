import { Context } from "probot";
import { AIService } from "./ai.service";

export class ReviewService {
  static async review(context: Context<"pull_request">): Promise<string> {
    const pr = context.payload.pull_request;

    const { data: diff } = await context.octokit.pulls.get({
      owner: context.repo().owner,
      repo: context.repo().repo,
      pull_number: pr.number,
      mediaType: {
        format: "diff",
      },
    });

    const aiService = new AIService(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    const review = await aiService.analyzeDiff(JSON.stringify(diff));
    return review;
  }
}
