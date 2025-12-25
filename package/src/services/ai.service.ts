import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import {
  REVIEW_SYSTEM_PROMPT,
  // generateReviewPrompt
} from "../prompts";

export class AIService {
  constructor(private apiKey?: string) {}

  async analyzeDiff(diff: string): Promise<string> {
    if (!diff) {
      return "No changes detected.";
    }

    try {
      const result = await generateText({
        model: google("gemini-1.5-flash"),
        system: REVIEW_SYSTEM_PROMPT,
        prompt: (await this.reviewPR(diff)).toString(),
      });

      return result.text;
    } catch (error) {
      console.error("Error generating AI review:", error);
      return "I was unable to generate a review at this time due to an internal error.";
    }
  }

  async reviewPR(prDetails: any): Promise<string> {
    return this.analyzeDiff(prDetails.diff_url || "");
  }
}
