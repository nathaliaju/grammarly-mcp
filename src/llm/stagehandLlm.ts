import type { AISdkClient } from "@browserbasehq/stagehand";
import type { AppConfig, LLMProvider } from "../config";
import { log } from "../config";

export type { LLMProvider };

/**
 * Detect which LLM provider to use for Stagehand based on config.
 * Priority: explicit STAGEHAND_LLM_PROVIDER > API key detection > claude-code
 *
 * Uses config fields instead of process.env to respect IGNORE_SYSTEM_ENV.
 */
export function detectLlmProvider(config: AppConfig): LLMProvider {
  // Priority 1: Explicit Stagehand provider selection (highest priority)
  if (config.stagehandLlmProvider) {
    log(
      "debug",
      `Using explicitly configured Stagehand LLM provider: ${config.stagehandLlmProvider}`,
    );
    return config.stagehandLlmProvider;
  }

  // Priority 2: Auto-detection from API keys via config (respects IGNORE_SYSTEM_ENV)
  if (config.openaiApiKey) {
    return "openai";
  }
  if (config.googleApiKey) {
    return "google";
  }
  if (config.anthropicApiKey || config.claudeApiKey) {
    return "anthropic";
  }

  // Default to Claude Code CLI auth (no API key required)
  return "claude-code";
}

/**
 * Create a Stagehand-compatible LLM client based on detected or preferred provider.
 *
 * Note: This uses dynamic imports to support the AISdkClient from @browserbasehq/stagehand
 * and the various AI SDK providers.
 */
export async function createStagehandLlmClient(
  config: AppConfig,
  preferredProvider?: LLMProvider,
): Promise<AISdkClient> {
  const provider = preferredProvider ?? detectLlmProvider(config);

  log("debug", `Creating Stagehand LLM client with provider: ${provider}`);

  // Dynamic import to avoid bundling issues
  const { AISdkClient } = await import("@browserbasehq/stagehand");

  switch (provider) {
    case "claude-code": {
      // Primary: ai-sdk-provider-claude-code (Pro/Max subscription via CLI)
      const { claudeCode } = await import("ai-sdk-provider-claude-code");
      const modelId =
        config.claudeModel === "auto" ? "sonnet" : config.claudeModel;
      return new AISdkClient({ model: claudeCode(modelId) });
    }

    case "openai": {
      const { openai } = await import("@ai-sdk/openai");
      return new AISdkClient({ model: openai(config.openaiModel) });
    }

    case "anthropic": {
      const { anthropic } = await import("@ai-sdk/anthropic");
      return new AISdkClient({
        model: anthropic("claude-sonnet-4-20250514"),
      });
    }

    case "google": {
      const { google } = await import("@ai-sdk/google");
      return new AISdkClient({ model: google(config.googleModel) });
    }

    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

/**
 * Get the model name for logging/debugging purposes.
 */
export function getLlmModelName(
  config: AppConfig,
  provider?: LLMProvider,
): string {
  const actualProvider = provider ?? detectLlmProvider(config);

  switch (actualProvider) {
    case "claude-code":
      return `claude-code/${config.claudeModel === "auto" ? "sonnet" : config.claudeModel}`;
    case "openai":
      return config.openaiModel;
    case "anthropic":
      return "claude-sonnet-4-20250514";
    case "google":
      return config.googleModel;
    default:
      return "unknown";
  }
}
