import { Octokit } from "octokit";
import * as yaml from "js-yaml";

export interface BotConfig {
  aiModel: string;
  enableReviews: boolean;
  enableChat: boolean;
}

const DEFAULT_CONFIG: BotConfig = {
  aiModel: "gemini-1.5-flash",
  enableReviews: true,
  enableChat: true,
};

export class ConfigService {
  static async loadConfig(
    octokit: Octokit,
    owner: string,
    repo: string
  ): Promise<BotConfig> {
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: ".github/rabbit.yml",
      });

      if ("content" in data && typeof data.content === "string") {
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        const config = yaml.load(content) as Partial<BotConfig>;
        return { ...DEFAULT_CONFIG, ...config };
      }
      return DEFAULT_CONFIG;
    } catch (error) {
      console.warn("Failed to load config, using defaults.");
      return DEFAULT_CONFIG;
    }
  }
}
