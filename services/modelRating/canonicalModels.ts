/**
 * Единая база канонических моделей (Master Registry)
 * 
 * Это центральный источник правды для классификации моделей.
 * Каждая модель имеет:
 * - Канонический ID и название
 * - Правильную категорию и модальность
 * - Маппинг на ID у разных провайдеров
 * 
 * Провайдеры используют эту базу для:
 * 1. Определения категории модели
 * 2. Сравнения цен одной модели у разных провайдеров
 * 3. Группировки по семействам
 */

export type ModelCategory = 'text' | 'image' | 'video' | 'audio' | 'code' | 'multimodal';

export type ModelModality = 
  | 'text↔text'      // LLM
  | 'text→image'     // Image generation
  | 'image→text'     // Image understanding
  | 'text→video'     // Video generation
  | 'text→audio'     // TTS
  | 'audio→text'     // STT
  | 'text→music'     // Music generation
  | 'image→image'    // Image editing/upscale
  | 'multimodal';    // Multiple modalities

export interface CanonicalModel {
  /** Канонический ID (уникальный, человекочитаемый) */
  id: string;
  
  /** Отображаемое название */
  name: string;
  
  /** Категория модели */
  category: ModelCategory;
  
  /** Модальность (что на входе → что на выходе) */
  modality: ModelModality;
  
  /** Вендор/компания-разработчик */
  vendor: string;
  
  /** Семейство моделей */
  family: string;
  
  /** Размер контекста (для LLM) */
  contextLength?: number;
  
  /** Максимум выходных токенов */
  maxOutputTokens?: number;
  
  /** Описание */
  description?: string;
  
  /** Дата релиза (YYYY-MM-DD) */
  releaseDate?: string;
  
  /** Маппинг на ID у провайдеров */
  providerIds: {
    openrouter?: string | string[];
    together?: string | string[];
    groq?: string | string[];
    replicate?: string | string[];
    fireworks?: string | string[];
    fal?: string | string[];
    kie?: string | string[];
    laozhang?: string | string[];
    api2d?: string | string[];
  };
}

// =============================================================================
// 📝 ТЕКСТОВЫЕ МОДЕЛИ (LLM)
// =============================================================================

const TEXT_MODELS: CanonicalModel[] = [
  // --- OpenAI GPT ---
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    category: 'text',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    contextLength: 128000,
    maxOutputTokens: 16384,
    description: 'Flagship multimodal model from OpenAI',
    releaseDate: '2024-05-13',
    providerIds: {
      openrouter: 'openai/gpt-4o',
      together: 'openai/gpt-4o',
      laozhang: 'gpt-4o',
      api2d: 'gpt-4o',
    },
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    category: 'text',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    contextLength: 128000,
    maxOutputTokens: 16384,
    description: 'Affordable and intelligent small model',
    releaseDate: '2024-07-18',
    providerIds: {
      openrouter: 'openai/gpt-4o-mini',
      together: 'openai/gpt-4o-mini',
      groq: 'gpt-4o-mini',
      laozhang: 'gpt-4o-mini',
      api2d: 'gpt-4o-mini',
    },
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    category: 'text',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    contextLength: 128000,
    maxOutputTokens: 4096,
    providerIds: {
      openrouter: 'openai/gpt-4-turbo',
      laozhang: 'gpt-4-turbo',
      api2d: 'gpt-4-turbo',
    },
  },
  {
    id: 'o1',
    name: 'o1',
    category: 'text',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    contextLength: 200000,
    maxOutputTokens: 100000,
    description: 'OpenAI reasoning model',
    releaseDate: '2024-12-05',
    providerIds: {
      openrouter: 'openai/o1',
      laozhang: 'o1',
    },
  },
  {
    id: 'o1-mini',
    name: 'o1 Mini',
    category: 'text',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    contextLength: 128000,
    maxOutputTokens: 65536,
    description: 'Smaller reasoning model',
    providerIds: {
      openrouter: 'openai/o1-mini',
      laozhang: 'o1-mini',
    },
  },
  {
    id: 'o3-mini',
    name: 'o3 Mini',
    category: 'text',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    contextLength: 200000,
    maxOutputTokens: 100000,
    description: 'Next-gen reasoning model',
    releaseDate: '2025-01-31',
    providerIds: {
      openrouter: 'openai/o3-mini',
      laozhang: 'o3-mini',
    },
  },

  // --- Anthropic Claude ---
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Anthropic',
    family: 'Claude',
    contextLength: 200000,
    maxOutputTokens: 8192,
    description: 'Most intelligent Claude model',
    releaseDate: '2024-10-22',
    providerIds: {
      openrouter: 'anthropic/claude-3.5-sonnet',
      laozhang: 'claude-3-5-sonnet-20241022',
      api2d: 'claude-3-5-sonnet-20241022',
    },
  },
  {
    id: 'claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Anthropic',
    family: 'Claude',
    contextLength: 200000,
    maxOutputTokens: 8192,
    description: 'Fast and affordable Claude',
    releaseDate: '2024-11-04',
    providerIds: {
      openrouter: 'anthropic/claude-3.5-haiku',
      laozhang: 'claude-3-5-haiku-20241022',
    },
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Anthropic',
    family: 'Claude',
    contextLength: 200000,
    maxOutputTokens: 4096,
    description: 'Most powerful Claude 3',
    providerIds: {
      openrouter: 'anthropic/claude-3-opus',
      laozhang: 'claude-3-opus-20240229',
    },
  },

  // --- Google Gemini ---
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Google',
    family: 'Gemini',
    contextLength: 1000000,
    maxOutputTokens: 8192,
    description: 'Latest Gemini with thinking capabilities',
    releaseDate: '2024-12-11',
    providerIds: {
      openrouter: 'google/gemini-2.0-flash-001',
      laozhang: 'gemini-2.0-flash',
    },
  },
  {
    id: 'gemini-2.0-flash-thinking',
    name: 'Gemini 2.0 Flash Thinking',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Google',
    family: 'Gemini',
    contextLength: 1000000,
    maxOutputTokens: 65536,
    description: 'Gemini with extended thinking',
    providerIds: {
      openrouter: 'google/gemini-2.0-flash-thinking-exp',
      laozhang: 'gemini-2.0-flash-thinking-exp',
    },
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Google',
    family: 'Gemini',
    contextLength: 2000000,
    maxOutputTokens: 8192,
    description: 'Gemini with 2M context window',
    providerIds: {
      openrouter: 'google/gemini-pro-1.5',
      laozhang: 'gemini-1.5-pro',
    },
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Google',
    family: 'Gemini',
    contextLength: 1000000,
    maxOutputTokens: 8192,
    providerIds: {
      openrouter: 'google/gemini-flash-1.5',
      laozhang: 'gemini-1.5-flash',
    },
  },

  // --- Meta Llama ---
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Meta',
    family: 'Llama',
    contextLength: 128000,
    maxOutputTokens: 4096,
    description: 'Latest Llama 3.3 instruction-tuned',
    releaseDate: '2024-12-06',
    providerIds: {
      openrouter: 'meta-llama/llama-3.3-70b-instruct',
      together: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      groq: 'llama-3.3-70b-versatile',
      fireworks: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
      replicate: 'meta/llama-3.3-70b-instruct',
    },
  },
  {
    id: 'llama-3.1-405b',
    name: 'Llama 3.1 405B',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Meta',
    family: 'Llama',
    contextLength: 128000,
    maxOutputTokens: 4096,
    description: 'Largest open-source LLM',
    providerIds: {
      openrouter: 'meta-llama/llama-3.1-405b-instruct',
      together: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
      fireworks: 'accounts/fireworks/models/llama-v3p1-405b-instruct',
      replicate: 'meta/meta-llama-3.1-405b-instruct',
    },
  },
  {
    id: 'llama-3.1-70b',
    name: 'Llama 3.1 70B',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Meta',
    family: 'Llama',
    contextLength: 128000,
    maxOutputTokens: 4096,
    providerIds: {
      openrouter: 'meta-llama/llama-3.1-70b-instruct',
      together: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      groq: 'llama-3.1-70b-versatile',
      fireworks: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
      replicate: 'meta/meta-llama-3.1-70b-instruct',
    },
  },
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Meta',
    family: 'Llama',
    contextLength: 128000,
    maxOutputTokens: 4096,
    providerIds: {
      openrouter: 'meta-llama/llama-3.1-8b-instruct',
      together: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      groq: 'llama-3.1-8b-instant',
      fireworks: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
      replicate: 'meta/meta-llama-3.1-8b-instruct',
    },
  },

  // --- DeepSeek ---
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    category: 'text',
    modality: 'text↔text',
    vendor: 'DeepSeek',
    family: 'DeepSeek',
    contextLength: 64000,
    maxOutputTokens: 8192,
    description: 'DeepSeek flagship model',
    releaseDate: '2024-12-26',
    providerIds: {
      openrouter: 'deepseek/deepseek-chat',
      together: 'deepseek-ai/DeepSeek-V3',
      laozhang: 'deepseek-chat',
    },
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    category: 'text',
    modality: 'text↔text',
    vendor: 'DeepSeek',
    family: 'DeepSeek',
    contextLength: 64000,
    maxOutputTokens: 8192,
    description: 'DeepSeek reasoning model',
    releaseDate: '2025-01-20',
    providerIds: {
      openrouter: 'deepseek/deepseek-r1',
      together: 'deepseek-ai/DeepSeek-R1',
      groq: 'deepseek-r1-distill-llama-70b',
      fireworks: 'accounts/fireworks/models/deepseek-r1',
      laozhang: 'deepseek-reasoner',
    },
  },

  // --- Mistral ---
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Mistral AI',
    family: 'Mistral',
    contextLength: 128000,
    maxOutputTokens: 4096,
    providerIds: {
      openrouter: 'mistralai/mistral-large',
      together: 'mistralai/Mistral-Large-Instruct-2407',
      laozhang: 'mistral-large-latest',
    },
  },
  {
    id: 'mixtral-8x22b',
    name: 'Mixtral 8x22B',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Mistral AI',
    family: 'Mistral',
    contextLength: 65536,
    maxOutputTokens: 4096,
    description: 'MoE model with 8 experts',
    providerIds: {
      openrouter: 'mistralai/mixtral-8x22b-instruct',
      together: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
      fireworks: 'accounts/fireworks/models/mixtral-8x22b-instruct',
    },
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Mistral AI',
    family: 'Mistral',
    contextLength: 32000,
    providerIds: {
      openrouter: 'mistralai/mixtral-8x7b-instruct',
      together: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      groq: 'mixtral-8x7b-32768',
      fireworks: 'accounts/fireworks/models/mixtral-8x7b-instruct',
      replicate: 'mistralai/mixtral-8x7b-instruct-v0.1',
    },
  },

  // --- Alibaba Qwen ---
  {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    category: 'text',
    modality: 'text↔text',
    vendor: 'Alibaba',
    family: 'Qwen',
    contextLength: 32000,
    providerIds: {
      openrouter: 'qwen/qwen-2.5-72b-instruct',
      together: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
      fireworks: 'accounts/fireworks/models/qwen2p5-72b-instruct',
      replicate: 'qwen/qwen2.5-72b-instruct',
    },
  },
  {
    id: 'qwen-2.5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Alibaba',
    family: 'Qwen',
    contextLength: 32000,
    description: 'Coding-focused Qwen model',
    providerIds: {
      openrouter: 'qwen/qwen-2.5-coder-32b-instruct',
      together: 'Qwen/Qwen2.5-Coder-32B-Instruct',
      fireworks: 'accounts/fireworks/models/qwen2p5-coder-32b-instruct',
      replicate: 'qwen/qwen2.5-coder-32b-instruct',
    },
  },

  // --- xAI Grok ---
  {
    id: 'grok-2',
    name: 'Grok 2',
    category: 'text',
    modality: 'text↔text',
    vendor: 'xAI',
    family: 'Grok',
    contextLength: 131072,
    providerIds: {
      openrouter: 'x-ai/grok-2-1212',
      laozhang: 'grok-2-1212',
    },
  },
  {
    id: 'grok-beta',
    name: 'Grok Beta',
    category: 'text',
    modality: 'text↔text',
    vendor: 'xAI',
    family: 'Grok',
    contextLength: 131072,
    providerIds: {
      openrouter: 'x-ai/grok-beta',
      laozhang: 'grok-beta',
    },
  },
];

// =============================================================================
// 🖼️ МОДЕЛИ ГЕНЕРАЦИИ ИЗОБРАЖЕНИЙ
// =============================================================================

const IMAGE_MODELS: CanonicalModel[] = [
  // --- Flux (Black Forest Labs) ---
  {
    id: 'flux-1.1-pro',
    name: 'Flux 1.1 Pro',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    description: 'Highest quality Flux model',
    providerIds: {
      openrouter: 'black-forest-labs/flux-1.1-pro',
      replicate: 'black-forest-labs/flux-1.1-pro',
      fal: 'fal-ai/flux-pro/v1.1',
      together: 'black-forest-labs/FLUX.1.1-pro',
    },
  },
  {
    id: 'flux-1.1-pro-ultra',
    name: 'Flux 1.1 Pro Ultra',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    description: 'Flux Pro with up to 4MP resolution',
    providerIds: {
      replicate: 'black-forest-labs/flux-1.1-pro-ultra',
      fal: 'fal-ai/flux-pro/v1.1-ultra',
    },
  },
  {
    id: 'flux-dev',
    name: 'Flux Dev',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    providerIds: {
      replicate: 'black-forest-labs/flux-dev',
      fal: 'fal-ai/flux/dev',
      together: 'black-forest-labs/FLUX.1-dev',
    },
  },
  {
    id: 'flux-schnell',
    name: 'Flux Schnell',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    description: 'Fastest Flux model',
    providerIds: {
      replicate: 'black-forest-labs/flux-schnell',
      fal: 'fal-ai/flux/schnell',
      together: 'black-forest-labs/FLUX.1-schnell',
    },
  },

  // --- Stable Diffusion ---
  {
    id: 'sd3.5-large',
    name: 'Stable Diffusion 3.5 Large',
    category: 'image',
    modality: 'text→image',
    vendor: 'Stability AI',
    family: 'Stable Diffusion',
    description: 'SD 3.5 with 8B parameters',
    providerIds: {
      replicate: 'stability-ai/stable-diffusion-3.5-large',
      fal: 'fal-ai/stable-diffusion-v35-large',
    },
  },
  {
    id: 'sd3.5-large-turbo',
    name: 'SD 3.5 Large Turbo',
    category: 'image',
    modality: 'text→image',
    vendor: 'Stability AI',
    family: 'Stable Diffusion',
    providerIds: {
      replicate: 'stability-ai/stable-diffusion-3.5-large-turbo',
      fal: 'fal-ai/stable-diffusion-v35-large/turbo',
    },
  },
  {
    id: 'sdxl',
    name: 'Stable Diffusion XL',
    category: 'image',
    modality: 'text→image',
    vendor: 'Stability AI',
    family: 'Stable Diffusion',
    providerIds: {
      replicate: 'stability-ai/sdxl',
      fal: 'fal-ai/fast-sdxl',
      fireworks: 'accounts/fireworks/models/stable-diffusion-xl-1024-v1-0',
    },
  },

  // --- Ideogram ---
  {
    id: 'ideogram-v2',
    name: 'Ideogram V2',
    category: 'image',
    modality: 'text→image',
    vendor: 'Ideogram',
    family: 'Ideogram',
    description: 'Best text rendering in images',
    providerIds: {
      replicate: 'ideogram-ai/ideogram-v2',
      fal: 'fal-ai/ideogram/v2',
    },
  },
  {
    id: 'ideogram-v2-turbo',
    name: 'Ideogram V2 Turbo',
    category: 'image',
    modality: 'text→image',
    vendor: 'Ideogram',
    family: 'Ideogram',
    providerIds: {
      replicate: 'ideogram-ai/ideogram-v2-turbo',
      fal: 'fal-ai/ideogram/v2/turbo',
    },
  },

  // --- Recraft ---
  {
    id: 'recraft-v3',
    name: 'Recraft V3',
    category: 'image',
    modality: 'text→image',
    vendor: 'Recraft',
    family: 'Recraft',
    description: 'High-quality illustrations and icons',
    providerIds: {
      replicate: 'recraft-ai/recraft-v3',
      fal: 'fal-ai/recraft-v3',
    },
  },
  {
    id: 'recraft-v3-svg',
    name: 'Recraft V3 SVG',
    category: 'image',
    modality: 'text→image',
    vendor: 'Recraft',
    family: 'Recraft',
    description: 'Vector SVG generation',
    providerIds: {
      replicate: 'recraft-ai/recraft-v3-svg',
    },
  },

  // --- DALL-E ---
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    category: 'image',
    modality: 'text→image',
    vendor: 'OpenAI',
    family: 'DALL-E',
    providerIds: {
      openrouter: 'openai/dall-e-3',
      laozhang: 'dall-e-3',
      api2d: 'dall-e-3',
    },
  },

  // --- Midjourney (via proxies) ---
  {
    id: 'midjourney-v6',
    name: 'Midjourney V6',
    category: 'image',
    modality: 'text→image',
    vendor: 'Midjourney',
    family: 'Midjourney',
    providerIds: {
      laozhang: 'midjourney',
      api2d: 'midjourney',
    },
  },
];

// =============================================================================
// 🎬 МОДЕЛИ ГЕНЕРАЦИИ ВИДЕО
// =============================================================================

const VIDEO_MODELS: CanonicalModel[] = [
  {
    id: 'kling-1.6-pro',
    name: 'Kling 1.6 Pro',
    category: 'video',
    modality: 'text→video',
    vendor: 'Kuaishou',
    family: 'Kling',
    providerIds: {
      replicate: 'kwaivgi/kling-v1.6-pro',
      fal: 'fal-ai/kling-video/v1.6/pro',
    },
  },
  {
    id: 'luma-ray2',
    name: 'Luma Ray 2',
    category: 'video',
    modality: 'text→video',
    vendor: 'Luma AI',
    family: 'Luma',
    providerIds: {
      replicate: 'luma/ray-2',
      fal: 'fal-ai/luma-dream-machine/ray-2',
    },
  },
  {
    id: 'minimax-video-01',
    name: 'MiniMax Video-01',
    category: 'video',
    modality: 'text→video',
    vendor: 'MiniMax',
    family: 'MiniMax',
    providerIds: {
      replicate: 'minimax/video-01',
      fal: 'fal-ai/minimax/video-01',
    },
  },
  {
    id: 'hunyuan-video',
    name: 'Hunyuan Video',
    category: 'video',
    modality: 'text→video',
    vendor: 'Tencent',
    family: 'Hunyuan',
    providerIds: {
      replicate: 'tencent/hunyuan-video',
      fal: 'fal-ai/hunyuan-video',
    },
  },
  {
    id: 'cogvideox-5b',
    name: 'CogVideoX-5B',
    category: 'video',
    modality: 'text→video',
    vendor: 'THUDM',
    family: 'CogVideo',
    providerIds: {
      replicate: 'thudm/cogvideox-5b',
      fal: 'fal-ai/cogvideox-5b',
    },
  },
  {
    id: 'stable-video-diffusion',
    name: 'Stable Video Diffusion',
    category: 'video',
    modality: 'text→video',
    vendor: 'Stability AI',
    family: 'Stable Diffusion',
    providerIds: {
      replicate: 'stability-ai/stable-video-diffusion',
      fal: 'fal-ai/stable-video',
    },
  },
];

// =============================================================================
// 🎵 АУДИО МОДЕЛИ
// =============================================================================

const AUDIO_MODELS: CanonicalModel[] = [
  // --- Speech-to-Text ---
  {
    id: 'whisper-large-v3',
    name: 'Whisper Large V3',
    category: 'audio',
    modality: 'audio→text',
    vendor: 'OpenAI',
    family: 'Whisper',
    providerIds: {
      openrouter: 'openai/whisper-large-v3',
      replicate: 'openai/whisper',
      groq: 'whisper-large-v3',
      fal: 'fal-ai/whisper',
    },
  },
  {
    id: 'whisper-large-v3-turbo',
    name: 'Whisper Large V3 Turbo',
    category: 'audio',
    modality: 'audio→text',
    vendor: 'OpenAI',
    family: 'Whisper',
    providerIds: {
      groq: 'whisper-large-v3-turbo',
    },
  },

  // --- Text-to-Speech ---
  {
    id: 'xtts-v2',
    name: 'XTTS v2',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Coqui',
    family: 'XTTS',
    description: 'TTS with voice cloning',
    providerIds: {
      replicate: 'lucataco/xtts-v2',
    },
  },
  {
    id: 'f5-tts',
    name: 'F5-TTS',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Community',
    family: 'F5-TTS',
    providerIds: {
      replicate: 'lucataco/f5-tts',
      fal: 'fal-ai/f5-tts',
    },
  },
  {
    id: 'bark',
    name: 'Bark',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Suno',
    family: 'Bark',
    description: 'TTS with emotions and effects',
    providerIds: {
      replicate: 'suno-ai/bark',
    },
  },

  // --- Music Generation ---
  {
    id: 'musicgen',
    name: 'MusicGen',
    category: 'audio',
    modality: 'text→music',
    vendor: 'Meta',
    family: 'MusicGen',
    providerIds: {
      replicate: 'meta/musicgen',
      fal: 'fal-ai/musicgen',
    },
  },
  {
    id: 'musicgen-stereo-large',
    name: 'MusicGen Stereo Large',
    category: 'audio',
    modality: 'text→music',
    vendor: 'Meta',
    family: 'MusicGen',
    providerIds: {
      replicate: 'meta/musicgen-stereo-large',
    },
  },
];

// =============================================================================
// 💻 МОДЕЛИ ДЛЯ КОДА
// =============================================================================

const CODE_MODELS: CanonicalModel[] = [
  {
    id: 'codellama-70b',
    name: 'CodeLlama 70B',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Meta',
    family: 'CodeLlama',
    contextLength: 16000,
    providerIds: {
      openrouter: 'meta-llama/codellama-70b-instruct',
      together: 'codellama/CodeLlama-70b-Instruct-hf',
      replicate: 'meta/codellama-70b-instruct',
    },
  },
  {
    id: 'codestral',
    name: 'Codestral',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Mistral AI',
    family: 'Mistral',
    contextLength: 32000,
    providerIds: {
      openrouter: 'mistralai/codestral-latest',
      together: 'mistralai/Codestral-22B-v0.1',
      fireworks: 'accounts/fireworks/models/codestral-22b',
    },
  },
  {
    id: 'starcoder2-15b',
    name: 'StarCoder2 15B',
    category: 'code',
    modality: 'text↔text',
    vendor: 'BigCode',
    family: 'StarCoder',
    contextLength: 16000,
    providerIds: {
      openrouter: 'bigcode/starcoder2-15b-instruct-v0.1',
      together: 'bigcode/starcoder2-15b-instruct-v0.1',
    },
  },
];

// =============================================================================
// 🔮 МУЛЬТИМОДАЛЬНЫЕ МОДЕЛИ
// =============================================================================

const MULTIMODAL_MODELS: CanonicalModel[] = [
  {
    id: 'llava-1.6-34b',
    name: 'LLaVA 1.6 34B',
    category: 'multimodal',
    modality: 'multimodal',
    vendor: 'Community',
    family: 'LLaVA',
    description: 'Vision-Language model',
    providerIds: {
      openrouter: 'liuhaotian/llava-yi-34b',
      together: 'llava-hf/llava-v1.6-34b-hf',
    },
  },
  {
    id: 'moondream2',
    name: 'Moondream 2',
    category: 'multimodal',
    modality: 'image→text',
    vendor: 'vikhyatk',
    family: 'Moondream',
    description: 'Compact vision model',
    providerIds: {
      replicate: 'vikhyatk/moondream2',
    },
  },
  {
    id: 'blip-2',
    name: 'BLIP-2',
    category: 'multimodal',
    modality: 'image→text',
    vendor: 'Salesforce',
    family: 'BLIP',
    description: 'Image captioning and VQA',
    providerIds: {
      replicate: 'salesforce/blip-2',
    },
  },
];

// =============================================================================
// ЭКСПОРТ
// =============================================================================

/** Все канонические модели */
export const CANONICAL_MODELS: CanonicalModel[] = [
  ...TEXT_MODELS,
  ...IMAGE_MODELS,
  ...VIDEO_MODELS,
  ...AUDIO_MODELS,
  ...CODE_MODELS,
  ...MULTIMODAL_MODELS,
];

/** Индекс для быстрого поиска по каноническому ID */
export const CANONICAL_BY_ID = new Map<string, CanonicalModel>(
  CANONICAL_MODELS.map(m => [m.id, m])
);

/** 
 * Поиск канонической модели по ID провайдера
 * @param providerId ID провайдера (например 'openrouter')
 * @param modelId ID модели у провайдера
 */
export const findCanonicalByProviderId = (
  providerId: string,
  modelId: string
): CanonicalModel | undefined => {
  const normalizedModelId = modelId.toLowerCase();
  
  for (const model of CANONICAL_MODELS) {
    const providerMapping = model.providerIds[providerId as keyof typeof model.providerIds];
    if (!providerMapping) continue;
    
    const ids = Array.isArray(providerMapping) ? providerMapping : [providerMapping];
    for (const id of ids) {
      if (id.toLowerCase() === normalizedModelId) {
        return model;
      }
    }
  }
  
  return undefined;
};

/**
 * Получить все ID модели у конкретного провайдера
 */
export const getProviderModelIds = (
  canonicalId: string,
  providerId: string
): string[] => {
  const model = CANONICAL_BY_ID.get(canonicalId);
  if (!model) return [];
  
  const mapping = model.providerIds[providerId as keyof typeof model.providerIds];
  if (!mapping) return [];
  
  return Array.isArray(mapping) ? mapping : [mapping];
};

/**
 * Найти все провайдеры, где доступна модель
 */
export const getModelProviders = (canonicalId: string): string[] => {
  const model = CANONICAL_BY_ID.get(canonicalId);
  if (!model) return [];
  
  return Object.entries(model.providerIds)
    .filter(([_, value]) => value !== undefined)
    .map(([key]) => key);
};
