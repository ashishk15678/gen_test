import { Context } from "probot";

export interface BotConfig {
  aiModel: string;
  enableReviews: boolean;
  enableChat: boolean;
}

const DEFAULT_CONFIG: BotConfig = {
  aiModel: "gpt-4",
  enableReviews: true,
  enableChat: true,
};

export class ConfigService {
  static async loadConfig(context: Context): Promise<BotConfig> {
    try {
      // Allow loading from .github/rabbit.yml
      const config = await context.config<BotConfig>("rabbit.yml");
      return { ...DEFAULT_CONFIG, ...config };
    } catch (error) {
      context.log.warn("Failed to load config, using defaults.");
      return DEFAULT_CONFIG;
    }
  }
}
