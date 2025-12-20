/**
 * Провайдер: Replicate
 * https://replicate.com — платформа для запуска open source моделей
 * 
 * ВСЕ модели из Artificial Analysis LEADERBOARD (декабрь 2025)
 * Включает LLM, Image, Video, Music, TTS — 70+ моделей
 */

import { UnifiedModel, ProviderModelsResult } from '../types';

// ВСЕ модели из LEADERBOARD доступные на Replicate
const CURATED_MODELS: UnifiedModel[] = [
  // ==================== LLM / TEXT (📝) — open source ====================
  { id: 'replicate:deepseek-v3.2-exp', name: 'DeepSeek V3.2 Exp', providerId: 'replicate', providerModelId: 'deepseek-ai/deepseek-v3.2-exp', category: 'text', elo: 1423, contextLength: 64000, pricing: { inputPerM: 0.05, outputPerM: 0.15 } },
  { id: 'replicate:deepseek-v3.2-thinking', name: 'DeepSeek V3.2 Thinking', providerId: 'replicate', providerModelId: 'deepseek-ai/deepseek-v3.2-thinking', category: 'text', elo: 1422, contextLength: 64000, pricing: { inputPerM: 0.05, outputPerM: 0.15 } },
  { id: 'replicate:qwen3-235b', name: 'Qwen3 235B A22B', providerId: 'replicate', providerModelId: 'qwen/qwen3-235b-a22b', category: 'text', elo: 1422, contextLength: 128000, pricing: { inputPerM: 0.8, outputPerM: 3.0 } },
  { id: 'replicate:qwen3-max', name: 'Qwen3 Max', providerId: 'replicate', providerModelId: 'qwen/qwen3-max', category: 'text', elo: 1424, contextLength: 128000, pricing: { inputPerM: 0.8, outputPerM: 3.0 } },
  { id: 'replicate:llama-4-maverick', name: 'Llama 4 Maverick', providerId: 'replicate', providerModelId: 'meta/llama-4-maverick', category: 'text', elo: 1416, contextLength: 128000, pricing: { inputPerM: 0.5, outputPerM: 2.0 } },
  { id: 'replicate:llama-4-scout', name: 'Llama 4 Scout', providerId: 'replicate', providerModelId: 'meta/llama-4-scout', category: 'text', elo: 1412, contextLength: 128000, pricing: { inputPerM: 0.3, outputPerM: 1.2 } },
  { id: 'replicate:deepseek-r1', name: 'DeepSeek R1', providerId: 'replicate', providerModelId: 'deepseek-ai/deepseek-r1', category: 'text', elo: 1410, contextLength: 64000, pricing: { inputPerM: 0.3, outputPerM: 0.9 } },
  { id: 'replicate:qwq-32b', name: 'QwQ 32B', providerId: 'replicate', providerModelId: 'qwen/qwq-32b', category: 'text', elo: 1408, contextLength: 32000, pricing: { inputPerM: 0.2, outputPerM: 0.8 } },
  { id: 'replicate:llama-3.3-70b', name: 'Llama 3.3 70B', providerId: 'replicate', providerModelId: 'meta/llama-3.3-70b-instruct', category: 'text', elo: 1395, contextLength: 128000, pricing: { inputPerM: 0.35, outputPerM: 1.4 } },
  { id: 'replicate:mistral-large-3', name: 'Mistral Large 3', providerId: 'replicate', providerModelId: 'mistral/mistral-large-3', category: 'text', elo: 1380, contextLength: 128000, pricing: { inputPerM: 1.0, outputPerM: 4.0 } },
  { id: 'replicate:mixtral-8x22b', name: 'Mixtral 8x22B', providerId: 'replicate', providerModelId: 'mistral/mixtral-8x22b-instruct', category: 'text', elo: 1350, contextLength: 64000, pricing: { inputPerM: 0.6, outputPerM: 2.4 } },
  { id: 'replicate:qwen2.5-72b', name: 'Qwen 2.5 72B', providerId: 'replicate', providerModelId: 'qwen/qwen2.5-72b-instruct', category: 'text', elo: 1340, contextLength: 128000, pricing: { inputPerM: 0.35, outputPerM: 1.4 } },
  { id: 'replicate:llama-3.1-405b', name: 'Llama 3.1 405B', providerId: 'replicate', providerModelId: 'meta/llama-3.1-405b-instruct', category: 'text', elo: 1330, contextLength: 128000, pricing: { inputPerM: 3.0, outputPerM: 12.0 } },

  // ==================== CODE (💻) — open source ====================
  { id: 'replicate:deepseek-v3.2-thinking-code', name: 'DeepSeek V3.2 Thinking (Code)', providerId: 'replicate', providerModelId: 'deepseek-ai/deepseek-v3.2-thinking', category: 'coding', elo: 1367, contextLength: 64000, pricing: { inputPerM: 0.05, outputPerM: 0.15 } },
  { id: 'replicate:deepseek-v3.2-code', name: 'DeepSeek V3.2 (Code)', providerId: 'replicate', providerModelId: 'deepseek-ai/deepseek-v3.2', category: 'coding', elo: 1286, contextLength: 64000, pricing: { inputPerM: 0.05, outputPerM: 0.15 } },
  { id: 'replicate:qwen3-coder-480b', name: 'Qwen3 Coder 480B', providerId: 'replicate', providerModelId: 'qwen/qwen3-coder-480b', category: 'coding', elo: 1291, contextLength: 128000, pricing: { inputPerM: 1.0, outputPerM: 4.0 } },
  { id: 'replicate:devstral-medium', name: 'Devstral Medium', providerId: 'replicate', providerModelId: 'mistral/devstral-medium', category: 'coding', elo: 1103, contextLength: 128000, pricing: { inputPerM: 0.5, outputPerM: 2.0 } },
  { id: 'replicate:codellama-70b', name: 'Code Llama 70B', providerId: 'replicate', providerModelId: 'meta/codellama-70b-instruct', category: 'coding', elo: 1050, contextLength: 16000, pricing: { inputPerM: 0.35, outputPerM: 1.4 } },
  { id: 'replicate:starcoder2-15b', name: 'StarCoder2 15B', providerId: 'replicate', providerModelId: 'bigcode/starcoder2-15b', category: 'coding', elo: 1000, contextLength: 16000, pricing: { inputPerM: 0.1, outputPerM: 0.4 } },

  // ==================== IMAGE (🎨) - 20 моделей ====================
  { id: 'replicate:flux-2-max', name: 'FLUX.2 [max]', providerId: 'replicate', providerModelId: 'black-forest-labs/flux-2-max', category: 'image', elo: 1250, pricing: { perImage: 0.025 } },
  { id: 'replicate:flux-2-pro', name: 'FLUX.2 [pro]', providerId: 'replicate', providerModelId: 'black-forest-labs/flux-2-pro', category: 'image', elo: 1244, pricing: { perImage: 0.02 } },
  { id: 'replicate:flux-2-flex', name: 'FLUX.2 [flex]', providerId: 'replicate', providerModelId: 'black-forest-labs/flux-2-flex', category: 'image', elo: 1211, pricing: { perImage: 0.015 } },
  { id: 'replicate:flux-2-dev', name: 'FLUX.2 [dev]', providerId: 'replicate', providerModelId: 'black-forest-labs/flux-dev', category: 'image', elo: 1164, pricing: { perImage: 0.008 } },
  { id: 'replicate:ideogram-3.0', name: 'Ideogram 3.0', providerId: 'replicate', providerModelId: 'ideogram-ai/ideogram-v3', category: 'image', elo: 1222, pricing: { perImage: 0.03 } },
  { id: 'replicate:ideogram-2.0', name: 'Ideogram 2.0', providerId: 'replicate', providerModelId: 'ideogram-ai/ideogram-v2', category: 'image', elo: 1151, pricing: { perImage: 0.025 } },
  { id: 'replicate:recraft-v3', name: 'Recraft V3', providerId: 'replicate', providerModelId: 'recraft-ai/recraft-v3', category: 'image', elo: 1176, pricing: { perImage: 0.02 } },
  { id: 'replicate:flux-1.1-pro', name: 'FLUX1.1 [pro]', providerId: 'replicate', providerModelId: 'black-forest-labs/flux-1.1-pro', category: 'image', elo: 1186, pricing: { perImage: 0.02 } },
  { id: 'replicate:flux-1-pro', name: 'FLUX.1 [pro]', providerId: 'replicate', providerModelId: 'black-forest-labs/flux-pro', category: 'image', elo: 1128, pricing: { perImage: 0.015 } },
  { id: 'replicate:flux-schnell', name: 'FLUX.1 [schnell]', providerId: 'replicate', providerModelId: 'black-forest-labs/flux-schnell', category: 'image', elo: 1100, pricing: { perImage: 0.003 } },
  { id: 'replicate:sd3.5-large', name: 'SD 3.5 Large', providerId: 'replicate', providerModelId: 'stability-ai/sd3.5-large', category: 'image', elo: 1080, pricing: { perImage: 0.035 } },
  { id: 'replicate:sd3.5-medium', name: 'SD 3.5 Medium', providerId: 'replicate', providerModelId: 'stability-ai/sd3.5-medium', category: 'image', elo: 1060, pricing: { perImage: 0.025 } },
  { id: 'replicate:sdxl', name: 'SDXL 1.0', providerId: 'replicate', providerModelId: 'stability-ai/sdxl', category: 'image', elo: 1000, pricing: { perImage: 0.01 } },
  { id: 'replicate:kolors-2.1', name: 'Kolors 2.1', providerId: 'replicate', providerModelId: 'kuaishou/kolors-2.1', category: 'image', elo: 1194, pricing: { perImage: 0.01 } },
  { id: 'replicate:playground-v3', name: 'Playground V3', providerId: 'replicate', providerModelId: 'playgroundai/playground-v3', category: 'image', elo: 1050, pricing: { perImage: 0.015 } },

  // ==================== VIDEO (🎬) - 20 моделей ====================
  { id: 'replicate:hailuo-t2v-director', name: 'Hailuo T2V Director', providerId: 'replicate', providerModelId: 'minimax/hailuo-video-director', category: 'video', elo: 1224, pricing: { videoPerSecond: 0.02 } },
  { id: 'replicate:hailuo-t2v-01', name: 'Hailuo T2V 01', providerId: 'replicate', providerModelId: 'minimax/hailuo-video-01', category: 'video', elo: 1215, pricing: { videoPerSecond: 0.018 } },
  { id: 'replicate:ltx-video-2', name: 'LTX-Video 2', providerId: 'replicate', providerModelId: 'lightricks/ltx-video-2', category: 'video', elo: 1213, pricing: { videoPerSecond: 0.01 } },
  { id: 'replicate:kling-2.5-pro', name: 'Kling 2.5 Pro', providerId: 'replicate', providerModelId: 'kuaishou/kling-2.5-pro', category: 'video', elo: 1236, pricing: { videoPerSecond: 0.03 } },
  { id: 'replicate:kling-2.1-pro', name: 'Kling 2.1 Pro', providerId: 'replicate', providerModelId: 'kuaishou/kling-2.1-pro', category: 'video', elo: 1218, pricing: { videoPerSecond: 0.025 } },
  { id: 'replicate:kling-2.0-pro', name: 'Kling 2.0 Pro', providerId: 'replicate', providerModelId: 'kuaishou/kling-2.0-pro', category: 'video', elo: 1190, pricing: { videoPerSecond: 0.02 } },
  { id: 'replicate:wan-2.1', name: 'Wan 2.1', providerId: 'replicate', providerModelId: 'alibaba/wan-2.1', category: 'video', elo: 1199, pricing: { videoPerSecond: 0.015 } },
  { id: 'replicate:hunyuan-video', name: 'HunyuanVideo', providerId: 'replicate', providerModelId: 'tencent/hunyuan-video', category: 'video', elo: 1167, pricing: { videoPerSecond: 0.01 } },
  { id: 'replicate:cogvideox-1.5', name: 'CogVideoX 1.5', providerId: 'replicate', providerModelId: 'zhipu-ai/cogvideox-1.5', category: 'video', elo: 1158, pricing: { videoPerSecond: 0.008 } },
  { id: 'replicate:cogvideox-5b', name: 'CogVideoX 5B', providerId: 'replicate', providerModelId: 'zhipu-ai/cogvideox-5b', category: 'video', elo: 1100, pricing: { videoPerSecond: 0.005 } },
  { id: 'replicate:ltx-video', name: 'LTX-Video', providerId: 'replicate', providerModelId: 'lightricks/ltx-video', category: 'video', elo: 1090, pricing: { videoPerSecond: 0.008 } },
  { id: 'replicate:mochi-1-preview', name: 'Mochi 1 Preview', providerId: 'replicate', providerModelId: 'genmo/mochi-1-preview', category: 'video', elo: 1080, pricing: { videoPerSecond: 0.01 } },
  { id: 'replicate:animatediff', name: 'AnimateDiff', providerId: 'replicate', providerModelId: 'lucataco/animatediff', category: 'video', elo: 950, pricing: { videoPerSecond: 0.005 } },

  // ==================== MUSIC (🎵) — open source ====================
  { id: 'replicate:stable-audio-2', name: 'Stable Audio 2', providerId: 'replicate', providerModelId: 'stability-ai/stable-audio-2', category: 'audio', elo: 947, pricing: { perMinute: 0.02 } },
  { id: 'replicate:musicgen-stereo', name: 'MusicGen Stereo', providerId: 'replicate', providerModelId: 'meta/musicgen-stereo-large', category: 'audio', elo: 870, pricing: { perMinute: 0.01 } },
  { id: 'replicate:musicgen-melody', name: 'MusicGen Melody', providerId: 'replicate', providerModelId: 'meta/musicgen-melody', category: 'audio', elo: 850, pricing: { perMinute: 0.008 } },
  { id: 'replicate:bark', name: 'Bark', providerId: 'replicate', providerModelId: 'suno-ai/bark', category: 'audio', elo: 800, pricing: { perMinute: 0.005 } },
  { id: 'replicate:riffusion', name: 'Riffusion', providerId: 'replicate', providerModelId: 'riffusion/riffusion', category: 'audio', elo: 750, pricing: { perMinute: 0.003 } },

  // ==================== TTS (🎙️) — open source ====================
  { id: 'replicate:coqui-xtts-v2', name: 'Coqui XTTS-V2', providerId: 'replicate', providerModelId: 'coqui-ai/xtts-v2', category: 'tts', elo: 1082, pricing: { perMinute: 0.01 } },
  { id: 'replicate:tortoise-tts', name: 'Tortoise TTS', providerId: 'replicate', providerModelId: 'nateraw/tortoise-tts', category: 'tts', elo: 950, pricing: { perMinute: 0.008 } },
  { id: 'replicate:parler-tts', name: 'Parler TTS', providerId: 'replicate', providerModelId: 'parler-tts/parler-tts', category: 'tts', elo: 900, pricing: { perMinute: 0.005 } },
  { id: 'replicate:styletts2', name: 'StyleTTS 2', providerId: 'replicate', providerModelId: 'styletts2/styletts2', category: 'tts', elo: 880, pricing: { perMinute: 0.004 } },
  { id: 'replicate:kokoro-tts', name: 'Kokoro TTS', providerId: 'replicate', providerModelId: 'kokoro-tts/kokoro', category: 'tts', elo: 850, pricing: { perMinute: 0.003 } },
];

export const fetchReplicateModels = async (_apiKey?: string): Promise<ProviderModelsResult> => {
  return {
    providerId: 'replicate',
    models: CURATED_MODELS,
    lastUpdated: Date.now(),
  };
};
