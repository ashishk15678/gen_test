"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const ai_service_1 = require("./ai.service");
class ReviewService {
  static async review(context) {
    const pr = context.payload.pull_request;

    const { data: diff } = await context.octokit.pulls.get({
      owner: context.repo().owner,
      repo: context.repo().repo,
      pull_number: pr.number,
      mediaType: {
        format: "diff",
      },
    });
    const aiService = new ai_service_1.AIService(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    );
    const review = await aiService.analyzeDiff(diff);
    return review;
  }
}
exports.ReviewService = ReviewService;
