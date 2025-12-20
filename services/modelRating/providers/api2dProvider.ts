/**
 * Провайдер: API2D (НЕОФИЦИАЛЬНЫЙ)
 * ⚠️ Реселлер, используйте на свой риск
 * 
 * ВСЕ модели из Artificial Analysis LEADERBOARD (декабрь 2025)
 * 53 LLM/Code/Vision модели
 */

import { UnifiedModel, ProviderModelsResult } from '../types';

// ВСЕ 53 LLM/Code/Vision модели из LEADERBOARD
const CURATED_MODELS: UnifiedModel[] = [
  // === TOP LLM (📝) ===
  { id: 'api2d:gemini-3-pro', name: 'Gemini 3 Pro', providerId: 'api2d', providerModelId: 'gemini-3-pro', category: 'text', elo: 1490, contextLength: 1000000, pricing: { inputPerM: 2.0, outputPerM: 8.0 } },
  { id: 'api2d:claude-opus-4.5-thinking', name: 'Claude Opus 4.5 (thinking)', providerId: 'api2d', providerModelId: 'claude-opus-4.5-thinking-32k', category: 'text', elo: 1469, contextLength: 200000, pricing: { inputPerM: 10.0, outputPerM: 50.0 } },
  { id: 'api2d:grok-4.1-thinking', name: 'Grok-4.1 Thinking', providerId: 'api2d', providerModelId: 'grok-4.1-thinking', category: 'text', elo: 1477, contextLength: 128000, pricing: { inputPerM: 3.0, outputPerM: 12.0 } },
  { id: 'api2d:gemini-3-flash', name: 'Gemini 3 Flash', providerId: 'api2d', providerModelId: 'gemini-3-flash', category: 'text', elo: 1475, contextLength: 1000000, pricing: { inputPerM: 0.5, outputPerM: 2.0 } },
  { id: 'api2d:claude-opus-4.5', name: 'Claude Opus 4.5', providerId: 'api2d', providerModelId: 'claude-opus-4.5', category: 'text', elo: 1465, contextLength: 200000, pricing: { inputPerM: 10.0, outputPerM: 50.0 } },
  { id: 'api2d:grok-4.1', name: 'Grok-4.1', providerId: 'api2d', providerModelId: 'grok-4.1', category: 'text', elo: 1465, contextLength: 128000, pricing: { inputPerM: 3.0, outputPerM: 12.0 } },
  { id: 'api2d:gemini-3-flash-thinking', name: 'Gemini 3 Flash (thinking)', providerId: 'api2d', providerModelId: 'gemini-3-flash-thinking', category: 'text', elo: 1463, contextLength: 1000000, pricing: { inputPerM: 0.5, outputPerM: 2.0 } },
  { id: 'api2d:gpt-5.1-high', name: 'GPT-5.1 High', providerId: 'api2d', providerModelId: 'gpt-5.1-high', category: 'text', elo: 1457, contextLength: 128000, pricing: { inputPerM: 5.0, outputPerM: 20.0 } },
  { id: 'api2d:gemini-2.5-pro', name: 'Gemini 2.5 Pro', providerId: 'api2d', providerModelId: 'gemini-2.5-pro', category: 'text', elo: 1451, contextLength: 1000000, pricing: { inputPerM: 1.5, outputPerM: 6.0 } },
  { id: 'api2d:claude-sonnet-4.5-thinking', name: 'Claude Sonnet 4.5 (thinking)', providerId: 'api2d', providerModelId: 'claude-sonnet-4.5-thinking-32k', category: 'text', elo: 1450, contextLength: 200000, pricing: { inputPerM: 2.0, outputPerM: 10.0 } },
  { id: 'api2d:claude-opus-4.1-thinking', name: 'Claude Opus 4.1 (thinking)', providerId: 'api2d', providerModelId: 'claude-opus-4.1-thinking', category: 'text', elo: 1448, contextLength: 200000, pricing: { inputPerM: 8.0, outputPerM: 40.0 } },
  { id: 'api2d:claude-sonnet-4.5', name: 'Claude Sonnet 4.5', providerId: 'api2d', providerModelId: 'claude-sonnet-4.5', category: 'text', elo: 1446, contextLength: 200000, pricing: { inputPerM: 2.0, outputPerM: 10.0 } },
  { id: 'api2d:gpt-4.5-preview', name: 'GPT-4.5 Preview', providerId: 'api2d', providerModelId: 'gpt-4.5-preview', category: 'text', elo: 1442, contextLength: 128000, pricing: { inputPerM: 4.0, outputPerM: 16.0 } },
  { id: 'api2d:gpt-5.2', name: 'GPT-5.2', providerId: 'api2d', providerModelId: 'gpt-5.2', category: 'text', elo: 1442, contextLength: 400000, pricing: { inputPerM: 4.0, outputPerM: 16.0 } },
  { id: 'api2d:claude-opus-4.1', name: 'Claude Opus 4.1', providerId: 'api2d', providerModelId: 'claude-opus-4.1', category: 'text', elo: 1440, contextLength: 200000, pricing: { inputPerM: 8.0, outputPerM: 40.0 } },
  { id: 'api2d:gpt-4o-latest', name: 'ChatGPT-4o Latest', providerId: 'api2d', providerModelId: 'gpt-4o-latest', category: 'multimodal', elo: 1440, contextLength: 128000, pricing: { inputPerM: 1.5, outputPerM: 6.0 } },
  { id: 'api2d:gpt-5.2-high', name: 'GPT-5.2 High', providerId: 'api2d', providerModelId: 'gpt-5.2-high', category: 'text', elo: 1440, contextLength: 400000, pricing: { inputPerM: 5.0, outputPerM: 20.0 } },
  { id: 'api2d:gpt-5.1', name: 'GPT-5.1', providerId: 'api2d', providerModelId: 'gpt-5.1', category: 'text', elo: 1437, contextLength: 128000, pricing: { inputPerM: 4.0, outputPerM: 16.0 } },
  { id: 'api2d:gpt-5-high', name: 'GPT-5 High', providerId: 'api2d', providerModelId: 'gpt-5-high', category: 'text', elo: 1436, contextLength: 128000, pricing: { inputPerM: 5.0, outputPerM: 20.0 } },
  { id: 'api2d:o3', name: 'o3', providerId: 'api2d', providerModelId: 'o3', category: 'text', elo: 1434, contextLength: 128000, pricing: { inputPerM: 10.0, outputPerM: 40.0 } },
  { id: 'api2d:qwen3-max-preview', name: 'Qwen3 Max Preview', providerId: 'api2d', providerModelId: 'qwen3-max-preview', category: 'text', elo: 1433, contextLength: 128000, pricing: { inputPerM: 0.8, outputPerM: 3.0 } },
  { id: 'api2d:grok-4.1-fast', name: 'Grok-4.1 Fast Reasoning', providerId: 'api2d', providerModelId: 'grok-4.1-fast', category: 'text', elo: 1431, contextLength: 128000, pricing: { inputPerM: 1.5, outputPerM: 6.0 } },
  { id: 'api2d:kimi-k2-thinking', name: 'Kimi K2 Thinking Turbo', providerId: 'api2d', providerModelId: 'kimi-k2-thinking', category: 'text', elo: 1428, contextLength: 128000, pricing: { inputPerM: 1.0, outputPerM: 4.0 } },
  { id: 'api2d:ernie-5.0', name: 'ERNIE 5.0 Preview', providerId: 'api2d', providerModelId: 'ernie-5.0-preview', category: 'text', elo: 1427, contextLength: 128000, pricing: { inputPerM: 1.0, outputPerM: 4.0 } },
  { id: 'api2d:glm-4.6', name: 'GLM-4.6', providerId: 'api2d', providerModelId: 'glm-4.6', category: 'text', elo: 1425, contextLength: 128000, pricing: { inputPerM: 0.5, outputPerM: 2.0 } },
  { id: 'api2d:gpt-5-chat', name: 'GPT-5 Chat', providerId: 'api2d', providerModelId: 'gpt-5-chat', category: 'text', elo: 1425, contextLength: 128000, pricing: { inputPerM: 4.0, outputPerM: 16.0 } },
  { id: 'api2d:qwen3-max', name: 'Qwen3 Max', providerId: 'api2d', providerModelId: 'qwen3-max', category: 'text', elo: 1424, contextLength: 128000, pricing: { inputPerM: 0.8, outputPerM: 3.0 } },
  { id: 'api2d:deepseek-v3.2-exp', name: 'DeepSeek V3.2 Exp', providerId: 'api2d', providerModelId: 'deepseek-v3.2-exp', category: 'text', elo: 1423, contextLength: 64000, pricing: { inputPerM: 0.05, outputPerM: 0.15 } },
  { id: 'api2d:claude-opus-4-thinking', name: 'Claude Opus 4 (thinking)', providerId: 'api2d', providerModelId: 'claude-opus-4-thinking', category: 'text', elo: 1423, contextLength: 200000, pricing: { inputPerM: 8.0, outputPerM: 40.0 } },
  { id: 'api2d:deepseek-v3.2-thinking', name: 'DeepSeek V3.2 Thinking', providerId: 'api2d', providerModelId: 'deepseek-v3.2-thinking', category: 'text', elo: 1422, contextLength: 64000, pricing: { inputPerM: 0.05, outputPerM: 0.15 } },
  { id: 'api2d:qwen3-235b', name: 'Qwen3 235B A22B', providerId: 'api2d', providerModelId: 'qwen3-235b-a22b', category: 'text', elo: 1422, contextLength: 128000, pricing: { inputPerM: 0.8, outputPerM: 3.0 } },
  { id: 'api2d:deepseek-v3.2-exp-thinking', name: 'DeepSeek V3.2 Exp Thinking', providerId: 'api2d', providerModelId: 'deepseek-v3.2-exp-thinking', category: 'text', elo: 1421, contextLength: 64000, pricing: { inputPerM: 0.05, outputPerM: 0.15 } },
  { id: 'api2d:grok-4-fast', name: 'Grok-4 Fast Chat', providerId: 'api2d', providerModelId: 'grok-4-fast', category: 'text', elo: 1420, contextLength: 128000, pricing: { inputPerM: 1.5, outputPerM: 6.0 } },

  // === VISION / MULTIMODAL (🖼️) ===
  { id: 'api2d:gpt-4.1', name: 'GPT-4.1', providerId: 'api2d', providerModelId: 'gpt-4.1', category: 'multimodal', elo: 1215, contextLength: 128000, pricing: { inputPerM: 1.5, outputPerM: 6.0 } },
  { id: 'api2d:gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash Preview', providerId: 'api2d', providerModelId: 'gemini-2.5-flash-preview', category: 'multimodal', elo: 1224, contextLength: 1000000, pricing: { inputPerM: 0.3, outputPerM: 1.2 } },
  { id: 'api2d:gemini-2.5-flash', name: 'Gemini 2.5 Flash', providerId: 'api2d', providerModelId: 'gemini-2.5-flash', category: 'multimodal', elo: 1213, contextLength: 1000000, pricing: { inputPerM: 0.3, outputPerM: 1.2 } },
  { id: 'api2d:gpt-4.1-mini', name: 'GPT-4.1 Mini', providerId: 'api2d', providerModelId: 'gpt-4.1-mini', category: 'multimodal', elo: 1202, contextLength: 128000, pricing: { inputPerM: 0.1, outputPerM: 0.4 } },
  { id: 'api2d:qwen3-vl-235b', name: 'Qwen3 VL 235B', providerId: 'api2d', providerModelId: 'qwen3-vl-235b', category: 'multimodal', elo: 1209, contextLength: 128000, pricing: { inputPerM: 0.8, outputPerM: 3.0 } },
  { id: 'api2d:ernie-5.0-vision', name: 'ERNIE 5.0 Preview Vision', providerId: 'api2d', providerModelId: 'ernie-5.0-vision', category: 'multimodal', elo: 1206, contextLength: 128000, pricing: { inputPerM: 1.0, outputPerM: 4.0 } },
  { id: 'api2d:claude-sonnet-4-thinking', name: 'Claude Sonnet 4 (thinking)', providerId: 'api2d', providerModelId: 'claude-sonnet-4-thinking', category: 'multimodal', elo: 1204, contextLength: 200000, pricing: { inputPerM: 2.0, outputPerM: 10.0 } },

  // === CODE (💻) ===
  { id: 'api2d:claude-opus-4.5-code', name: 'Claude Opus 4.5 (Code)', providerId: 'api2d', providerModelId: 'claude-opus-4.5', category: 'coding', elo: 1518, contextLength: 200000, pricing: { inputPerM: 10.0, outputPerM: 50.0 } },
  { id: 'api2d:gpt-5.2-high-code', name: 'GPT-5.2 High (Code)', providerId: 'api2d', providerModelId: 'gpt-5.2-high', category: 'coding', elo: 1485, contextLength: 400000, pricing: { inputPerM: 5.0, outputPerM: 20.0 } },
  { id: 'api2d:gemini-3-pro-code', name: 'Gemini 3 Pro (Code)', providerId: 'api2d', providerModelId: 'gemini-3-pro', category: 'coding', elo: 1481, contextLength: 1000000, pricing: { inputPerM: 2.0, outputPerM: 8.0 } },
  { id: 'api2d:gemini-3-flash-code', name: 'Gemini 3 Flash (Code)', providerId: 'api2d', providerModelId: 'gemini-3-flash', category: 'coding', elo: 1465, contextLength: 1000000, pricing: { inputPerM: 0.5, outputPerM: 2.0 } },
  { id: 'api2d:gpt-5.2-code', name: 'GPT-5.2 (Code)', providerId: 'api2d', providerModelId: 'gpt-5.2', category: 'coding', elo: 1399, contextLength: 400000, pricing: { inputPerM: 4.0, outputPerM: 16.0 } },
  { id: 'api2d:gpt-5-medium-code', name: 'GPT-5 Medium (Code)', providerId: 'api2d', providerModelId: 'gpt-5-medium', category: 'coding', elo: 1399, contextLength: 128000, pricing: { inputPerM: 3.0, outputPerM: 12.0 } },
  { id: 'api2d:claude-sonnet-4.5-code', name: 'Claude Sonnet 4.5 (Code)', providerId: 'api2d', providerModelId: 'claude-sonnet-4.5', category: 'coding', elo: 1393, contextLength: 200000, pricing: { inputPerM: 2.0, outputPerM: 10.0 } },
  { id: 'api2d:claude-opus-4.1-code', name: 'Claude Opus 4.1 (Code)', providerId: 'api2d', providerModelId: 'claude-opus-4.1', category: 'coding', elo: 1392, contextLength: 200000, pricing: { inputPerM: 8.0, outputPerM: 40.0 } },
  { id: 'api2d:glm-4.6-code', name: 'GLM-4.6 (Code)', providerId: 'api2d', providerModelId: 'glm-4.6', category: 'coding', elo: 1368, contextLength: 128000, pricing: { inputPerM: 0.5, outputPerM: 2.0 } },
  { id: 'api2d:deepseek-v3.2-thinking-code', name: 'DeepSeek V3.2 Thinking (Code)', providerId: 'api2d', providerModelId: 'deepseek-v3.2-thinking', category: 'coding', elo: 1367, contextLength: 64000, pricing: { inputPerM: 0.05, outputPerM: 0.15 } },
  { id: 'api2d:gpt-5.1-code', name: 'GPT-5.1 (Code)', providerId: 'api2d', providerModelId: 'gpt-5.1', category: 'coding', elo: 1359, contextLength: 128000, pricing: { inputPerM: 4.0, outputPerM: 16.0 } },
  { id: 'api2d:kimi-k2-code', name: 'Kimi K2 (Code)', providerId: 'api2d', providerModelId: 'kimi-k2-thinking', category: 'coding', elo: 1345, contextLength: 128000, pricing: { inputPerM: 1.0, outputPerM: 4.0 } },
  { id: 'api2d:gpt-5.1-codex', name: 'GPT-5.1 Codex', providerId: 'api2d', providerModelId: 'gpt-5.1-codex', category: 'coding', elo: 1335, contextLength: 128000, pricing: { inputPerM: 4.0, outputPerM: 16.0 } },
  { id: 'api2d:minimax-m2', name: 'MiniMax M2', providerId: 'api2d', providerModelId: 'minimax-m2', category: 'coding', elo: 1317, contextLength: 128000, pricing: { inputPerM: 0.5, outputPerM: 2.0 } },
  { id: 'api2d:deepseek-v3.2-exp-code', name: 'DeepSeek V3.2 Exp (Code)', providerId: 'api2d', providerModelId: 'deepseek-v3.2-exp', category: 'coding', elo: 1294, contextLength: 64000, pricing: { inputPerM: 0.05, outputPerM: 0.15 } },
  { id: 'api2d:qwen3-coder-480b', name: 'Qwen3 Coder 480B', providerId: 'api2d', providerModelId: 'qwen3-coder-480b', category: 'coding', elo: 1291, contextLength: 128000, pricing: { inputPerM: 1.0, outputPerM: 4.0 } },
  { id: 'api2d:claude-haiku-4.5', name: 'Claude Haiku 4.5', providerId: 'api2d', providerModelId: 'claude-haiku-4.5', category: 'coding', elo: 1289, contextLength: 200000, pricing: { inputPerM: 0.5, outputPerM: 2.5 } },
  { id: 'api2d:deepseek-v3.2-code', name: 'DeepSeek V3.2 (Code)', providerId: 'api2d', providerModelId: 'deepseek-v3.2', category: 'coding', elo: 1286, contextLength: 64000, pricing: { inputPerM: 0.05, outputPerM: 0.15 } },
  { id: 'api2d:kat-coder-pro', name: 'KAT-Coder-Pro-V1', providerId: 'api2d', providerModelId: 'kat-coder-pro', category: 'coding', elo: 1264, contextLength: 64000, pricing: { inputPerM: 0.5, outputPerM: 2.0 } },
  { id: 'api2d:gpt-5.1-codex-mini', name: 'GPT-5.1 Codex Mini', providerId: 'api2d', providerModelId: 'gpt-5.1-codex-mini', category: 'coding', elo: 1252, contextLength: 128000, pricing: { inputPerM: 1.0, outputPerM: 4.0 } },
  { id: 'api2d:grok-4.1-fast-code', name: 'Grok-4.1 Fast (Code)', providerId: 'api2d', providerModelId: 'grok-4.1-fast', category: 'coding', elo: 1227, contextLength: 128000, pricing: { inputPerM: 1.5, outputPerM: 6.0 } },
  { id: 'api2d:mistral-large-3', name: 'Mistral Large 3', providerId: 'api2d', providerModelId: 'mistral-large-3', category: 'coding', elo: 1226, contextLength: 128000, pricing: { inputPerM: 1.5, outputPerM: 6.0 } },
  { id: 'api2d:gemini-2.5-pro-code', name: 'Gemini 2.5 Pro (Code)', providerId: 'api2d', providerModelId: 'gemini-2.5-pro', category: 'coding', elo: 1213, contextLength: 1000000, pricing: { inputPerM: 1.5, outputPerM: 6.0 } },
  { id: 'api2d:grok-4.1-thinking-code', name: 'Grok-4.1 Thinking (Code)', providerId: 'api2d', providerModelId: 'grok-4.1-thinking', category: 'coding', elo: 1206, contextLength: 128000, pricing: { inputPerM: 3.0, outputPerM: 12.0 } },
  { id: 'api2d:grok-4-fast-code', name: 'Grok-4 Fast (Code)', providerId: 'api2d', providerModelId: 'grok-4-fast', category: 'coding', elo: 1153, contextLength: 128000, pricing: { inputPerM: 1.5, outputPerM: 6.0 } },
  { id: 'api2d:grok-code-fast', name: 'Grok Code Fast 1', providerId: 'api2d', providerModelId: 'grok-code-fast', category: 'coding', elo: 1144, contextLength: 128000, pricing: { inputPerM: 1.0, outputPerM: 4.0 } },
  { id: 'api2d:devstral-medium', name: 'Devstral Medium', providerId: 'api2d', providerModelId: 'devstral-medium', category: 'coding', elo: 1103, contextLength: 128000, pricing: { inputPerM: 1.0, outputPerM: 4.0 } },
];

export const fetchApi2dModels = async (_apiKey?: string): Promise<ProviderModelsResult> => {
  return {
    providerId: 'api2d',
    models: CURATED_MODELS,
    lastUpdated: Date.now(),
  };
};
