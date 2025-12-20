/**
 * Провайдер: FAL.ai
 * https://fal.ai — быстрые inference для Image/Video
 * 
 * ВСЕ модели из Artificial Analysis LEADERBOARD (декабрь 2025)
 * 20 Image + 20 Video моделей
 */

import { UnifiedModel, ProviderModelsResult } from '../types';

// ВСЕ 40 Image + Video моделей из LEADERBOARD
const CURATED_MODELS: UnifiedModel[] = [
  // ==================== IMAGE (🎨) - 20 моделей ====================
  { id: 'fal:gpt-image-1.5', name: 'GPT Image 1.5', providerId: 'fal', providerModelId: 'gpt-image-1-5', category: 'image', elo: 1261, pricing: { perImage: 0.02 } },
  { id: 'fal:nano-banana-pro', name: 'Nano Banana Pro', providerId: 'fal', providerModelId: 'nano-banana-pro', category: 'image', elo: 1261, pricing: { perImage: 0.015 } },
  { id: 'fal:flux-2-max', name: 'FLUX.2 [max]', providerId: 'fal', providerModelId: 'flux-2-max', category: 'image', elo: 1250, pricing: { perImage: 0.025 } },
  { id: 'fal:seedream-4.5', name: 'Seedream 4.5', providerId: 'fal', providerModelId: 'seedream-4-5', category: 'image', elo: 1250, pricing: { perImage: 0.02 } },
  { id: 'fal:seedream-4.0', name: 'Seedream 4.0', providerId: 'fal', providerModelId: 'seedream-4-0', category: 'image', elo: 1246, pricing: { perImage: 0.02 } },
  { id: 'fal:flux-2-pro', name: 'FLUX.2 [pro]', providerId: 'fal', providerModelId: 'flux-2-pro', category: 'image', elo: 1244, pricing: { perImage: 0.02 } },
  { id: 'fal:imagen-4-ultra', name: 'Imagen 4 Ultra', providerId: 'fal', providerModelId: 'imagen-4-ultra', category: 'image', elo: 1225, pricing: { perImage: 0.05 } },
  { id: 'fal:ideogram-3.0', name: 'Ideogram 3.0', providerId: 'fal', providerModelId: 'ideogram-3-0', category: 'image', elo: 1222, pricing: { perImage: 0.03 } },
  { id: 'fal:seedream-3.0', name: 'Seedream 3.0', providerId: 'fal', providerModelId: 'seedream-3-0', category: 'image', elo: 1221, pricing: { perImage: 0.02 } },
  { id: 'fal:imagen-4-preview', name: 'Imagen 4 Preview', providerId: 'fal', providerModelId: 'imagen-4-preview', category: 'image', elo: 1218, pricing: { perImage: 0.03 } },
  { id: 'fal:z-image-turbo', name: 'Z-Image Turbo', providerId: 'fal', providerModelId: 'z-image-turbo', category: 'image', elo: 1217, pricing: { perImage: 0.01 } },
  { id: 'fal:flux-2-flex', name: 'FLUX.2 [flex]', providerId: 'fal', providerModelId: 'flux-2-flex', category: 'image', elo: 1211, pricing: { perImage: 0.015 } },
  { id: 'fal:imagineart-1.5', name: 'ImagineArt 1.5', providerId: 'fal', providerModelId: 'imagineart-1-5', category: 'image', elo: 1195, pricing: { perImage: 0.02 } },
  { id: 'fal:kolors-2.1', name: 'Kolors 2.1', providerId: 'fal', providerModelId: 'kolors-2-1', category: 'image', elo: 1194, pricing: { perImage: 0.01 } },
  { id: 'fal:flux-1.1-pro', name: 'FLUX1.1 [pro]', providerId: 'fal', providerModelId: 'flux-1-1-pro', category: 'image', elo: 1186, pricing: { perImage: 0.02 } },
  { id: 'fal:recraft-v3', name: 'Recraft V3', providerId: 'fal', providerModelId: 'recraft-v3', category: 'image', elo: 1176, pricing: { perImage: 0.02 } },
  { id: 'fal:flux-2-dev', name: 'FLUX.2 [dev]', providerId: 'fal', providerModelId: 'flux-2-dev', category: 'image', elo: 1164, pricing: { perImage: 0.008 } },
  { id: 'fal:ideogram-2.0', name: 'Ideogram 2.0', providerId: 'fal', providerModelId: 'ideogram-2-0', category: 'image', elo: 1151, pricing: { perImage: 0.025 } },
  { id: 'fal:dall-e-3', name: 'DALL·E 3', providerId: 'fal', providerModelId: 'dall-e-3', category: 'image', elo: 1136, pricing: { perImage: 0.04 } },
  { id: 'fal:flux-1-pro', name: 'FLUX.1 [pro]', providerId: 'fal', providerModelId: 'flux-1-pro', category: 'image', elo: 1128, pricing: { perImage: 0.015 } },

  // ==================== VIDEO (🎬) - 20 моделей ====================
  { id: 'fal:runway-gen-4.5', name: 'Runway Gen-4.5', providerId: 'fal', providerModelId: 'runway-gen-4-5', category: 'video', elo: 1243, pricing: { videoPerSecond: 0.05 } },
  { id: 'fal:veo-3.1', name: 'Veo 3.1', providerId: 'fal', providerModelId: 'veo-3-1', category: 'video', elo: 1241, pricing: { videoPerSecond: 0.04 } },
  { id: 'fal:veo-3', name: 'Veo 3', providerId: 'fal', providerModelId: 'veo-3', category: 'video', elo: 1237, pricing: { videoPerSecond: 0.04 } },
  { id: 'fal:kling-2.5-pro', name: 'Kling 2.5 Pro', providerId: 'fal', providerModelId: 'kling-2-5-pro', category: 'video', elo: 1236, pricing: { videoPerSecond: 0.03 } },
  { id: 'fal:luma-ray3', name: 'Luma Ray 3', providerId: 'fal', providerModelId: 'luma-ray-3', category: 'video', elo: 1234, pricing: { videoPerSecond: 0.025 } },
  { id: 'fal:sora-2', name: 'Sora 2', providerId: 'fal', providerModelId: 'sora-2', category: 'video', elo: 1232, pricing: { videoPerSecond: 0.05 } },
  { id: 'fal:runway-gen-4', name: 'Runway Gen-4', providerId: 'fal', providerModelId: 'runway-gen-4', category: 'video', elo: 1227, pricing: { videoPerSecond: 0.04 } },
  { id: 'fal:hailuo-t2v-director', name: 'Hailuo T2V Director', providerId: 'fal', providerModelId: 'hailuo-t2v-director', category: 'video', elo: 1224, pricing: { videoPerSecond: 0.02 } },
  { id: 'fal:kling-2.1-pro', name: 'Kling 2.1 Pro', providerId: 'fal', providerModelId: 'kling-2-1-pro', category: 'video', elo: 1218, pricing: { videoPerSecond: 0.025 } },
  { id: 'fal:hailuo-t2v-01', name: 'Hailuo T2V 01', providerId: 'fal', providerModelId: 'hailuo-t2v-01', category: 'video', elo: 1215, pricing: { videoPerSecond: 0.018 } },
  { id: 'fal:ltx-video-2', name: 'LTX-Video 2', providerId: 'fal', providerModelId: 'ltx-video-2', category: 'video', elo: 1213, pricing: { videoPerSecond: 0.01 } },
  { id: 'fal:seedance-1', name: 'Seedance 1', providerId: 'fal', providerModelId: 'seedance-1', category: 'video', elo: 1210, pricing: { videoPerSecond: 0.02 } },
  { id: 'fal:veo-2', name: 'Veo 2', providerId: 'fal', providerModelId: 'veo-2', category: 'video', elo: 1204, pricing: { videoPerSecond: 0.03 } },
  { id: 'fal:wan-2.1', name: 'Wan 2.1', providerId: 'fal', providerModelId: 'wan-2-1', category: 'video', elo: 1199, pricing: { videoPerSecond: 0.015 } },
  { id: 'fal:luma-ray2', name: 'Luma Ray 2', providerId: 'fal', providerModelId: 'luma-ray-2', category: 'video', elo: 1195, pricing: { videoPerSecond: 0.02 } },
  { id: 'fal:kling-2.0-pro', name: 'Kling 2.0 Pro', providerId: 'fal', providerModelId: 'kling-2-0-pro', category: 'video', elo: 1190, pricing: { videoPerSecond: 0.02 } },
  { id: 'fal:pika-2.0', name: 'Pika 2.0', providerId: 'fal', providerModelId: 'pika-2-0', category: 'video', elo: 1183, pricing: { videoPerSecond: 0.02 } },
  { id: 'fal:runway-gen-3-turbo', name: 'Runway Gen-3 Turbo', providerId: 'fal', providerModelId: 'runway-gen-3-turbo', category: 'video', elo: 1172, pricing: { videoPerSecond: 0.02 } },
  { id: 'fal:hunyuan-video', name: 'HunyuanVideo', providerId: 'fal', providerModelId: 'hunyuan-video', category: 'video', elo: 1167, pricing: { videoPerSecond: 0.01 } },
  { id: 'fal:cogvideox-1.5', name: 'CogVideoX 1.5', providerId: 'fal', providerModelId: 'cogvideox-1-5', category: 'video', elo: 1158, pricing: { videoPerSecond: 0.008 } },
];

export const fetchFalModels = async (_apiKey?: string): Promise<ProviderModelsResult> => {
  return {
    providerId: 'fal',
    models: CURATED_MODELS,
    lastUpdated: Date.now(),
  };
};
