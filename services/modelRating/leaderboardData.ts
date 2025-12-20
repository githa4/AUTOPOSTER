/**
 * Данные из Artificial Analysis LEADERBOARD (декабрь 2025)
 * Источник: doc/LEADERBOARD_2025_12.md
 * 
 * Эти данные используются для сопоставления с моделями провайдеров
 * и отображения ELO рейтингов.
 */

export interface LeaderboardModel {
  name: string;
  vendor: string;
  elo: number;
  category: 'text' | 'vision' | 'code' | 'image' | 'video' | 'music' | 'tts';
  license?: string;
  pricePerUnit?: string;
}

// ==================== LLM / ТЕКСТ / МУЛЬТИМОДАЛЬНЫЕ / КОД ====================
export const LLM_LEADERBOARD: LeaderboardModel[] = [
  // Топ-30 текстовых моделей
  { name: 'Gemini 3 Pro', vendor: 'Google', elo: 1490, category: 'text', license: 'Proprietary' },
  { name: 'Claude Opus 4.5 (20251101, thinking, 32k)', vendor: 'Anthropic', elo: 1469, category: 'text', license: 'Proprietary' },
  { name: 'Grok-4.1 Thinking', vendor: 'xAI', elo: 1477, category: 'text', license: 'Proprietary' },
  { name: 'Gemini 3 Flash', vendor: 'Google', elo: 1475, category: 'text', license: 'Proprietary' },
  { name: 'Claude Opus 4.5 (20251101)', vendor: 'Anthropic', elo: 1465, category: 'text', license: 'Proprietary' },
  { name: 'Grok-4.1', vendor: 'xAI', elo: 1465, category: 'text', license: 'Proprietary' },
  { name: 'Gemini 3 Flash (thinking-minimal)', vendor: 'Google', elo: 1463, category: 'text', license: 'Proprietary' },
  { name: 'GPT-5.1 High', vendor: 'OpenAI', elo: 1457, category: 'text', license: 'Proprietary' },
  { name: 'Gemini 2.5 Pro', vendor: 'Google', elo: 1451, category: 'text', license: 'Proprietary' },
  { name: 'Claude Sonnet 4.5 (20250929, thinking, 32k)', vendor: 'Anthropic', elo: 1450, category: 'text', license: 'Proprietary' },
  { name: 'Claude Opus 4.1 (20250805, thinking, 16k)', vendor: 'Anthropic', elo: 1448, category: 'text', license: 'Proprietary' },
  { name: 'Claude Sonnet 4.5 (20250929)', vendor: 'Anthropic', elo: 1446, category: 'text', license: 'Proprietary' },
  { name: 'GPT-4.5 Preview (2025-02-27)', vendor: 'OpenAI', elo: 1442, category: 'text', license: 'Proprietary' },
  { name: 'GPT-5.2', vendor: 'OpenAI', elo: 1442, category: 'text', license: 'Proprietary' },
  { name: 'Claude Opus 4.1 (20250805)', vendor: 'Anthropic', elo: 1440, category: 'text', license: 'Proprietary' },
  { name: 'ChatGPT-4o Latest (20250326)', vendor: 'OpenAI', elo: 1440, category: 'text', license: 'Proprietary' },
  { name: 'GPT-5.2 High', vendor: 'OpenAI', elo: 1440, category: 'text', license: 'Proprietary' },
  { name: 'GPT-5.1', vendor: 'OpenAI', elo: 1437, category: 'text', license: 'Proprietary' },
  { name: 'GPT-5 High', vendor: 'OpenAI', elo: 1436, category: 'text', license: 'Proprietary' },
  { name: 'o3 (2025-04-16)', vendor: 'OpenAI', elo: 1434, category: 'text', license: 'Proprietary' },
  { name: 'Qwen3 Max Preview', vendor: 'Alibaba', elo: 1433, category: 'text', license: 'Proprietary' },
  { name: 'Grok-4.1 Fast Reasoning', vendor: 'xAI', elo: 1431, category: 'text', license: 'Proprietary' },
  { name: 'Kimi K2 Thinking Turbo', vendor: 'Moonshot', elo: 1428, category: 'text', license: 'Modified MIT' },
  { name: 'ERNIE 5.0 Preview (1103)', vendor: 'Baidu', elo: 1427, category: 'text', license: 'Proprietary' },
  { name: 'GLM-4.6', vendor: 'Z.ai', elo: 1425, category: 'text', license: 'MIT' },
  { name: 'GPT-5 Chat', vendor: 'OpenAI', elo: 1425, category: 'text', license: 'Proprietary' },
  { name: 'Qwen3 Max (2025-09-23)', vendor: 'Alibaba', elo: 1424, category: 'text', license: 'Proprietary' },
  { name: 'DeepSeek V3.2 Exp', vendor: 'DeepSeek AI', elo: 1423, category: 'text', license: 'MIT' },
  { name: 'Claude Opus 4 (20250514, thinking, 16k)', vendor: 'Anthropic', elo: 1423, category: 'text', license: 'Proprietary' },
  { name: 'DeepSeek V3.2 Thinking', vendor: 'DeepSeek AI', elo: 1422, category: 'text', license: 'MIT' },
  { name: 'Qwen3 235B A22B Instruct (2507)', vendor: 'Alibaba', elo: 1422, category: 'text', license: 'Apache 2.0' },
  { name: 'DeepSeek V3.2 Exp Thinking', vendor: 'DeepSeek AI', elo: 1421, category: 'text', license: 'MIT' },
  { name: 'Grok-4 Fast Chat', vendor: 'xAI', elo: 1420, category: 'text', license: 'Proprietary' },
];

// Vision / Multimodal models with vision capabilities
export const VISION_LEADERBOARD: LeaderboardModel[] = [
  { name: 'Gemini 3 Pro', vendor: 'Google', elo: 1309, category: 'vision', license: 'Proprietary' },
  { name: 'Gemini 3 Flash', vendor: 'Google', elo: 1284, category: 'vision', license: 'Proprietary' },
  { name: 'Gemini 3 Flash (thinking-minimal)', vendor: 'Google', elo: 1268, category: 'vision', license: 'Proprietary' },
  { name: 'GPT-5.1 High', vendor: 'OpenAI', elo: 1249, category: 'vision', license: 'Proprietary' },
  { name: 'Gemini 2.5 Pro', vendor: 'Google', elo: 1249, category: 'vision', license: 'Proprietary' },
  { name: 'GPT-5.1', vendor: 'OpenAI', elo: 1239, category: 'vision', license: 'Proprietary' },
  { name: 'ChatGPT-4o Latest (20250326)', vendor: 'OpenAI', elo: 1236, category: 'vision', license: 'Proprietary' },
  { name: 'GPT-4.5 Preview (2025-02-27)', vendor: 'OpenAI', elo: 1226, category: 'vision', license: 'Proprietary' },
  { name: 'Gemini 2.5 Flash Preview (09-2025)', vendor: 'Google', elo: 1224, category: 'vision', license: 'Proprietary' },
  { name: 'GPT-5 Chat', vendor: 'OpenAI', elo: 1223, category: 'vision', license: 'Proprietary' },
  { name: 'o3 (2025-04-16)', vendor: 'OpenAI', elo: 1217, category: 'vision', license: 'Proprietary' },
  { name: 'GPT-4.1 (2025-04-14)', vendor: 'OpenAI', elo: 1215, category: 'vision', license: 'Proprietary' },
  { name: 'Gemini 2.5 Flash', vendor: 'Google', elo: 1213, category: 'vision', license: 'Proprietary' },
  { name: 'GPT-5 High', vendor: 'OpenAI', elo: 1210, category: 'vision', license: 'Proprietary' },
  { name: 'Qwen3 VL 235B A22B Instruct', vendor: 'Alibaba', elo: 1209, category: 'vision', license: 'Apache 2.0' },
  { name: 'Claude Opus 4 (20250514, thinking, 16k)', vendor: 'Anthropic', elo: 1209, category: 'vision', license: 'Proprietary' },
  { name: 'ERNIE 5.0 Preview (1120)', vendor: 'Baidu', elo: 1206, category: 'vision', license: 'Proprietary' },
  { name: 'Claude Sonnet 4.5 (20250929, thinking, 32k)', vendor: 'Anthropic', elo: 1204, category: 'vision', license: 'Proprietary' },
  { name: 'Claude Sonnet 4 (20250514, thinking, 32k)', vendor: 'Anthropic', elo: 1204, category: 'vision', license: 'Proprietary' },
  { name: 'GPT-4.1 Mini (2025-04-14)', vendor: 'OpenAI', elo: 1202, category: 'vision', license: 'Proprietary' },
];

// Code models
export const CODE_LEADERBOARD: LeaderboardModel[] = [
  { name: 'Claude Opus 4.5 (20251101, thinking, 32k)', vendor: 'Anthropic', elo: 1518, category: 'code', license: 'Proprietary' },
  { name: 'GPT-5.2 High', vendor: 'OpenAI', elo: 1485, category: 'code', license: 'Proprietary' },
  { name: 'Claude Opus 4.5 (20251101)', vendor: 'Anthropic', elo: 1484, category: 'code', license: 'Proprietary' },
  { name: 'Gemini 3 Pro', vendor: 'Google', elo: 1481, category: 'code', license: 'Proprietary' },
  { name: 'Gemini 3 Flash', vendor: 'Google', elo: 1465, category: 'code', license: 'Proprietary' },
  { name: 'GPT-5.2', vendor: 'OpenAI', elo: 1399, category: 'code', license: 'Proprietary' },
  { name: 'GPT-5 Medium', vendor: 'OpenAI', elo: 1399, category: 'code', license: 'Proprietary' },
  { name: 'Claude Sonnet 4.5 (20250929, thinking, 32k)', vendor: 'Anthropic', elo: 1393, category: 'code', license: 'Proprietary' },
  { name: 'GPT-5.1 Medium', vendor: 'OpenAI', elo: 1393, category: 'code', license: 'Proprietary' },
  { name: 'Claude Opus 4.1 (20250805)', vendor: 'Anthropic', elo: 1392, category: 'code', license: 'Proprietary' },
  { name: 'Claude Sonnet 4.5 (20250929)', vendor: 'Anthropic', elo: 1387, category: 'code', license: 'Proprietary' },
  { name: 'Gemini 3 Flash (thinking-minimal)', vendor: 'Google', elo: 1376, category: 'code', license: 'Proprietary' },
  { name: 'GLM-4.6', vendor: 'Z.ai', elo: 1368, category: 'code', license: 'MIT' },
  { name: 'DeepSeek V3.2 Thinking', vendor: 'DeepSeek AI', elo: 1367, category: 'code', license: 'MIT' },
  { name: 'GPT-5.1', vendor: 'OpenAI', elo: 1359, category: 'code', license: 'Proprietary' },
  { name: 'Kimi K2 Thinking Turbo', vendor: 'Moonshot', elo: 1345, category: 'code', license: 'Modified MIT' },
  { name: 'GPT-5.1 Codex', vendor: 'OpenAI', elo: 1335, category: 'code', license: 'Proprietary' },
  { name: 'MiniMax M2', vendor: 'MiniMax', elo: 1317, category: 'code', license: 'Apache 2.0' },
  { name: 'DeepSeek V3.2 Exp', vendor: 'DeepSeek AI', elo: 1294, category: 'code', license: 'MIT' },
  { name: 'Qwen3 Coder 480B A35B Instruct', vendor: 'Alibaba', elo: 1291, category: 'code', license: 'Apache 2.0' },
  { name: 'Claude Haiku 4.5 (20251001)', vendor: 'Anthropic', elo: 1289, category: 'code', license: 'Proprietary' },
  { name: 'DeepSeek V3.2', vendor: 'DeepSeek AI', elo: 1286, category: 'code', license: 'MIT' },
  { name: 'KAT-Coder-Pro-V1', vendor: 'KwaiKAT', elo: 1264, category: 'code', license: 'Proprietary' },
  { name: 'GPT-5.1 Codex Mini', vendor: 'OpenAI', elo: 1252, category: 'code', license: 'Proprietary' },
  { name: 'Grok-4.1 Fast Reasoning', vendor: 'xAI', elo: 1227, category: 'code', license: 'Proprietary' },
  { name: 'Mistral Large 3', vendor: 'Mistral', elo: 1226, category: 'code', license: 'Apache 2.0' },
  { name: 'Gemini 2.5 Pro', vendor: 'Google', elo: 1213, category: 'code', license: 'Proprietary' },
  { name: 'Grok-4.1 Thinking', vendor: 'xAI', elo: 1206, category: 'code', license: 'Proprietary' },
  { name: 'Grok-4 Fast Reasoning', vendor: 'xAI', elo: 1153, category: 'code', license: 'Proprietary' },
  { name: 'Grok Code Fast 1', vendor: 'xAI', elo: 1144, category: 'code', license: 'Proprietary' },
  { name: 'Devstral Medium 2507', vendor: 'Mistral', elo: 1103, category: 'code', license: 'Proprietary' },
];

// ==================== ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ (Text-to-Image) ====================
export const IMAGE_LEADERBOARD: LeaderboardModel[] = [
  { name: 'GPT Image 1.5 (high)', vendor: 'OpenAI', elo: 1261, category: 'image', pricePerUnit: '$133/1k' },
  { name: 'Nano Banana Pro (Gemini 3 Pro Image)', vendor: 'Google', elo: 1221, category: 'image', pricePerUnit: '$134/1k' },
  { name: 'FLUX.2 [max]', vendor: 'Black Forest Labs', elo: 1211, category: 'image', pricePerUnit: '$70/1k' },
  { name: 'FLUX.2 [pro]', vendor: 'Black Forest Labs', elo: 1201, category: 'image', pricePerUnit: '$30/1k' },
  { name: 'Seedream 4.0', vendor: 'ByteDance Seed', elo: 1193, category: 'image', pricePerUnit: '$30/1k' },
  { name: 'FLUX.2 [flex]', vendor: 'Black Forest Labs', elo: 1186, category: 'image', pricePerUnit: '$60/1k' },
  { name: 'Seedream 4.5', vendor: 'ByteDance Seed', elo: 1169, category: 'image', pricePerUnit: '$40/1k' },
  { name: 'Imagen 4 Ultra Preview', vendor: 'Google', elo: 1165, category: 'image', pricePerUnit: '$60/1k' },
  { name: 'Nano Banana (Gemini 2.5 Flash Image)', vendor: 'Google', elo: 1164, category: 'image', pricePerUnit: '$39/1k' },
  { name: 'ImagineArt 1.5 Preview', vendor: 'ImagineArt', elo: 1158, category: 'image', pricePerUnit: '$30/1k' },
  { name: 'Imagen 4 Preview', vendor: 'Google', elo: 1158, category: 'image', pricePerUnit: '$40/1k' },
  { name: 'Z-Image Turbo', vendor: 'Alibaba', elo: 1153, category: 'image', pricePerUnit: '$5/1k' },
  { name: 'GPT-5 (image)', vendor: 'OpenAI', elo: 1147, category: 'image' },
  { name: 'FLUX.2 [dev]', vendor: 'Black Forest Labs', elo: 1146, category: 'image', pricePerUnit: '$12/1k' },
  { name: 'Seedream 3.0', vendor: 'ByteDance Seed', elo: 1145, category: 'image', pricePerUnit: '$30/1k' },
  { name: 'Wan 2.5 Preview', vendor: 'Alibaba', elo: 1139, category: 'image' },
  { name: 'Vivago 2.1', vendor: 'HiDream', elo: 1134, category: 'image', pricePerUnit: '$35/1k' },
  { name: 'Kolors 2.1', vendor: 'Kuaishou', elo: 1128, category: 'image', pricePerUnit: '$14/1k' },
  { name: 'Lucid Origin Ultra', vendor: 'Leonardo.Ai', elo: 1125, category: 'image', pricePerUnit: '$87/1k' },
  { name: 'FLUX.1 Kontext [max]', vendor: 'Black Forest Labs', elo: 1120, category: 'image' },
  // Дополнительные известные модели для сопоставления
  { name: 'FLUX.1.1 [pro]', vendor: 'Black Forest Labs', elo: 1180, category: 'image' },
  { name: 'FLUX.1 [pro]', vendor: 'Black Forest Labs', elo: 1128, category: 'image' },
  { name: 'FLUX.1 [schnell]', vendor: 'Black Forest Labs', elo: 1100, category: 'image' },
  { name: 'Ideogram 3.0', vendor: 'Ideogram', elo: 1150, category: 'image' },
  { name: 'Ideogram 2.0', vendor: 'Ideogram', elo: 1120, category: 'image' },
  { name: 'SDXL', vendor: 'Stability AI', elo: 1000, category: 'image' },
  { name: 'SD 3.5 Large', vendor: 'Stability AI', elo: 1080, category: 'image' },
  { name: 'SD 3.5 Medium', vendor: 'Stability AI', elo: 1060, category: 'image' },
  { name: 'Recraft V3', vendor: 'Recraft', elo: 1100, category: 'image' },
];

// ==================== ГЕНЕРАЦИЯ ВИДЕО (Text-to-Video) ====================
export const VIDEO_LEADERBOARD: LeaderboardModel[] = [
  { name: 'Runway Gen-4.5', vendor: 'Runway', elo: 1243, category: 'video' },
  { name: 'Veo 3 (No Audio)', vendor: 'Google', elo: 1226, category: 'video', pricePerUnit: '$12/min' },
  { name: 'Kling 2.5 Turbo 1080p', vendor: 'Kuaishou', elo: 1225, category: 'video' },
  { name: 'Veo 3.1 Preview (No Audio)', vendor: 'Google', elo: 1222, category: 'video', pricePerUnit: '$12/min' },
  { name: 'Veo 3.1 Fast Preview', vendor: 'Google', elo: 1219, category: 'video', pricePerUnit: '$9/min' },
  { name: 'Luma Ray 3', vendor: 'Luma Labs', elo: 1212, category: 'video' },
  { name: 'Sora 2 Pro (No Audio)', vendor: 'OpenAI', elo: 1206, category: 'video', pricePerUnit: '$30/min' },
  { name: 'Hailuo 02 Standard', vendor: 'MiniMax', elo: 1200, category: 'video', pricePerUnit: '$2.8/min' },
  { name: 'Hailuo 2.3', vendor: 'MiniMax', elo: 1185, category: 'video', pricePerUnit: '$2.8/min' },
  { name: 'Veo 3 Fast Preview', vendor: 'Google', elo: 1182, category: 'video', pricePerUnit: '$9/min' },
  { name: 'Waver 1.0', vendor: 'ByteDance', elo: 1180, category: 'video' },
  { name: 'Hailuo 02 Pro', vendor: 'MiniMax', elo: 1179, category: 'video', pricePerUnit: '$4.9/min' },
  { name: 'Sora 2 (October)', vendor: 'OpenAI', elo: 1178, category: 'video', pricePerUnit: '$6/min' },
  { name: 'Wan 2.5 Video Preview', vendor: 'Alibaba', elo: 1178, category: 'video' },
  { name: 'PixVerse V5', vendor: 'PixVerse', elo: 1178, category: 'video' },
  { name: 'Vidu Q2', vendor: 'Vidu', elo: 1175, category: 'video', pricePerUnit: '$6.1/min' },
  { name: 'LTX-2 Pro (No Audio)', vendor: 'Lightricks', elo: 1170, category: 'video' },
  { name: 'Seedance 1.0', vendor: 'ByteDance Seed', elo: 1166, category: 'video', pricePerUnit: '$7.32/min' },
  { name: 'LTX-2 Fast (No Audio)', vendor: 'Lightricks', elo: 1161, category: 'video' },
  { name: 'Kling 2.1 Master', vendor: 'Kuaishou', elo: 1158, category: 'video', pricePerUnit: '$16.8/min' },
  // Дополнительные для сопоставления
  { name: 'Kling 2.5 Pro', vendor: 'Kuaishou', elo: 1236, category: 'video' },
  { name: 'Kling 2.1 Pro', vendor: 'Kuaishou', elo: 1218, category: 'video' },
  { name: 'Kling 2.0 Pro', vendor: 'Kuaishou', elo: 1190, category: 'video' },
  { name: 'LTX-Video 2', vendor: 'Lightricks', elo: 1170, category: 'video' },
  { name: 'LTX-Video', vendor: 'Lightricks', elo: 1090, category: 'video' },
  { name: 'HunyuanVideo', vendor: 'Tencent', elo: 1167, category: 'video' },
  { name: 'CogVideoX 1.5', vendor: 'Zhipu AI', elo: 1158, category: 'video' },
  { name: 'CogVideoX 5B', vendor: 'Zhipu AI', elo: 1100, category: 'video' },
  { name: 'Mochi 1 Preview', vendor: 'Genmo', elo: 1080, category: 'video' },
  { name: 'Wan 2.1', vendor: 'Alibaba', elo: 1120, category: 'video' },
  { name: 'AnimateDiff', vendor: 'Community', elo: 950, category: 'video' },
  { name: 'Hailuo T2V Director', vendor: 'MiniMax', elo: 1224, category: 'video' },
  { name: 'Hailuo T2V 01', vendor: 'MiniMax', elo: 1215, category: 'video' },
];

// ==================== ГЕНЕРАЦИЯ МУЗЫКИ (Text-to-Music) ====================
export const MUSIC_LEADERBOARD: LeaderboardModel[] = [
  { name: 'Suno V4.5', vendor: 'Suno', elo: 1109, category: 'music' },
  { name: 'Eleven Music', vendor: 'ElevenLabs', elo: 1067, category: 'music' },
  { name: 'FUZZ-1.1 Pro', vendor: 'Producer.ai', elo: 1055, category: 'music' },
  { name: 'FUZZ-2.0 Raw', vendor: 'Producer.ai', elo: 1040, category: 'music' },
  { name: 'FUZZ-2.0', vendor: 'Producer.ai', elo: 1022, category: 'music' },
  { name: 'Lyria 2', vendor: 'Google', elo: 1000, category: 'music' },
  { name: 'Udio v1.5 Allegro', vendor: 'Udio', elo: 982, category: 'music' },
  { name: 'Sonauto V2.1', vendor: 'Sonauto', elo: 943, category: 'music' },
  { name: 'Stable Audio 2.0', vendor: 'Stability.ai', elo: 932, category: 'music' },
  { name: 'MusicGen', vendor: 'Meta', elo: 832, category: 'music' },
  // Дополнительные для сопоставления
  { name: 'Stable Audio 2', vendor: 'Stability AI', elo: 947, category: 'music' },
  { name: 'MusicGen Stereo', vendor: 'Meta', elo: 870, category: 'music' },
  { name: 'MusicGen Melody', vendor: 'Meta', elo: 850, category: 'music' },
  { name: 'Bark', vendor: 'Suno AI', elo: 800, category: 'music' },
  { name: 'Riffusion', vendor: 'Riffusion', elo: 750, category: 'music' },
];

// ==================== ГОЛОС / TTS (Text-to-Speech) ====================
export const TTS_LEADERBOARD: LeaderboardModel[] = [
  { name: 'Inworld TTS 1 Max', vendor: 'Inworld', elo: 1164, category: 'tts', pricePerUnit: '$10/1M chars' },
  { name: 'MiniMax Speech 2.6 HD', vendor: 'MiniMax', elo: 1150, category: 'tts', pricePerUnit: '$100/1M chars' },
  { name: 'MiniMax Speech 2.6 Turbo', vendor: 'MiniMax', elo: 1148, category: 'tts', pricePerUnit: '$60/1M chars' },
  { name: 'MiniMax Speech-02-HD', vendor: 'MiniMax', elo: 1124, category: 'tts', pricePerUnit: '$100/1M chars' },
  { name: 'MiniMax Speech-02-Turbo', vendor: 'MiniMax', elo: 1120, category: 'tts', pricePerUnit: '$60/1M chars' },
  { name: 'ElevenLabs Multilingual v2', vendor: 'ElevenLabs', elo: 1112, category: 'tts', pricePerUnit: '$206/1M chars' },
  { name: 'OpenAI TTS-1', vendor: 'OpenAI', elo: 1110, category: 'tts', pricePerUnit: '$15/1M chars' },
  { name: 'ElevenLabs v3', vendor: 'ElevenLabs', elo: 1109, category: 'tts', pricePerUnit: '$206/1M chars' },
  { name: 'Inworld TTS 1', vendor: 'Inworld', elo: 1108, category: 'tts', pricePerUnit: '$5/1M chars' },
  { name: 'ElevenLabs Turbo v2.5', vendor: 'ElevenLabs', elo: 1103, category: 'tts', pricePerUnit: '$103/1M chars' },
  { name: 'ElevenLabs Flash v2.5', vendor: 'ElevenLabs', elo: 1095, category: 'tts', pricePerUnit: '$103/1M chars' },
  { name: 'Fish Audio OpenAudio S1', vendor: 'Fish Audio', elo: 1077, category: 'tts', pricePerUnit: '$15/1M chars' },
  { name: 'Amazon Polly Generative', vendor: 'Amazon', elo: 1063, category: 'tts', pricePerUnit: '$30/1M chars' },
  { name: 'MiniMax T2A-01-HD', vendor: 'MiniMax', elo: 1061, category: 'tts', pricePerUnit: '$50/1M chars' },
  // Дополнительные для сопоставления
  { name: 'Coqui XTTS-V2', vendor: 'Coqui', elo: 1082, category: 'tts' },
  { name: 'Tortoise TTS', vendor: 'Community', elo: 950, category: 'tts' },
  { name: 'Parler TTS', vendor: 'Parler TTS', elo: 900, category: 'tts' },
  { name: 'StyleTTS 2', vendor: 'StyleTTS2', elo: 880, category: 'tts' },
  { name: 'Kokoro TTS', vendor: 'Kokoro', elo: 850, category: 'tts' },
];

// ==================== ОБЪЕДИНЁННЫЙ ЛИДЕРБОРД ====================
export const ALL_LEADERBOARD: LeaderboardModel[] = [
  ...LLM_LEADERBOARD,
  ...VISION_LEADERBOARD,
  ...CODE_LEADERBOARD,
  ...IMAGE_LEADERBOARD,
  ...VIDEO_LEADERBOARD,
  ...MUSIC_LEADERBOARD,
  ...TTS_LEADERBOARD,
];

/**
 * Поиск модели в лидерборде по названию (нечёткий поиск)
 */
export function findInLeaderboard(modelName: string): LeaderboardModel | undefined {
  const normalized = modelName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return ALL_LEADERBOARD.find(m => {
    const leaderboardNorm = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Точное совпадение или частичное
    return leaderboardNorm === normalized || 
           leaderboardNorm.includes(normalized) || 
           normalized.includes(leaderboardNorm);
  });
}

/**
 * Получить ELO рейтинг модели из лидерборда
 */
export function getLeaderboardElo(modelName: string): number | undefined {
  const found = findInLeaderboard(modelName);
  return found?.elo;
}
