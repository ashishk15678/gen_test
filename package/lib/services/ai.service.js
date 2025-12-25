"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const ai_1 = require("ai");
const google_1 = require("@ai-sdk/google");
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
        prompt:
          "You are an expert code reviewer. Please review the following code changes (diff).\\n" +
          "Focus on:\\n" +
          "1. Potential bugs or errors.\\n" +
          "2. Security vulnerabilities.\\n" +
          "3. Code quality and best practices.\\n" +
          "4. Performance improvements.\\n\\n" +
          "Provide your review in a clear markdown format with the following structure:\\n" +
          "## 🐰 CodeRabbit AI Review\\n\\n" +
          "### Summary\\n" +
          "[A brief summary of the changes]\\n\\n" +
          "### Key Findings\\n" +
          "- [Finding 1]\\n" +
          "- [Finding 2]\\n\\n" +
          "### Detailed Review\\n" +
          "[Detailed comments, using code blocks if necessary]\\n\\n" +
          "If the code looks good, just say 'LGTM! 🚀' and provide a very brief summary.\\n\\n" +
          "Diff:\\n" +
          diff,
      });
      return result.text;
    } catch (error) {
      console.error("Error generating AI review:", error);
      return "I was unable to generate a review at this time due to an internal error.";
    }
  }
  async reviewPR(prDetails) {
    return this.analyzeDiff(prDetails.diff_url || "");
  }
}
exports.AIService = AIService;
