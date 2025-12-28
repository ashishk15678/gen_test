"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const ai_service_1 = require("./ai.service");
class ReviewService {
    static async review(octokit, owner, repo, pull_number) {
        const { data: diff } = await octokit.rest.pulls.get({
            owner,
            repo,
            pull_number,
            mediaType: {
                format: "diff",
            },
        });
        const aiService = new ai_service_1.AIService(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
        const review = await aiService.analyzeDiff(JSON.stringify(diff));
        return review;
    }
}
exports.ReviewService = ReviewService;
