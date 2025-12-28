import { Octokit } from "octokit";
import { AIService } from "./ai.service";

export class ReviewService {
  static async review(
    octokit: Octokit,
    owner: string,
    repo: string,
    pull_number: number
  ): Promise<string> {
    const { data: diff } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: {
        format: "diff",
      },
    });

    const aiService = new AIService(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    const review = await aiService.analyzeDiff(JSON.stringify(diff));
    return review;
  }
}
