/**
 * Провайдер: Kie.ai
 * https://kie.ai — агрегатор AI-моделей
 * 
 * ВСЕ модели из Artificial Analysis LEADERBOARD (декабрь 2025)
 * 10 Music + 14 TTS + 20 Video + 20 Image = 64 модели
 */

import { UnifiedModel, ProviderModelsResult, UnifiedPricing } from '../types';

type CuratedCategory = UnifiedModel['category'] | 'tts';
type CuratedModel = Omit<UnifiedModel, 'category' | 'pricing'> & {
  category: CuratedCategory;
  pricing: UnifiedPricing & { perImage?: number; perMinute?: number };
};

const normalizeCuratedModels = (models: CuratedModel[]): UnifiedModel[] =>
  models.map((model) => {
    const { perImage, perMinute, ...pricing } = model.pricing;

    return {
      ...model,
      category: model.category === 'tts' ? 'audio' : model.category,
      pricing: {
        ...pricing,
        imagePerUnit: pricing.imagePerUnit ?? perImage,
        audioPerMinute: pricing.audioPerMinute ?? perMinute,
      },
    };
  });

// ВСЕ модели из LEADERBOARD
const CURATED_MODELS: CuratedModel[] = [
  // ==================== MUSIC (🎵) - 10 моделей ====================
  { id: 'kie:suno-v4.5', name: 'Suno V4.5', providerId: 'kie', providerModelId: 'suno-v4-5', category: 'audio', elo: 1109, pricing: { perMinute: 0.05 } },
  { id: 'kie:eleven-music', name: 'Eleven Music', providerId: 'kie', providerModelId: 'eleven-music', category: 'audio', elo: 1078, pricing: { perMinute: 0.08 } },
  { id: 'kie:fuzz', name: 'FUZZ', providerId: 'kie', providerModelId: 'fuzz', category: 'audio', elo: 1074, pricing: { perMinute: 0.04 } },
  { id: 'kie:suno-v4', name: 'Suno V4', providerId: 'kie', providerModelId: 'suno-v4', category: 'audio', elo: 1069, pricing: { perMinute: 0.04 } },
  { id: 'kie:lyria-2', name: 'Lyria 2', providerId: 'kie', providerModelId: 'lyria-2', category: 'audio', elo: 1048, pricing: { perMinute: 0.06 } },
  { id: 'kie:udio-v1.5', name: 'Udio V1.5', providerId: 'kie', providerModelId: 'udio-v1-5', category: 'audio', elo: 1035, pricing: { perMinute: 0.03 } },
  { id: 'kie:stable-audio-2', name: 'Stable Audio 2', providerId: 'kie', providerModelId: 'stable-audio-2', category: 'audio', elo: 947, pricing: { perMinute: 0.02 } },
  { id: 'kie:suno-v3.5', name: 'Suno V3.5', providerId: 'kie', providerModelId: 'suno-v3-5', category: 'audio', elo: 936, pricing: { perMinute: 0.03 } },
  { id: 'kie:musicgen-stereo', name: 'MusicGen Stereo', providerId: 'kie', providerModelId: 'musicgen-stereo', category: 'audio', elo: 870, pricing: { perMinute: 0.01 } },
  { id: 'kie:musicgen-mono', name: 'MusicGen Mono', providerId: 'kie', providerModelId: 'musicgen-mono', category: 'audio', elo: 832, pricing: { perMinute: 0.008 } },

  // ==================== TTS (🎙️) - 14 моделей ====================
  { id: 'kie:inworld-tts', name: 'Inworld TTS', providerId: 'kie', providerModelId: 'inworld-tts', category: 'tts', elo: 1164, pricing: { perMinute: 0.02 } },
  { id: 'kie:minimax-speech-02', name: 'MiniMax Speech-02', providerId: 'kie', providerModelId: 'minimax-speech-02', category: 'tts', elo: 1161, pricing: { perMinute: 0.03 } },
  { id: 'kie:elevenlabs-turbo-2.5', name: 'ElevenLabs Turbo V2.5', providerId: 'kie', providerModelId: 'elevenlabs-turbo-2-5', category: 'tts', elo: 1153, pricing: { perMinute: 0.05 } },
  { id: 'kie:openai-gpt-4o-mini-tts', name: 'OpenAI GPT-4o-mini TTS', providerId: 'kie', providerModelId: 'gpt-4o-mini-tts', category: 'tts', elo: 1146, pricing: { perMinute: 0.02 } },
  { id: 'kie:openai-tts-1-hd', name: 'OpenAI TTS-1-HD', providerId: 'kie', providerModelId: 'openai-tts-1-hd', category: 'tts', elo: 1143, pricing: { perMinute: 0.03 } },
  { id: 'kie:fish-audio-evo', name: 'Fish Audio Evo', providerId: 'kie', providerModelId: 'fish-audio-evo', category: 'tts', elo: 1133, pricing: { perMinute: 0.015 } },
  { id: 'kie:azure-tts', name: 'Azure TTS', providerId: 'kie', providerModelId: 'azure-tts', category: 'tts', elo: 1129, pricing: { perMinute: 0.02 } },
  { id: 'kie:amazon-polly-neural', name: 'Amazon Polly Neural', providerId: 'kie', providerModelId: 'amazon-polly-neural', category: 'tts', elo: 1124, pricing: { perMinute: 0.016 } },
  { id: 'kie:gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash Preview TTS', providerId: 'kie', providerModelId: 'gemini-2-5-flash-preview-tts', category: 'tts', elo: 1117, pricing: { perMinute: 0.01 } },
  { id: 'kie:fish-audio-1.5', name: 'Fish Audio 1.5', providerId: 'kie', providerModelId: 'fish-audio-1-5', category: 'tts', elo: 1109, pricing: { perMinute: 0.012 } },
  { id: 'kie:gemini-2.5-pro-preview-tts', name: 'Gemini 2.5 Pro Preview TTS', providerId: 'kie', providerModelId: 'gemini-2-5-pro-preview-tts', category: 'tts', elo: 1105, pricing: { perMinute: 0.015 } },
  { id: 'kie:coqui-xtts-v2', name: 'Coqui XTTS-V2', providerId: 'kie', providerModelId: 'coqui-xtts-v2', category: 'tts', elo: 1082, pricing: { perMinute: 0.01 } },
  { id: 'kie:cartesia-sonic', name: 'Cartesia Sonic', providerId: 'kie', providerModelId: 'cartesia-sonic', category: 'tts', elo: 1070, pricing: { perMinute: 0.02 } },
  { id: 'kie:openai-tts-1', name: 'OpenAI TTS-1', providerId: 'kie', providerModelId: 'openai-tts-1', category: 'tts', elo: 1061, pricing: { perMinute: 0.015 } },

  // ==================== IMAGE (🎨) - 20 моделей ====================
  { id: 'kie:gpt-image-1.5', name: 'GPT Image 1.5', providerId: 'kie', providerModelId: 'gpt-image-1-5', category: 'image', elo: 1261, pricing: { perImage: 0.02 } },
  { id: 'kie:nano-banana-pro', name: 'Nano Banana Pro', providerId: 'kie', providerModelId: 'nano-banana-pro', category: 'image', elo: 1261, pricing: { perImage: 0.015 } },
  { id: 'kie:flux-2-max', name: 'FLUX.2 [max]', providerId: 'kie', providerModelId: 'flux-2-max', category: 'image', elo: 1250, pricing: { perImage: 0.025 } },
  { id: 'kie:seedream-4.5', name: 'Seedream 4.5', providerId: 'kie', providerModelId: 'seedream-4-5', category: 'image', elo: 1250, pricing: { perImage: 0.02 } },
  { id: 'kie:seedream-4.0', name: 'Seedream 4.0', providerId: 'kie', providerModelId: 'seedream-4-0', category: 'image', elo: 1246, pricing: { perImage: 0.02 } },
  { id: 'kie:flux-2-pro', name: 'FLUX.2 [pro]', providerId: 'kie', providerModelId: 'flux-2-pro', category: 'image', elo: 1244, pricing: { perImage: 0.02 } },
  { id: 'kie:imagen-4-ultra', name: 'Imagen 4 Ultra', providerId: 'kie', providerModelId: 'imagen-4-ultra', category: 'image', elo: 1225, pricing: { perImage: 0.05 } },
  { id: 'kie:ideogram-3.0', name: 'Ideogram 3.0', providerId: 'kie', providerModelId: 'ideogram-3-0', category: 'image', elo: 1222, pricing: { perImage: 0.03 } },
  { id: 'kie:seedream-3.0', name: 'Seedream 3.0', providerId: 'kie', providerModelId: 'seedream-3-0', category: 'image', elo: 1221, pricing: { perImage: 0.02 } },
  { id: 'kie:imagen-4-preview', name: 'Imagen 4 Preview', providerId: 'kie', providerModelId: 'imagen-4-preview', category: 'image', elo: 1218, pricing: { perImage: 0.03 } },
  { id: 'kie:z-image-turbo', name: 'Z-Image Turbo', providerId: 'kie', providerModelId: 'z-image-turbo', category: 'image', elo: 1217, pricing: { perImage: 0.01 } },
  { id: 'kie:flux-2-flex', name: 'FLUX.2 [flex]', providerId: 'kie', providerModelId: 'flux-2-flex', category: 'image', elo: 1211, pricing: { perImage: 0.015 } },
  { id: 'kie:imagineart-1.5', name: 'ImagineArt 1.5', providerId: 'kie', providerModelId: 'imagineart-1-5', category: 'image', elo: 1195, pricing: { perImage: 0.02 } },
  { id: 'kie:kolors-2.1', name: 'Kolors 2.1', providerId: 'kie', providerModelId: 'kolors-2-1', category: 'image', elo: 1194, pricing: { perImage: 0.01 } },
  { id: 'kie:flux-1.1-pro', name: 'FLUX1.1 [pro]', providerId: 'kie', providerModelId: 'flux-1-1-pro', category: 'image', elo: 1186, pricing: { perImage: 0.02 } },
  { id: 'kie:recraft-v3', name: 'Recraft V3', providerId: 'kie', providerModelId: 'recraft-v3', category: 'image', elo: 1176, pricing: { perImage: 0.02 } },
  { id: 'kie:flux-2-dev', name: 'FLUX.2 [dev]', providerId: 'kie', providerModelId: 'flux-2-dev', category: 'image', elo: 1164, pricing: { perImage: 0.008 } },
  { id: 'kie:ideogram-2.0', name: 'Ideogram 2.0', providerId: 'kie', providerModelId: 'ideogram-2-0', category: 'image', elo: 1151, pricing: { perImage: 0.025 } },
  { id: 'kie:dall-e-3', name: 'DALL·E 3', providerId: 'kie', providerModelId: 'dall-e-3', category: 'image', elo: 1136, pricing: { perImage: 0.04 } },
  { id: 'kie:flux-1-pro', name: 'FLUX.1 [pro]', providerId: 'kie', providerModelId: 'flux-1-pro', category: 'image', elo: 1128, pricing: { perImage: 0.015 } },

  // ==================== VIDEO (🎬) - 20 моделей ====================
  { id: 'kie:runway-gen-4.5', name: 'Runway Gen-4.5', providerId: 'kie', providerModelId: 'runway-gen-4-5', category: 'video', elo: 1243, pricing: { videoPerSecond: 0.05 } },
  { id: 'kie:veo-3.1', name: 'Veo 3.1', providerId: 'kie', providerModelId: 'veo-3-1', category: 'video', elo: 1241, pricing: { videoPerSecond: 0.04 } },
  { id: 'kie:veo-3', name: 'Veo 3', providerId: 'kie', providerModelId: 'veo-3', category: 'video', elo: 1237, pricing: { videoPerSecond: 0.04 } },
  { id: 'kie:kling-2.5-pro', name: 'Kling 2.5 Pro', providerId: 'kie', providerModelId: 'kling-2-5-pro', category: 'video', elo: 1236, pricing: { videoPerSecond: 0.03 } },
  { id: 'kie:luma-ray3', name: 'Luma Ray 3', providerId: 'kie', providerModelId: 'luma-ray-3', category: 'video', elo: 1234, pricing: { videoPerSecond: 0.025 } },
  { id: 'kie:sora-2', name: 'Sora 2', providerId: 'kie', providerModelId: 'sora-2', category: 'video', elo: 1232, pricing: { videoPerSecond: 0.05 } },
  { id: 'kie:runway-gen-4', name: 'Runway Gen-4', providerId: 'kie', providerModelId: 'runway-gen-4', category: 'video', elo: 1227, pricing: { videoPerSecond: 0.04 } },
  { id: 'kie:hailuo-t2v-director', name: 'Hailuo T2V Director', providerId: 'kie', providerModelId: 'hailuo-t2v-director', category: 'video', elo: 1224, pricing: { videoPerSecond: 0.02 } },
  { id: 'kie:kling-2.1-pro', name: 'Kling 2.1 Pro', providerId: 'kie', providerModelId: 'kling-2-1-pro', category: 'video', elo: 1218, pricing: { videoPerSecond: 0.025 } },
  { id: 'kie:hailuo-t2v-01', name: 'Hailuo T2V 01', providerId: 'kie', providerModelId: 'hailuo-t2v-01', category: 'video', elo: 1215, pricing: { videoPerSecond: 0.018 } },
  { id: 'kie:ltx-video-2', name: 'LTX-Video 2', providerId: 'kie', providerModelId: 'ltx-video-2', category: 'video', elo: 1213, pricing: { videoPerSecond: 0.01 } },
  { id: 'kie:seedance-1', name: 'Seedance 1', providerId: 'kie', providerModelId: 'seedance-1', category: 'video', elo: 1210, pricing: { videoPerSecond: 0.02 } },
  { id: 'kie:veo-2', name: 'Veo 2', providerId: 'kie', providerModelId: 'veo-2', category: 'video', elo: 1204, pricing: { videoPerSecond: 0.03 } },
  { id: 'kie:wan-2.1', name: 'Wan 2.1', providerId: 'kie', providerModelId: 'wan-2-1', category: 'video', elo: 1199, pricing: { videoPerSecond: 0.015 } },
  { id: 'kie:luma-ray2', name: 'Luma Ray 2', providerId: 'kie', providerModelId: 'luma-ray-2', category: 'video', elo: 1195, pricing: { videoPerSecond: 0.02 } },
  { id: 'kie:kling-2.0-pro', name: 'Kling 2.0 Pro', providerId: 'kie', providerModelId: 'kling-2-0-pro', category: 'video', elo: 1190, pricing: { videoPerSecond: 0.02 } },
  { id: 'kie:pika-2.0', name: 'Pika 2.0', providerId: 'kie', providerModelId: 'pika-2-0', category: 'video', elo: 1183, pricing: { videoPerSecond: 0.02 } },
  { id: 'kie:runway-gen-3-turbo', name: 'Runway Gen-3 Turbo', providerId: 'kie', providerModelId: 'runway-gen-3-turbo', category: 'video', elo: 1172, pricing: { videoPerSecond: 0.02 } },
  { id: 'kie:hunyuan-video', name: 'HunyuanVideo', providerId: 'kie', providerModelId: 'hunyuan-video', category: 'video', elo: 1167, pricing: { videoPerSecond: 0.01 } },
  { id: 'kie:cogvideox-1.5', name: 'CogVideoX 1.5', providerId: 'kie', providerModelId: 'cogvideox-1-5', category: 'video', elo: 1158, pricing: { videoPerSecond: 0.008 } },
];

export const fetchKieModels = async (_apiKey?: string): Promise<ProviderModelsResult> => {
  return {
    providerId: 'kie',
    models: normalizeCuratedModels(CURATED_MODELS),
    lastUpdated: Date.now(),
  };
};
