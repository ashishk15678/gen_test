"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const DEFAULT_CONFIG = {
    aiModel: "gpt-4",
    enableReviews: true,
    enableChat: true,
};
class ConfigService {
    static async loadConfig(context) {
        try {
            // Allow loading from .github/rabbit.yml
            const config = await context.config("rabbit.yml");
            return { ...DEFAULT_CONFIG, ...config };
        }
        catch (error) {
            context.log.warn("Failed to load config, using defaults.");
            return DEFAULT_CONFIG;
        }
    }
}
exports.ConfigService = ConfigService;
