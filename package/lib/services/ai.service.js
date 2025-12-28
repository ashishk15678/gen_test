"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const ai_1 = require("ai");
const google_1 = require("@ai-sdk/google");
const prompts_1 = require("../prompts");
class AIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async analyzeDiff(diff) {
        if (!diff) {
            return "No changes detected.";
        }
        try {
            const result = await (0, ai_1.generateText)({
                model: (0, google_1.google)("gemini-1.5-flash"),
                system: prompts_1.REVIEW_SYSTEM_PROMPT,
                prompt: (await this.reviewPR(diff)).toString(),
            });
            return result.text;
        }
        catch (error) {
            console.error("Error generating AI review:", error);
            return "I was unable to generate a review at this time due to an internal error.";
        }
    }
    async reviewPR(prDetails) {
        return this.analyzeDiff(prDetails.diff_url || "");
    }
}
exports.AIService = AIService;
