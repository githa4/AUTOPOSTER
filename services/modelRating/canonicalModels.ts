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
// 🖼️ МОДЕЛИ ГЕНЕРАЦИИ ИЗОБРАЖЕНИЙ (Text-to-Image)
// Источник: https://artificialanalysis.ai/image/leaderboard/text-to-image
// =============================================================================

const IMAGE_MODELS: CanonicalModel[] = [
  // ==========================================================================
  // 🏆 TOP TIER (ELO 1200+)
  // ==========================================================================
  
  // --- OpenAI GPT Image ---
  {
    id: 'gpt-image-1.5-high',
    name: 'GPT Image 1.5 (high)',
    category: 'image',
    modality: 'text→image',
    vendor: 'OpenAI',
    family: 'GPT Image',
    description: '#1 on Artificial Analysis leaderboard',
    releaseDate: '2025-12',
    providerIds: {
      openrouter: 'openai/gpt-image-1.5',
      laozhang: 'gpt-image-1.5',
    },
  },
  {
    id: 'gpt-image-1-high',
    name: 'GPT Image 1 (high)',
    category: 'image',
    modality: 'text→image',
    vendor: 'OpenAI',
    family: 'GPT Image',
    releaseDate: '2025-04',
    providerIds: {
      openrouter: 'openai/gpt-image-1',
      laozhang: 'gpt-image-1',
    },
  },
  {
    id: 'gpt-image-1-mini',
    name: 'GPT Image 1 Mini',
    category: 'image',
    modality: 'text→image',
    vendor: 'OpenAI',
    family: 'GPT Image',
    releaseDate: '2025-10',
    providerIds: {
      openrouter: 'openai/gpt-image-1-mini',
      laozhang: 'gpt-image-1-mini',
    },
  },

  // --- Google Gemini Image / Imagen ---
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro (Gemini 3 Pro Image)',
    category: 'image',
    modality: 'text→image',
    vendor: 'Google',
    family: 'Gemini Image',
    description: '#2 on leaderboard, ELO 1222',
    releaseDate: '2025-11',
    providerIds: {
      openrouter: 'google/nano-banana-pro',
      laozhang: 'gemini-3-pro-image',
    },
  },
  {
    id: 'nano-banana',
    name: 'Nano Banana (Gemini 2.5 Flash Image)',
    category: 'image',
    modality: 'text→image',
    vendor: 'Google',
    family: 'Gemini Image',
    releaseDate: '2025-08',
    providerIds: {
      openrouter: 'google/nano-banana',
      laozhang: 'gemini-2.5-flash-image',
    },
  },
  {
    id: 'imagen-4-ultra',
    name: 'Imagen 4 Ultra Preview',
    category: 'image',
    modality: 'text→image',
    vendor: 'Google',
    family: 'Imagen',
    releaseDate: '2025-06',
    providerIds: {
      openrouter: 'google/imagen-4-ultra',
      laozhang: 'imagen-4-ultra',
    },
  },
  {
    id: 'imagen-4',
    name: 'Imagen 4 Preview',
    category: 'image',
    modality: 'text→image',
    vendor: 'Google',
    family: 'Imagen',
    releaseDate: '2025-06',
    providerIds: {
      openrouter: 'google/imagen-4',
      laozhang: 'imagen-4',
    },
  },
  {
    id: 'imagen-4-fast',
    name: 'Imagen 4 Fast Preview',
    category: 'image',
    modality: 'text→image',
    vendor: 'Google',
    family: 'Imagen',
    releaseDate: '2025-06',
    providerIds: {
      openrouter: 'google/imagen-4-fast',
    },
  },
  {
    id: 'gemini-2.0-flash-image',
    name: 'Gemini 2.0 Flash Image',
    category: 'image',
    modality: 'text→image',
    vendor: 'Google',
    family: 'Gemini Image',
    releaseDate: '2025-05',
    providerIds: {
      openrouter: 'google/gemini-2.0-flash-image',
      laozhang: 'gemini-2.0-flash-image',
    },
  },

  // ==========================================================================
  // 🥇 FLUX (Black Forest Labs) - ELO 1000-1211
  // ==========================================================================
  {
    id: 'flux-2-max',
    name: 'FLUX.2 [max]',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    description: 'Top Flux model, ELO 1211',
    releaseDate: '2025-12',
    providerIds: {
      openrouter: 'black-forest-labs/flux-2-max',
      replicate: 'black-forest-labs/flux-2-max',
      fal: 'fal-ai/flux-2/max',
      together: 'black-forest-labs/FLUX.2-max',
    },
  },
  {
    id: 'flux-2-pro',
    name: 'FLUX.2 [pro]',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    releaseDate: '2025-11',
    providerIds: {
      openrouter: 'black-forest-labs/flux-2-pro',
      replicate: 'black-forest-labs/flux-2-pro',
      fal: 'fal-ai/flux-2/pro',
      together: 'black-forest-labs/FLUX.2-pro',
    },
  },
  {
    id: 'flux-2-flex',
    name: 'FLUX.2 [flex]',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    releaseDate: '2025-11',
    providerIds: {
      replicate: 'black-forest-labs/flux-2-flex',
      fal: 'fal-ai/flux-2/flex',
    },
  },
  {
    id: 'flux-2-dev',
    name: 'FLUX.2 [dev]',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    description: 'Open weights',
    releaseDate: '2025-11',
    providerIds: {
      replicate: 'black-forest-labs/flux-2-dev',
      fal: 'fal-ai/flux-2/dev',
      together: 'black-forest-labs/FLUX.2-dev',
    },
  },
  {
    id: 'flux-1.1-pro-ultra',
    name: 'FLUX1.1 [pro] Ultra',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    description: 'Up to 4MP resolution',
    releaseDate: '2024-11',
    providerIds: {
      openrouter: 'black-forest-labs/flux-1.1-pro-ultra',
      replicate: 'black-forest-labs/flux-1.1-pro-ultra',
      fal: 'fal-ai/flux-pro/v1.1-ultra',
    },
  },
  {
    id: 'flux-1.1-pro',
    name: 'FLUX1.1 [pro]',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    releaseDate: '2024-10',
    providerIds: {
      openrouter: 'black-forest-labs/flux-1.1-pro',
      replicate: 'black-forest-labs/flux-1.1-pro',
      fal: 'fal-ai/flux-pro/v1.1',
      together: 'black-forest-labs/FLUX.1.1-pro',
    },
  },
  {
    id: 'flux-kontext-max',
    name: 'FLUX.1 Kontext [max]',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    description: 'Image editing with context',
    releaseDate: '2025-05',
    providerIds: {
      replicate: 'black-forest-labs/flux-kontext-max',
      fal: 'fal-ai/flux-kontext/max',
    },
  },
  {
    id: 'flux-kontext-pro',
    name: 'FLUX.1 Kontext [pro]',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    releaseDate: '2025-05',
    providerIds: {
      replicate: 'black-forest-labs/flux-kontext-pro',
      fal: 'fal-ai/flux-kontext/pro',
    },
  },
  {
    id: 'flux-dev',
    name: 'FLUX.1 [dev]',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    description: 'Open weights, ELO 1044',
    releaseDate: '2024-08',
    providerIds: {
      openrouter: 'black-forest-labs/flux-1-dev',
      replicate: 'black-forest-labs/flux-dev',
      fal: 'fal-ai/flux/dev',
      together: 'black-forest-labs/FLUX.1-dev',
    },
  },
  {
    id: 'flux-schnell',
    name: 'FLUX.1 [schnell]',
    category: 'image',
    modality: 'text→image',
    vendor: 'Black Forest Labs',
    family: 'Flux',
    description: 'Fastest Flux, open weights, ELO 1000',
    releaseDate: '2024-08',
    providerIds: {
      openrouter: 'black-forest-labs/flux-1-schnell',
      replicate: 'black-forest-labs/flux-schnell',
      fal: 'fal-ai/flux/schnell',
      together: 'black-forest-labs/FLUX.1-schnell',
    },
  },

  // ==========================================================================
  // 🌱 ByteDance Seedream
  // ==========================================================================
  {
    id: 'seedream-4.5',
    name: 'Seedream 4.5',
    category: 'image',
    modality: 'text→image',
    vendor: 'ByteDance',
    family: 'Seedream',
    releaseDate: '2025-12',
    providerIds: {
      fal: 'fal-ai/seedream/v4.5',
    },
  },
  {
    id: 'seedream-4.0',
    name: 'Seedream 4.0',
    category: 'image',
    modality: 'text→image',
    vendor: 'ByteDance',
    family: 'Seedream',
    description: 'ELO 1193',
    releaseDate: '2025-09',
    providerIds: {
      fal: 'fal-ai/seedream/v4',
    },
  },
  {
    id: 'seedream-3.0',
    name: 'Seedream 3.0',
    category: 'image',
    modality: 'text→image',
    vendor: 'ByteDance',
    family: 'Seedream',
    releaseDate: '2025-04',
    providerIds: {
      fal: 'fal-ai/seedream/v3',
    },
  },

  // ==========================================================================
  // 🎨 Ideogram - Best for text rendering
  // ==========================================================================
  {
    id: 'ideogram-3.0',
    name: 'Ideogram 3.0',
    category: 'image',
    modality: 'text→image',
    vendor: 'Ideogram',
    family: 'Ideogram',
    description: 'Best text rendering, ELO 1094',
    releaseDate: '2025-03',
    providerIds: {
      replicate: 'ideogram-ai/ideogram-v3',
      fal: 'fal-ai/ideogram/v3',
    },
  },
  {
    id: 'ideogram-v2',
    name: 'Ideogram V2',
    category: 'image',
    modality: 'text→image',
    vendor: 'Ideogram',
    family: 'Ideogram',
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

  // ==========================================================================
  // 🖌️ Recraft - Illustrations & Icons
  // ==========================================================================
  {
    id: 'recraft-v3',
    name: 'Recraft V3',
    category: 'image',
    modality: 'text→image',
    vendor: 'Recraft',
    family: 'Recraft',
    description: 'High-quality illustrations, ELO 1112',
    releaseDate: '2024-10',
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
      fal: 'fal-ai/recraft-v3-svg',
    },
  },

  // ==========================================================================
  // 🖼️ Stability AI - Stable Diffusion
  // ==========================================================================
  {
    id: 'sd3.5-large',
    name: 'Stable Diffusion 3.5 Large',
    category: 'image',
    modality: 'text→image',
    vendor: 'Stability AI',
    family: 'Stable Diffusion',
    description: 'Open weights, ELO 1030',
    releaseDate: '2024-10',
    providerIds: {
      openrouter: 'stability-ai/stable-diffusion-3.5-large',
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
    id: 'sd3.5-medium',
    name: 'Stable Diffusion 3.5 Medium',
    category: 'image',
    modality: 'text→image',
    vendor: 'Stability AI',
    family: 'Stable Diffusion',
    description: 'Open weights, ELO 929',
    releaseDate: '2024-10',
    providerIds: {
      replicate: 'stability-ai/stable-diffusion-3.5-medium',
      fal: 'fal-ai/stable-diffusion-v35-medium',
    },
  },
  {
    id: 'sdxl',
    name: 'Stable Diffusion XL 1.0',
    category: 'image',
    modality: 'text→image',
    vendor: 'Stability AI',
    family: 'Stable Diffusion',
    description: 'Open weights, ELO 838',
    releaseDate: '2023-07',
    providerIds: {
      openrouter: 'stability-ai/sdxl',
      replicate: 'stability-ai/sdxl',
      fal: 'fal-ai/fast-sdxl',
      fireworks: 'accounts/fireworks/models/stable-diffusion-xl-1024-v1-0',
    },
  },

  // ==========================================================================
  // 🎭 OpenAI DALL-E
  // ==========================================================================
  {
    id: 'dall-e-3-hd',
    name: 'DALL-E 3 HD',
    category: 'image',
    modality: 'text→image',
    vendor: 'OpenAI',
    family: 'DALL-E',
    description: 'ELO 937',
    releaseDate: '2023-09',
    providerIds: {
      openrouter: 'openai/dall-e-3',
      laozhang: 'dall-e-3',
      api2d: 'dall-e-3',
    },
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    category: 'image',
    modality: 'text→image',
    vendor: 'OpenAI',
    family: 'DALL-E',
    description: 'ELO 923',
    releaseDate: '2023-09',
    providerIds: {
      openrouter: 'openai/dall-e-3',
      laozhang: 'dall-e-3',
      api2d: 'dall-e-3',
    },
  },

  // ==========================================================================
  // 🐉 Tencent Hunyuan Image
  // ==========================================================================
  {
    id: 'hunyuan-image-3.0',
    name: 'HunyuanImage 3.0',
    category: 'image',
    modality: 'text→image',
    vendor: 'Tencent',
    family: 'Hunyuan',
    description: 'Open weights, ELO 1112',
    releaseDate: '2025-09',
    providerIds: {
      replicate: 'tencent/hunyuan-image-3',
      fal: 'fal-ai/hunyuan-image/v3',
    },
  },
  {
    id: 'hunyuan-image-2.1',
    name: 'HunyuanImage 2.1',
    category: 'image',
    modality: 'text→image',
    vendor: 'Tencent',
    family: 'Hunyuan',
    description: 'Open weights',
    releaseDate: '2025-09',
    providerIds: {
      replicate: 'tencent/hunyuan-image',
      fal: 'fal-ai/hunyuan-image',
    },
  },

  // ==========================================================================
  // 🏷️ Alibaba Z-Image / Qwen-Image / Wan
  // ==========================================================================
  {
    id: 'z-image-turbo',
    name: 'Z-Image Turbo',
    category: 'image',
    modality: 'text→image',
    vendor: 'Alibaba',
    family: 'Z-Image',
    description: 'Open weights, ELO 1152, $5/1k',
    releaseDate: '2025-12',
    providerIds: {
      fal: 'fal-ai/z-image/turbo',
    },
  },
  {
    id: 'qwen-image',
    name: 'Qwen-Image',
    category: 'image',
    modality: 'text→image',
    vendor: 'Alibaba',
    family: 'Qwen',
    description: 'Open weights, ELO 1062',
    releaseDate: '2025-08',
    providerIds: {
      fal: 'fal-ai/qwen-image',
    },
  },
  {
    id: 'wan-2.5',
    name: 'Wan 2.5 Preview',
    category: 'image',
    modality: 'text→image',
    vendor: 'Alibaba',
    family: 'Wan',
    description: 'ELO 1139',
    releaseDate: '2025-09',
    providerIds: {
      replicate: 'alibaba/wan-2.5',
      fal: 'fal-ai/wan/v2.5',
    },
  },

  // ==========================================================================
  // ✨ Kuaishou Kolors
  // ==========================================================================
  {
    id: 'kolors-2.1',
    name: 'Kolors 2.1',
    category: 'image',
    modality: 'text→image',
    vendor: 'Kuaishou',
    family: 'Kolors',
    description: 'ELO 1128',
    releaseDate: '2025-07',
    providerIds: {
      replicate: 'kuaishou/kolors-2.1',
      fal: 'fal-ai/kolors/v2.1',
    },
  },

  // ==========================================================================
  // 🌟 Luma Photon
  // ==========================================================================
  {
    id: 'luma-photon',
    name: 'Luma Photon',
    category: 'image',
    modality: 'text→image',
    vendor: 'Luma Labs',
    family: 'Luma',
    description: 'ELO 1041',
    releaseDate: '2024-12',
    providerIds: {
      replicate: 'luma/photon',
      fal: 'fal-ai/luma-photon',
    },
  },

  // ==========================================================================
  // 🎆 HiDream Vivago
  // ==========================================================================
  {
    id: 'vivago-2.1',
    name: 'Vivago 2.1',
    category: 'image',
    modality: 'text→image',
    vendor: 'HiDream',
    family: 'Vivago',
    description: 'ELO 1134',
    releaseDate: '2025-10',
    providerIds: {
      fal: 'fal-ai/vivago/v2.1',
    },
  },
  {
    id: 'hidream-i1-dev',
    name: 'HiDream-I1-Dev',
    category: 'image',
    modality: 'text→image',
    vendor: 'HiDream',
    family: 'HiDream',
    description: 'Open weights, ELO 1075',
    releaseDate: '2025-04',
    providerIds: {
      replicate: 'hidream/hidream-i1-dev',
      fal: 'fal-ai/hidream/i1-dev',
    },
  },
  {
    id: 'hidream-i1-fast',
    name: 'HiDream-I1-Fast',
    category: 'image',
    modality: 'text→image',
    vendor: 'HiDream',
    family: 'HiDream',
    description: 'Open weights, ELO 1052',
    releaseDate: '2025-04',
    providerIds: {
      replicate: 'hidream/hidream-i1-fast',
      fal: 'fal-ai/hidream/i1-fast',
    },
  },

  // ==========================================================================
  // 🎪 MiniMax Image
  // ==========================================================================
  {
    id: 'minimax-image-01',
    name: 'MiniMax Image-01',
    category: 'image',
    modality: 'text→image',
    vendor: 'MiniMax',
    family: 'MiniMax',
    description: 'ELO 1054, $10/1k',
    releaseDate: '2025-02',
    providerIds: {
      replicate: 'minimax/image-01',
      fal: 'fal-ai/minimax/image-01',
    },
  },

  // ==========================================================================
  // 🎬 Runway Gen-4 Image
  // ==========================================================================
  {
    id: 'runway-gen4-image',
    name: 'Runway Gen-4 Image',
    category: 'image',
    modality: 'text→image',
    vendor: 'Runway',
    family: 'Runway',
    description: 'ELO 981',
    releaseDate: '2024-11',
    providerIds: {
      fal: 'fal-ai/runway/gen4-image',
    },
  },

  // ==========================================================================
  // 🎯 Midjourney (via proxies)
  // ==========================================================================
  {
    id: 'midjourney-v7',
    name: 'Midjourney v7 Alpha',
    category: 'image',
    modality: 'text→image',
    vendor: 'Midjourney',
    family: 'Midjourney',
    description: 'ELO 1050',
    releaseDate: '2025-04',
    providerIds: {
      laozhang: 'midjourney-v7',
      api2d: 'midjourney-v7',
    },
  },
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

  // ==========================================================================
  // 🔮 Vidu Q2
  // ==========================================================================
  {
    id: 'vidu-q2',
    name: 'Vidu Q2',
    category: 'image',
    modality: 'text→image',
    vendor: 'Vidu',
    family: 'Vidu',
    description: 'ELO 1107',
    releaseDate: '2025-11',
    providerIds: {
      fal: 'fal-ai/vidu/q2',
    },
  },

  // ==========================================================================
  // 🚀 ImagineArt
  // ==========================================================================
  {
    id: 'imagineart-1.5',
    name: 'ImagineArt 1.5 Preview',
    category: 'image',
    modality: 'text→image',
    vendor: 'ImagineArt',
    family: 'ImagineArt',
    description: 'ELO 1158',
    releaseDate: '2025-11',
    providerIds: {
      fal: 'fal-ai/imagineart/v1.5',
    },
  },

  // ==========================================================================
  // 🎨 Playground
  // ==========================================================================
  {
    id: 'playground-v3',
    name: 'Playground v3',
    category: 'image',
    modality: 'text→image',
    vendor: 'Playground AI',
    family: 'Playground',
    description: 'ELO 998',
    releaseDate: '2024-09',
    providerIds: {
      fal: 'fal-ai/playground/v3',
    },
  },

  // ==========================================================================
  // 🌿 NVIDIA Sana
  // ==========================================================================
  {
    id: 'sana-sprint-1.6b',
    name: 'Sana Sprint 1.6B',
    category: 'image',
    modality: 'text→image',
    vendor: 'NVIDIA',
    family: 'Sana',
    description: 'Open weights, ELO 892, $1.5/1k',
    releaseDate: '2025-03',
    providerIds: {
      replicate: 'nvidia/sana-sprint',
      fal: 'fal-ai/sana-sprint',
    },
  },

  // ==========================================================================
  // 🤖 DeepSeek Janus Pro
  // ==========================================================================
  {
    id: 'janus-pro',
    name: 'Janus Pro',
    category: 'image',
    modality: 'text→image',
    vendor: 'DeepSeek',
    family: 'Janus',
    description: 'Open weights, FREE, ELO 669',
    releaseDate: '2025-01',
    providerIds: {
      replicate: 'deepseek/janus-pro',
      fal: 'fal-ai/janus-pro',
    },
  },

  // ==========================================================================
  // 🔧 Bria (Commercial-safe)
  // ==========================================================================
  {
    id: 'bria-fibo',
    name: 'FIBO',
    category: 'image',
    modality: 'text→image',
    vendor: 'Bria',
    family: 'Bria',
    description: 'Open weights, ELO 1052',
    releaseDate: '2025-10',
    providerIds: {
      replicate: 'bria/fibo',
      fal: 'fal-ai/bria/fibo',
    },
  },
  {
    id: 'bria-3.2',
    name: 'Bria 3.2',
    category: 'image',
    modality: 'text→image',
    vendor: 'Bria',
    family: 'Bria',
    description: 'Open weights, ELO 894',
    releaseDate: '2025-07',
    providerIds: {
      replicate: 'bria/bria-3.2',
      fal: 'fal-ai/bria/v3.2',
    },
  },

  // ==========================================================================
  // ⚡ ByteDance Infinity
  // ==========================================================================
  {
    id: 'infinity-8b',
    name: 'Infinity 8B',
    category: 'image',
    modality: 'text→image',
    vendor: 'ByteDance',
    family: 'Infinity',
    description: 'Open weights, ELO 1022, $1.7/1k',
    releaseDate: '2025-02',
    providerIds: {
      replicate: 'bytedance/infinity-8b',
      fal: 'fal-ai/infinity-8b',
    },
  },
];

// =============================================================================
// 🎬 МОДЕЛИ ГЕНЕРАЦИИ ВИДЕО (Text-to-Video)
// Источник: https://artificialanalysis.ai/video/leaderboard/text-to-video
// =============================================================================

const VIDEO_MODELS: CanonicalModel[] = [
  // ==========================================================================
  // 🏆 TOP TIER (ELO 1200+)
  // ==========================================================================
  
  // --- Runway ---
  {
    id: 'runway-gen4.5',
    name: 'Runway Gen-4.5',
    category: 'video',
    modality: 'text→video',
    vendor: 'Runway',
    family: 'Runway',
    description: '#1 on leaderboard, ELO 1243',
    releaseDate: '2025-12',
    providerIds: {
      fal: 'fal-ai/runway/gen4.5',
    },
  },
  {
    id: 'runway-gen4',
    name: 'Runway Gen-4',
    category: 'video',
    modality: 'text→video',
    vendor: 'Runway',
    family: 'Runway',
    providerIds: {
      fal: 'fal-ai/runway/gen4',
    },
  },

  // --- Google Veo ---
  {
    id: 'veo-3',
    name: 'Veo 3',
    category: 'video',
    modality: 'text→video',
    vendor: 'Google',
    family: 'Veo',
    description: 'ELO 1226, $12/min',
    releaseDate: '2025-07',
    providerIds: {
      openrouter: 'google/veo-3',
      fal: 'fal-ai/veo-3',
    },
  },
  {
    id: 'veo-3.1',
    name: 'Veo 3.1 Preview',
    category: 'video',
    modality: 'text→video',
    vendor: 'Google',
    family: 'Veo',
    description: 'ELO 1222',
    releaseDate: '2025-10',
    providerIds: {
      fal: 'fal-ai/veo-3.1',
    },
  },
  {
    id: 'veo-3.1-fast',
    name: 'Veo 3.1 Fast Preview',
    category: 'video',
    modality: 'text→video',
    vendor: 'Google',
    family: 'Veo',
    description: 'ELO 1219, $9/min',
    releaseDate: '2025-10',
    providerIds: {
      fal: 'fal-ai/veo-3.1/fast',
    },
  },
  {
    id: 'veo-3-fast',
    name: 'Veo 3 Fast Preview',
    category: 'video',
    modality: 'text→video',
    vendor: 'Google',
    family: 'Veo',
    description: 'ELO 1182',
    releaseDate: '2025-06',
    providerIds: {
      fal: 'fal-ai/veo-3/fast',
    },
  },

  // --- Kuaishou Kling ---
  {
    id: 'kling-2.5-turbo',
    name: 'Kling 2.5 Turbo 1080p',
    category: 'video',
    modality: 'text→video',
    vendor: 'Kuaishou',
    family: 'Kling',
    description: 'ELO 1225',
    releaseDate: '2025-09',
    providerIds: {
      fal: 'fal-ai/kling-video/v2.5/turbo',
    },
  },
  {
    id: 'kling-2.1-master',
    name: 'Kling 2.1 Master',
    category: 'video',
    modality: 'text→video',
    vendor: 'Kuaishou',
    family: 'Kling',
    description: 'ELO 1158, $16.8/min',
    releaseDate: '2025-05',
    providerIds: {
      replicate: 'kuaishou/kling-2.1-master',
      fal: 'fal-ai/kling-video/v2.1/master',
    },
  },
  {
    id: 'kling-2.0',
    name: 'Kling 2.0',
    category: 'video',
    modality: 'text→video',
    vendor: 'Kuaishou',
    family: 'Kling',
    description: 'ELO 1111',
    releaseDate: '2025-04',
    providerIds: {
      replicate: 'kuaishou/kling-2.0',
      fal: 'fal-ai/kling-video/v2',
    },
  },
  {
    id: 'kling-1.6-pro',
    name: 'Kling 1.6 Pro',
    category: 'video',
    modality: 'text→video',
    vendor: 'Kuaishou',
    family: 'Kling',
    description: 'ELO 1025, $5.88/min',
    releaseDate: '2024-12',
    providerIds: {
      replicate: 'kuaishou/kling-v1.6-pro',
      fal: 'fal-ai/kling-video/v1.6/pro',
    },
  },
  {
    id: 'kling-1.5-pro',
    name: 'Kling 1.5 Pro',
    category: 'video',
    modality: 'text→video',
    vendor: 'Kuaishou',
    family: 'Kling',
    description: 'ELO 1043, $6/min',
    releaseDate: '2024-09',
    providerIds: {
      replicate: 'kuaishou/kling-v1.5-pro',
      fal: 'fal-ai/kling-video/v1.5/pro',
    },
  },

  // --- Luma Labs Ray ---
  {
    id: 'luma-ray3',
    name: 'Luma Ray 3',
    category: 'video',
    modality: 'text→video',
    vendor: 'Luma Labs',
    family: 'Luma',
    description: 'ELO 1212',
    releaseDate: '2025-09',
    providerIds: {
      replicate: 'luma/ray-3',
      fal: 'fal-ai/luma-dream-machine/ray-3',
    },
  },
  {
    id: 'luma-ray2',
    name: 'Luma Ray 2',
    category: 'video',
    modality: 'text→video',
    vendor: 'Luma Labs',
    family: 'Luma',
    description: 'ELO 953, $10.26/min',
    releaseDate: '2025-02',
    providerIds: {
      replicate: 'luma/ray-2',
      fal: 'fal-ai/luma-dream-machine/ray-2',
    },
  },

  // --- OpenAI Sora ---
  {
    id: 'sora-2-pro',
    name: 'Sora 2 Pro',
    category: 'video',
    modality: 'text→video',
    vendor: 'OpenAI',
    family: 'Sora',
    description: 'ELO 1206, $30/min',
    releaseDate: '2025-09',
    providerIds: {
      openrouter: 'openai/sora-2-pro',
      laozhang: 'sora-2-pro',
    },
  },
  {
    id: 'sora-2',
    name: 'Sora 2',
    category: 'video',
    modality: 'text→video',
    vendor: 'OpenAI',
    family: 'Sora',
    description: 'ELO 1178, $6/min',
    releaseDate: '2025-09',
    providerIds: {
      openrouter: 'openai/sora-2',
      laozhang: 'sora-2',
    },
  },
  {
    id: 'sora',
    name: 'Sora',
    category: 'video',
    modality: 'text→video',
    vendor: 'OpenAI',
    family: 'Sora',
    description: 'ELO 1044',
    releaseDate: '2024-12',
    providerIds: {
      laozhang: 'sora',
    },
  },

  // --- MiniMax Hailuo ---
  {
    id: 'hailuo-02-standard',
    name: 'Hailuo 02 Standard',
    category: 'video',
    modality: 'text→video',
    vendor: 'MiniMax',
    family: 'Hailuo',
    description: 'ELO 1200, $2.8/min',
    releaseDate: '2025-06',
    providerIds: {
      replicate: 'minimax/hailuo-02',
      fal: 'fal-ai/minimax/hailuo-02',
    },
  },
  {
    id: 'hailuo-2.3',
    name: 'Hailuo 2.3',
    category: 'video',
    modality: 'text→video',
    vendor: 'MiniMax',
    family: 'Hailuo',
    description: 'ELO 1185',
    releaseDate: '2025-10',
    providerIds: {
      fal: 'fal-ai/minimax/hailuo-2.3',
    },
  },
  {
    id: 'hailuo-02-pro',
    name: 'Hailuo 02 Pro',
    category: 'video',
    modality: 'text→video',
    vendor: 'MiniMax',
    family: 'Hailuo',
    description: 'ELO 1179, $4.9/min',
    releaseDate: '2025-06',
    providerIds: {
      fal: 'fal-ai/minimax/hailuo-02-pro',
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

  // --- ByteDance ---
  {
    id: 'waver-1.0',
    name: 'Waver 1.0',
    category: 'video',
    modality: 'text→video',
    vendor: 'ByteDance',
    family: 'Waver',
    description: 'ELO 1180',
    releaseDate: '2025-08',
    providerIds: {
      fal: 'fal-ai/waver/v1',
    },
  },
  {
    id: 'seedance-1.0',
    name: 'Seedance 1.0',
    category: 'video',
    modality: 'text→video',
    vendor: 'ByteDance',
    family: 'Seedance',
    description: 'ELO 1166, $7.32/min',
    releaseDate: '2025-06',
    providerIds: {
      fal: 'fal-ai/seedance/v1',
    },
  },
  {
    id: 'seedance-1.0-mini',
    name: 'Seedance 1.0 Mini',
    category: 'video',
    modality: 'text→video',
    vendor: 'ByteDance',
    family: 'Seedance',
    description: 'ELO 1089, $2.22/min',
    releaseDate: '2025-06',
    providerIds: {
      fal: 'fal-ai/seedance/v1/mini',
    },
  },

  // --- Alibaba Wan ---
  {
    id: 'wan-video-2.5',
    name: 'Wan 2.5 Video Preview',
    category: 'video',
    modality: 'text→video',
    vendor: 'Alibaba',
    family: 'Wan',
    description: 'ELO 1178',
    releaseDate: '2025-09',
    providerIds: {
      replicate: 'alibaba/wan-video-2.5',
      fal: 'fal-ai/wan-video/v2.5',
    },
  },
  {
    id: 'wan-video-2.2-14b',
    name: 'Wan 2.2 A14B',
    category: 'video',
    modality: 'text→video',
    vendor: 'Alibaba',
    family: 'Wan',
    description: 'Open weights, ELO 1115, $4.8/min',
    releaseDate: '2025-07',
    providerIds: {
      replicate: 'alibaba/wan-video-2.2-14b',
      fal: 'fal-ai/wan-video/v2.2/14b',
    },
  },
  {
    id: 'wan-video-2.2-5b',
    name: 'Wan 2.2 5B',
    category: 'video',
    modality: 'text→video',
    vendor: 'Alibaba',
    family: 'Wan',
    description: 'Open weights, ELO 961, $1.8/min',
    releaseDate: '2025-07',
    providerIds: {
      replicate: 'alibaba/wan-video-2.2-5b',
      fal: 'fal-ai/wan-video/v2.2/5b',
    },
  },
  {
    id: 'wan-video-2.1-14b',
    name: 'Wan 2.1 14B',
    category: 'video',
    modality: 'text→video',
    vendor: 'Alibaba',
    family: 'Wan',
    description: 'Open weights, ELO 1025',
    releaseDate: '2025-02',
    providerIds: {
      replicate: 'alibaba/wan-2.1-t2v-14b',
      fal: 'fal-ai/wan/v2.1/14b',
    },
  },

  // --- PixVerse ---
  {
    id: 'pixverse-v5',
    name: 'PixVerse V5',
    category: 'video',
    modality: 'text→video',
    vendor: 'PixVerse',
    family: 'PixVerse',
    description: 'ELO 1178',
    releaseDate: '2025-08',
    providerIds: {
      fal: 'fal-ai/pixverse/v5',
    },
  },
  {
    id: 'pixverse-v4.5',
    name: 'PixVerse V4.5',
    category: 'video',
    modality: 'text→video',
    vendor: 'PixVerse',
    family: 'PixVerse',
    description: 'ELO 1081, $4.8/min',
    releaseDate: '2025-05',
    providerIds: {
      fal: 'fal-ai/pixverse/v4.5',
    },
  },

  // --- Vidu ---
  {
    id: 'vidu-video-q2',
    name: 'Vidu Q2 Video',
    category: 'video',
    modality: 'text→video',
    vendor: 'Vidu',
    family: 'Vidu',
    description: 'ELO 1174, $6.1/min',
    releaseDate: '2025-10',
    providerIds: {
      fal: 'fal-ai/vidu/q2/video',
    },
  },
  {
    id: 'vidu-video-q1',
    name: 'Vidu Q1 Video',
    category: 'video',
    modality: 'text→video',
    vendor: 'Vidu',
    family: 'Vidu',
    description: 'ELO 1017, $4.8/min',
    releaseDate: '2025-04',
    providerIds: {
      fal: 'fal-ai/vidu/q1/video',
    },
  },

  // --- Lightricks LTX ---
  {
    id: 'ltx-2-pro',
    name: 'LTX-2 Pro',
    category: 'video',
    modality: 'text→video',
    vendor: 'Lightricks',
    family: 'LTX',
    description: 'ELO 1170',
    releaseDate: '2025-10',
    providerIds: {
      replicate: 'lightricks/ltx-2-pro',
      fal: 'fal-ai/ltx-video/v2/pro',
    },
  },
  {
    id: 'ltx-2-fast',
    name: 'LTX-2 Fast',
    category: 'video',
    modality: 'text→video',
    vendor: 'Lightricks',
    family: 'LTX',
    description: 'ELO 1161',
    releaseDate: '2025-10',
    providerIds: {
      replicate: 'lightricks/ltx-2-fast',
      fal: 'fal-ai/ltx-video/v2/fast',
    },
  },

  // --- Pika Art ---
  {
    id: 'pika-2.0',
    name: 'Pika 2.0',
    category: 'video',
    modality: 'text→video',
    vendor: 'Pika Art',
    family: 'Pika',
    description: 'ELO 1031',
    releaseDate: '2024-12',
    providerIds: {
      laozhang: 'pika-2',
    },
  },
  {
    id: 'pika-2.2',
    name: 'Pika 2.2',
    category: 'video',
    modality: 'text→video',
    vendor: 'Pika Art',
    family: 'Pika',
    description: 'ELO 929',
    releaseDate: '2025-02',
    providerIds: {
      laozhang: 'pika-2.2',
    },
  },

  // --- Leonardo ---
  {
    id: 'leonardo-motion-2.0',
    name: 'Leonardo Motion 2.0',
    category: 'video',
    modality: 'text→video',
    vendor: 'Leonardo.Ai',
    family: 'Leonardo',
    description: 'ELO 1036, $5.38/min',
    releaseDate: '2025-07',
    providerIds: {
      fal: 'fal-ai/leonardo/motion-2.0',
    },
  },

  // --- Moonvalley ---
  {
    id: 'marey',
    name: 'Marey',
    category: 'video',
    modality: 'text→video',
    vendor: 'Moonvalley',
    family: 'Moonvalley',
    description: 'ELO 1080, $18/min',
    releaseDate: '2025-07',
    providerIds: {
      fal: 'fal-ai/moonvalley/marey',
    },
  },

  // --- Tencent Hunyuan Video ---
  {
    id: 'hunyuan-video',
    name: 'Hunyuan Video',
    category: 'video',
    modality: 'text→video',
    vendor: 'Tencent',
    family: 'Hunyuan',
    description: 'Open weights, ELO 1003, $4.8/min',
    releaseDate: '2024-12',
    providerIds: {
      replicate: 'tencent/hunyuan-video',
      fal: 'fal-ai/hunyuan-video',
    },
  },

  // --- Genmo Mochi ---
  {
    id: 'mochi-1',
    name: 'Mochi 1',
    category: 'video',
    modality: 'text→video',
    vendor: 'Genmo',
    family: 'Mochi',
    description: 'Open weights, ELO 1000',
    releaseDate: '2024-10',
    providerIds: {
      replicate: 'genmo/mochi-1',
      fal: 'fal-ai/mochi-1',
    },
  },

  // --- StepFun ---
  {
    id: 'step-video-t2v',
    name: 'Step-Video-T2V',
    category: 'video',
    modality: 'text→video',
    vendor: 'StepFun',
    family: 'StepFun',
    description: 'ELO 920, $19.67/min',
    releaseDate: '2025-02',
    providerIds: {
      fal: 'fal-ai/step-video/t2v',
    },
  },

  // --- CogVideoX ---
  {
    id: 'cogvideox-5b',
    name: 'CogVideoX-5B',
    category: 'video',
    modality: 'text→video',
    vendor: 'Z AI',
    family: 'CogVideo',
    description: 'Open weights, ELO 783, $2.4/min',
    releaseDate: '2024-08',
    providerIds: {
      replicate: 'thudm/cogvideox-5b',
      fal: 'fal-ai/cogvideox-5b',
    },
  },

  // --- Pyramid Flow ---
  {
    id: 'pyramid-flow',
    name: 'Pyramid Flow',
    category: 'video',
    modality: 'text→video',
    vendor: 'Open Source',
    family: 'Pyramid Flow',
    description: 'Open weights, ELO 756',
    releaseDate: '2024-10',
    providerIds: {
      replicate: 'pyramid-flow/pyramid-flow',
      fal: 'fal-ai/pyramid-flow',
    },
  },
];

// =============================================================================
// 🎵 АУДИО МОДЕЛИ (Text-to-Speech, Speech-to-Text)
// Источник: https://artificialanalysis.ai/text-to-speech/leaderboard
// =============================================================================

const AUDIO_MODELS: CanonicalModel[] = [
  // ==========================================================================
  // 🗣️ TEXT-TO-SPEECH (TTS)
  // ==========================================================================
  
  // --- TOP TIER (ELO 1100+) ---
  {
    id: 'inworld-tts-1-max',
    name: 'Inworld TTS 1 Max',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Inworld',
    family: 'Inworld TTS',
    description: '#1 TTS, ELO 1165, $10/1M chars',
    releaseDate: '2025-06',
    providerIds: {
      fal: 'fal-ai/inworld/tts-1-max',
    },
  },
  {
    id: 'inworld-tts-1',
    name: 'Inworld TTS 1',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Inworld',
    family: 'Inworld TTS',
    description: 'ELO 1108, $5/1M chars',
    releaseDate: '2025-06',
    providerIds: {
      fal: 'fal-ai/inworld/tts-1',
    },
  },
  {
    id: 'minimax-speech-2.6-hd',
    name: 'MiniMax Speech 2.6 HD',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'MiniMax',
    family: 'MiniMax Speech',
    description: 'ELO 1153, $100/1M chars',
    releaseDate: '2025-10',
    providerIds: {
      fal: 'fal-ai/minimax/speech-2.6-hd',
    },
  },
  {
    id: 'minimax-speech-2.6-turbo',
    name: 'MiniMax Speech 2.6 Turbo',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'MiniMax',
    family: 'MiniMax Speech',
    description: 'ELO 1149, $60/1M chars',
    releaseDate: '2025-10',
    providerIds: {
      fal: 'fal-ai/minimax/speech-2.6-turbo',
    },
  },
  {
    id: 'minimax-speech-02-hd',
    name: 'MiniMax Speech-02-HD',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'MiniMax',
    family: 'MiniMax Speech',
    description: 'ELO 1124',
    releaseDate: '2025-03',
    providerIds: {
      fal: 'fal-ai/minimax/speech-02-hd',
    },
  },
  {
    id: 'minimax-speech-02-turbo',
    name: 'MiniMax Speech-02-Turbo',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'MiniMax',
    family: 'MiniMax Speech',
    description: 'ELO 1121',
    releaseDate: '2025-03',
    providerIds: {
      fal: 'fal-ai/minimax/speech-02-turbo',
    },
  },
  {
    id: 'elevenlabs-multilingual-v2',
    name: 'ElevenLabs Multilingual v2',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'ElevenLabs',
    family: 'ElevenLabs',
    description: 'ELO 1113, $206/1M chars',
    releaseDate: '2023-08',
    providerIds: {
      fal: 'fal-ai/elevenlabs/multilingual-v2',
    },
  },
  {
    id: 'elevenlabs-v3',
    name: 'ElevenLabs v3',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'ElevenLabs',
    family: 'ElevenLabs',
    description: 'ELO 1110',
    releaseDate: '2025-09',
    providerIds: {
      fal: 'fal-ai/elevenlabs/v3',
    },
  },
  {
    id: 'elevenlabs-turbo-v2.5',
    name: 'ElevenLabs Turbo v2.5',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'ElevenLabs',
    family: 'ElevenLabs',
    description: 'ELO 1104, $103/1M chars',
    releaseDate: '2024-07',
    providerIds: {
      fal: 'fal-ai/elevenlabs/turbo-v2.5',
    },
  },
  {
    id: 'elevenlabs-flash-v2.5',
    name: 'ElevenLabs Flash v2.5',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'ElevenLabs',
    family: 'ElevenLabs',
    description: 'ELO 1096',
    releaseDate: '2024-12',
    providerIds: {
      fal: 'fal-ai/elevenlabs/flash-v2.5',
    },
  },
  {
    id: 'openai-tts-1',
    name: 'OpenAI TTS-1',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'OpenAI',
    family: 'OpenAI TTS',
    description: 'ELO 1110, $15/1M chars',
    releaseDate: '2023-11',
    providerIds: {
      openrouter: 'openai/tts-1',
      laozhang: 'tts-1',
    },
  },
  {
    id: 'openai-tts-1-hd',
    name: 'OpenAI TTS-1 HD',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'OpenAI',
    family: 'OpenAI TTS',
    description: 'ELO 1059, $30/1M chars',
    releaseDate: '2023-11',
    providerIds: {
      openrouter: 'openai/tts-1-hd',
      laozhang: 'tts-1-hd',
    },
  },
  {
    id: 'gpt-4o-mini-tts',
    name: 'GPT-4o Mini TTS',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'OpenAI',
    family: 'OpenAI TTS',
    description: 'ELO 1047',
    releaseDate: '2025-03',
    providerIds: {
      openrouter: 'openai/gpt-4o-mini-tts',
    },
  },

  // --- Fish Audio ---
  {
    id: 'openaudio-s1',
    name: 'OpenAudio S1',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Fish Audio',
    family: 'Fish Audio',
    description: 'ELO 1077, $15/1M chars',
    releaseDate: '2025-06',
    providerIds: {
      fal: 'fal-ai/fish-audio/openaudio-s1',
    },
  },
  {
    id: 'openaudio-s1-mini',
    name: 'OpenAudio S1 Mini',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Fish Audio',
    family: 'Fish Audio',
    description: 'ELO 1055',
    releaseDate: '2025-06',
    providerIds: {
      fal: 'fal-ai/fish-audio/openaudio-s1-mini',
    },
  },
  {
    id: 'fish-speech-1.5',
    name: 'Fish Speech 1.5',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Fish Audio',
    family: 'Fish Audio',
    description: 'Open weights, ELO 1032',
    releaseDate: '2024-12',
    providerIds: {
      replicate: 'fishaudio/fish-speech-1.5',
      fal: 'fal-ai/fish-speech/v1.5',
    },
  },

  // --- Amazon Polly ---
  {
    id: 'polly-generative',
    name: 'Amazon Polly Generative',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Amazon',
    family: 'Polly',
    description: 'ELO 1064, $30/1M chars',
    releaseDate: '2024-05',
    providerIds: {
      fal: 'fal-ai/polly/generative',
    },
  },
  {
    id: 'polly-long-form',
    name: 'Amazon Polly Long-Form',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Amazon',
    family: 'Polly',
    description: 'ELO 1057, $100/1M chars',
    releaseDate: '2023-11',
    providerIds: {
      fal: 'fal-ai/polly/long-form',
    },
  },
  {
    id: 'polly-neural',
    name: 'Amazon Polly Neural',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Amazon',
    family: 'Polly',
    description: 'ELO 927, $16/1M chars',
    releaseDate: '2019-07',
    providerIds: {
      fal: 'fal-ai/polly/neural',
    },
  },

  // --- Cartesia Sonic ---
  {
    id: 'cartesia-sonic-3',
    name: 'Cartesia Sonic 3',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Cartesia',
    family: 'Sonic',
    description: 'ELO 1061, $46.7/1M chars',
    releaseDate: '2025-10',
    providerIds: {
      fal: 'fal-ai/cartesia/sonic-3',
    },
  },
  {
    id: 'cartesia-sonic-english',
    name: 'Cartesia Sonic English',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Cartesia',
    family: 'Sonic',
    description: 'ELO 1045',
    releaseDate: '2024-10',
    providerIds: {
      fal: 'fal-ai/cartesia/sonic-english',
    },
  },

  // --- Kokoro (Open Source) ---
  {
    id: 'kokoro-82m',
    name: 'Kokoro 82M v1.0',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Kokoro',
    family: 'Kokoro',
    description: 'Open weights, ELO 1058, $0.7/1M chars',
    releaseDate: '2025-01',
    providerIds: {
      replicate: 'kokoro/kokoro-82m',
      fal: 'fal-ai/kokoro/82m',
    },
  },

  // --- Resemble AI ---
  {
    id: 'chatterbox-hd',
    name: 'Chatterbox HD',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Resemble AI',
    family: 'Chatterbox',
    description: 'ELO 1054, $40/1M chars',
    releaseDate: '2025-05',
    providerIds: {
      fal: 'fal-ai/resemble/chatterbox-hd',
    },
  },
  {
    id: 'chatterbox',
    name: 'Chatterbox',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Resemble AI',
    family: 'Chatterbox',
    description: 'Open weights, ELO 1021',
    releaseDate: '2025-05',
    providerIds: {
      replicate: 'resemble/chatterbox',
      fal: 'fal-ai/resemble/chatterbox',
    },
  },

  // --- Hume AI ---
  {
    id: 'hume-octave-2',
    name: 'Hume Octave 2',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Hume AI',
    family: 'Octave',
    description: 'ELO 1051, $7.6/1M chars',
    releaseDate: '2025-10',
    providerIds: {
      fal: 'fal-ai/hume/octave-2',
    },
  },
  {
    id: 'hume-octave',
    name: 'Hume Octave TTS',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Hume AI',
    family: 'Octave',
    description: 'ELO 1021, $93.8/1M chars',
    releaseDate: '2025-02',
    providerIds: {
      fal: 'fal-ai/hume/octave',
    },
  },

  // --- Microsoft Azure ---
  {
    id: 'azure-neural',
    name: 'Azure Neural TTS',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Microsoft',
    family: 'Azure TTS',
    description: 'ELO 1051, $15/1M chars',
    releaseDate: '2018-09',
    providerIds: {
      fal: 'fal-ai/azure/neural',
    },
  },
  {
    id: 'vibevoice-1.5b',
    name: 'VibeVoice 1.5B',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Microsoft',
    family: 'VibeVoice',
    description: 'ELO 995',
    releaseDate: '2025-08',
    providerIds: {
      fal: 'fal-ai/microsoft/vibevoice-1.5b',
    },
  },

  // --- Google ---
  {
    id: 'google-studio-tts',
    name: 'Google Studio TTS',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Google',
    family: 'Google TTS',
    description: 'ELO 1043, $160/1M chars',
    releaseDate: '2023-02',
    providerIds: {
      fal: 'fal-ai/google/studio',
    },
  },
  {
    id: 'google-journey-tts',
    name: 'Google Journey TTS',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Google',
    family: 'Google TTS',
    description: 'ELO 1037',
    releaseDate: '2023-12',
    providerIds: {
      fal: 'fal-ai/google/journey',
    },
  },
  {
    id: 'google-chirp3-hd',
    name: 'Google Chirp 3 HD',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Google',
    family: 'Google TTS',
    description: 'ELO 1021, $30/1M chars',
    releaseDate: '2025-03',
    providerIds: {
      fal: 'fal-ai/google/chirp3-hd',
    },
  },

  // --- Alibaba Qwen TTS ---
  {
    id: 'qwen3-tts-flash',
    name: 'Qwen3 TTS Flash',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Alibaba',
    family: 'Qwen TTS',
    description: 'ELO 978, $10/1M chars',
    releaseDate: '2025-09',
    providerIds: {
      fal: 'fal-ai/qwen/tts-flash',
    },
  },

  // --- NVIDIA ---
  {
    id: 'nvidia-magpie',
    name: 'NVIDIA Magpie Multilingual',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'NVIDIA',
    family: 'Magpie',
    description: 'ELO 1009',
    releaseDate: '2025-04',
    providerIds: {
      fal: 'fal-ai/nvidia/magpie',
    },
  },

  // --- Open Source TTS ---
  {
    id: 'zonos',
    name: 'Zonos v0.1',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Zyphra',
    family: 'Zonos',
    description: 'Open weights, ELO 1000, $20/1M chars',
    releaseDate: '2025-02',
    providerIds: {
      replicate: 'zyphra/zonos',
      fal: 'fal-ai/zonos',
    },
  },
  {
    id: 'xtts-v2',
    name: 'XTTS v2',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'Coqui',
    family: 'XTTS',
    description: 'Open weights, voice cloning, ELO 912',
    releaseDate: '2023-11',
    providerIds: {
      replicate: 'lucataco/xtts-v2',
      fal: 'fal-ai/xtts-v2',
    },
  },
  {
    id: 'styletts2',
    name: 'StyleTTS 2',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'StyleTTS',
    family: 'StyleTTS',
    description: 'Open weights, ELO 902, $2.8/1M chars',
    releaseDate: '2023-06',
    providerIds: {
      replicate: 'styletts/styletts2',
      fal: 'fal-ai/styletts2',
    },
  },
  {
    id: 'openvoice-v2',
    name: 'OpenVoice v2',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'OpenVoice',
    family: 'OpenVoice',
    description: 'Open weights, ELO 972, $8.3/1M chars',
    releaseDate: '2024-04',
    providerIds: {
      replicate: 'openvoice/openvoice-v2',
      fal: 'fal-ai/openvoice/v2',
    },
  },
  {
    id: 'step-tts-mini',
    name: 'Step TTS Mini',
    category: 'audio',
    modality: 'text→audio',
    vendor: 'StepFun',
    family: 'StepFun TTS',
    description: 'Open weights, ELO 960',
    releaseDate: '2025-02',
    providerIds: {
      replicate: 'stepfun/step-tts-mini',
      fal: 'fal-ai/step-tts-mini',
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

  // ==========================================================================
  // 🎤 SPEECH-TO-TEXT (STT)
  // ==========================================================================
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
];

// =============================================================================
// 🎶 МОДЕЛИ ГЕНЕРАЦИИ МУЗЫКИ (Text-to-Music)
// Источник: https://artificialanalysis.ai/music/arena
// =============================================================================

const MUSIC_MODELS: CanonicalModel[] = [
  {
    id: 'suno-v4.5',
    name: 'Suno V4.5',
    category: 'audio',
    modality: 'text→music',
    vendor: 'Suno',
    family: 'Suno',
    description: '#1 Music, ELO 1109',
    providerIds: {
      laozhang: 'suno-v4.5',
    },
  },
  {
    id: 'eleven-music',
    name: 'Eleven Music',
    category: 'audio',
    modality: 'text→music',
    vendor: 'ElevenLabs',
    family: 'ElevenLabs',
    description: 'ELO 1067',
    providerIds: {
      fal: 'fal-ai/elevenlabs/music',
    },
  },
  {
    id: 'fuzz-1.1-pro',
    name: 'FUZZ-1.1 Pro',
    category: 'audio',
    modality: 'text→music',
    vendor: 'Producer.ai',
    family: 'FUZZ',
    description: 'ELO 1055',
    providerIds: {
      fal: 'fal-ai/producer/fuzz-1.1-pro',
    },
  },
  {
    id: 'fuzz-2.0-raw',
    name: 'FUZZ-2.0 Raw',
    category: 'audio',
    modality: 'text→music',
    vendor: 'Producer.ai',
    family: 'FUZZ',
    description: 'ELO 1040',
    providerIds: {
      fal: 'fal-ai/producer/fuzz-2.0-raw',
    },
  },
  {
    id: 'fuzz-2.0',
    name: 'FUZZ-2.0',
    category: 'audio',
    modality: 'text→music',
    vendor: 'Producer.ai',
    family: 'FUZZ',
    description: 'ELO 1022',
    providerIds: {
      fal: 'fal-ai/producer/fuzz-2.0',
    },
  },
  {
    id: 'lyria-2',
    name: 'Google Lyria 2',
    category: 'audio',
    modality: 'text→music',
    vendor: 'Google',
    family: 'Lyria',
    description: 'ELO 1000',
    providerIds: {
      fal: 'fal-ai/google/lyria-2',
    },
  },
  {
    id: 'udio-v1.5',
    name: 'Udio v1.5 Allegro',
    category: 'audio',
    modality: 'text→music',
    vendor: 'Udio',
    family: 'Udio',
    description: 'ELO 982',
    providerIds: {
      laozhang: 'udio-v1.5',
    },
  },
  {
    id: 'sonauto-v2.1',
    name: 'Sonauto V2.1',
    category: 'audio',
    modality: 'text→music',
    vendor: 'Sonauto',
    family: 'Sonauto',
    description: 'ELO 943',
    providerIds: {
      fal: 'fal-ai/sonauto/v2.1',
    },
  },
  {
    id: 'stable-audio-2.0',
    name: 'Stable Audio 2.0',
    category: 'audio',
    modality: 'text→music',
    vendor: 'Stability AI',
    family: 'Stable Audio',
    description: 'ELO 932',
    providerIds: {
      replicate: 'stability-ai/stable-audio-2.0',
      fal: 'fal-ai/stable-audio-2.0',
    },
  },
  {
    id: 'musicgen',
    name: 'MusicGen',
    category: 'audio',
    modality: 'text→music',
    vendor: 'Meta',
    family: 'MusicGen',
    description: 'ELO 832',
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
// 💻 МОДЕЛИ ДЛЯ КОДА (Code Generation)
// Источник: https://artificialanalysis.ai/text-to-code/leaderboard
// =============================================================================

const CODE_MODELS: CanonicalModel[] = [
  // ==========================================================================
  // 🏆 TOP TIER (ELO 1400+) — Claude & GPT
  // ==========================================================================
  {
    id: 'claude-opus-4-5-20251101-thinking-32k',
    name: 'Claude Opus 4.5 (20251101, thinking, 32k)',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Anthropic',
    family: 'Claude',
    description: '#1 coding model, ELO 1518',
    elo: 1518,
    contextLength: 32768,
    releaseDate: '2025-11',
    providerIds: {
      openrouter: 'anthropic/claude-opus-4-5-20251101-thinking-32k',
    },
  },
  {
    id: 'gpt-5.2-high',
    name: 'GPT-5.2 High',
    category: 'code',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    description: 'ELO 1485 (Preliminary)',
    elo: 1485,
    releaseDate: '2025-12',
    providerIds: {
      openrouter: 'openai/gpt-5.2-high',
    },
  },
  {
    id: 'claude-opus-4-5-20251101',
    name: 'Claude Opus 4.5 (20251101)',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Anthropic',
    family: 'Claude',
    description: 'ELO 1484',
    elo: 1484,
    contextLength: 200000,
    releaseDate: '2025-11',
    providerIds: {
      openrouter: 'anthropic/claude-opus-4-5-20251101',
    },
  },
  {
    id: 'gpt-5-medium',
    name: 'GPT-5 Medium',
    category: 'code',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    description: 'ELO 1399',
    elo: 1399,
    releaseDate: '2025-10',
    providerIds: {
      openrouter: 'openai/gpt-5-medium',
    },
  },
  {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    category: 'code',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    description: 'ELO 1399 (Preliminary)',
    elo: 1399,
    releaseDate: '2025-12',
    providerIds: {
      openrouter: 'openai/gpt-5.2',
    },
  },
  {
    id: 'gpt-5.1-medium',
    name: 'GPT-5.1 Medium',
    category: 'code',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    description: 'ELO 1393',
    elo: 1393,
    releaseDate: '2025-11',
    providerIds: {
      openrouter: 'openai/gpt-5.1-medium',
    },
  },
  {
    id: 'claude-sonnet-4-5-20250929-thinking-32k',
    name: 'Claude Sonnet 4.5 (20250929, thinking, 32k)',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Anthropic',
    family: 'Claude',
    description: 'ELO 1393',
    elo: 1393,
    contextLength: 32768,
    releaseDate: '2025-09',
    providerIds: {
      openrouter: 'anthropic/claude-sonnet-4-5-20250929-thinking-32k',
    },
  },
  {
    id: 'claude-opus-4-1-20250805',
    name: 'Claude Opus 4.1 (20250805)',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Anthropic',
    family: 'Claude',
    description: 'ELO 1392',
    elo: 1392,
    contextLength: 200000,
    releaseDate: '2025-08',
    providerIds: {
      openrouter: 'anthropic/claude-opus-4-1-20250805',
    },
  },
  {
    id: 'claude-sonnet-4-5-20250929',
    name: 'Claude Sonnet 4.5 (20250929)',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Anthropic',
    family: 'Claude',
    description: 'ELO 1387',
    elo: 1387,
    contextLength: 200000,
    releaseDate: '2025-09',
    providerIds: {
      openrouter: 'anthropic/claude-sonnet-4-5-20250929',
    },
  },

  // ==========================================================================
  // 🥈 HIGH TIER (ELO 1300-1399) — DeepSeek, Gemini, GPT, Z.ai
  // ==========================================================================
  {
    id: 'glm-4.6',
    name: 'GLM-4.6',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Z.ai',
    family: 'GLM',
    description: 'MIT License, ELO 1368',
    elo: 1368,
    contextLength: 128000,
    releaseDate: '2025-12',
    providerIds: {
      openrouter: 'zhipu/glm-4.6',
    },
  },
  {
    id: 'deepseek-v3.2-thinking',
    name: 'DeepSeek V3.2 Thinking',
    category: 'code',
    modality: 'text↔text',
    vendor: 'DeepSeek AI',
    family: 'DeepSeek',
    description: 'MIT License, ELO 1367',
    elo: 1367,
    contextLength: 64000,
    releaseDate: '2025-12',
    providerIds: {
      openrouter: 'deepseek/deepseek-v3.2-thinking',
      groq: 'deepseek-v3.2-thinking',
    },
  },
  {
    id: 'gpt-5.1',
    name: 'GPT-5.1',
    category: 'code',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    description: 'ELO 1359',
    elo: 1359,
    releaseDate: '2025-11',
    providerIds: {
      openrouter: 'openai/gpt-5.1',
    },
  },
  {
    id: 'kimi-k2-thinking-turbo',
    name: 'Kimi K2 Thinking Turbo',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Moonshot',
    family: 'Kimi',
    description: 'Modified MIT License, ELO 1345',
    elo: 1345,
    contextLength: 128000,
    releaseDate: '2025-10',
    providerIds: {
      openrouter: 'moonshot/kimi-k2-thinking-turbo',
    },
  },
  {
    id: 'gpt-5.1-codex',
    name: 'GPT-5.1 Codex',
    category: 'code',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    description: 'Specialized for code, ELO 1335',
    elo: 1335,
    releaseDate: '2025-11',
    providerIds: {
      openrouter: 'openai/gpt-5.1-codex',
    },
  },
  {
    id: 'minimax-m2',
    name: 'MiniMax M2',
    category: 'code',
    modality: 'text↔text',
    vendor: 'MiniMax',
    family: 'MiniMax',
    description: 'Apache 2.0 License, ELO 1317',
    elo: 1317,
    contextLength: 128000,
    releaseDate: '2025-12',
    providerIds: {
      openrouter: 'minimax/minimax-m2',
    },
  },

  // ==========================================================================
  // 🥉 MID TIER (ELO 1250-1299) — DeepSeek, Qwen, Claude
  // ==========================================================================
  {
    id: 'deepseek-v3.2-exp',
    name: 'DeepSeek V3.2 Experimental',
    category: 'code',
    modality: 'text↔text',
    vendor: 'DeepSeek AI',
    family: 'DeepSeek',
    description: 'MIT License, ELO 1294',
    elo: 1294,
    contextLength: 128000,
    releaseDate: '2025-12',
    providerIds: {
      openrouter: 'deepseek/deepseek-v3.2-exp',
    },
  },
  {
    id: 'qwen3-coder-480b-a35b-instruct',
    name: 'Qwen3 Coder 480B A35B Instruct',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Alibaba',
    family: 'Qwen',
    description: 'Apache 2.0 License, ELO 1291',
    elo: 1291,
    contextLength: 32000,
    releaseDate: '2025-11',
    providerIds: {
      openrouter: 'qwen/qwen3-coder-480b-a35b-instruct',
    },
  },
  {
    id: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5 (20251001)',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Anthropic',
    family: 'Claude',
    description: 'ELO 1289',
    elo: 1289,
    contextLength: 200000,
    releaseDate: '2025-10',
    providerIds: {
      openrouter: 'anthropic/claude-haiku-4-5-20251001',
    },
  },
  {
    id: 'deepseek-v3.2',
    name: 'DeepSeek V3.2',
    category: 'code',
    modality: 'text↔text',
    vendor: 'DeepSeek AI',
    family: 'DeepSeek',
    description: 'MIT License, ELO 1286',
    elo: 1286,
    contextLength: 128000,
    releaseDate: '2025-12',
    providerIds: {
      openrouter: 'deepseek/deepseek-v3.2',
      groq: 'deepseek-v3.2',
    },
  },
  {
    id: 'kat-coder-pro-v1',
    name: 'KAT-Coder-Pro-V1',
    category: 'code',
    modality: 'text↔text',
    vendor: 'KwaiKAT',
    family: 'KAT',
    description: 'Proprietary, ELO 1264',
    elo: 1264,
    contextLength: 32000,
    releaseDate: '2025-10',
    providerIds: {
      openrouter: 'kwai/kat-coder-pro-v1',
    },
  },
  {
    id: 'gpt-5.1-codex-mini',
    name: 'GPT-5.1 Codex Mini',
    category: 'code',
    modality: 'text↔text',
    vendor: 'OpenAI',
    family: 'GPT',
    description: 'Smaller Codex, ELO 1252',
    elo: 1252,
    releaseDate: '2025-11',
    providerIds: {
      openrouter: 'openai/gpt-5.1-codex-mini',
    },
  },

  // ==========================================================================
  // 📊 GOOD TIER (ELO 1200-1249) — Grok, Mistral, Gemini
  // ==========================================================================
  {
    id: 'grok-4-1-fast-reasoning',
    name: 'Grok-4.1 Fast Reasoning',
    category: 'code',
    modality: 'text↔text',
    vendor: 'xAI',
    family: 'Grok',
    description: 'Proprietary, ELO 1227',
    elo: 1227,
    contextLength: 128000,
    releaseDate: '2025-11',
    providerIds: {
      openrouter: 'x-ai/grok-4-1-fast-reasoning',
    },
  },
  {
    id: 'mistral-large-3',
    name: 'Mistral Large 3',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Mistral AI',
    family: 'Mistral',
    description: 'Apache 2.0 License, ELO 1226 (Preliminary)',
    elo: 1226,
    contextLength: 128000,
    releaseDate: '2025-12',
    providerIds: {
      openrouter: 'mistralai/mistral-large-3',
      together: 'mistralai/Mistral-Large-3',
    },
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Google',
    family: 'Gemini',
    description: 'ELO 1213',
    elo: 1213,
    contextLength: 1000000,
    releaseDate: '2025-11',
    providerIds: {
      openrouter: 'google/gemini-2.5-pro',
      groq: 'gemini-2.5-pro',
    },
  },
  {
    id: 'grok-4.1-thinking',
    name: 'Grok-4.1 Thinking',
    category: 'code',
    modality: 'text↔text',
    vendor: 'xAI',
    family: 'Grok',
    description: 'Proprietary, ELO 1206',
    elo: 1206,
    contextLength: 128000,
    releaseDate: '2025-11',
    providerIds: {
      openrouter: 'x-ai/grok-4.1-thinking',
    },
  },

  // ==========================================================================
  // ⚡ SOLID TIER (ELO 1100-1199) — Grok Code, Devstral
  // ==========================================================================
  {
    id: 'grok-4-fast-reasoning',
    name: 'Grok-4 Fast Reasoning',
    category: 'code',
    modality: 'text↔text',
    vendor: 'xAI',
    family: 'Grok',
    description: 'Proprietary, ELO 1153',
    elo: 1153,
    contextLength: 128000,
    releaseDate: '2025-10',
    providerIds: {
      openrouter: 'x-ai/grok-4-fast-reasoning',
    },
  },
  {
    id: 'grok-code-fast-1',
    name: 'Grok Code Fast 1',
    category: 'code',
    modality: 'text↔text',
    vendor: 'xAI',
    family: 'Grok',
    description: 'Specialized for code, ELO 1144',
    elo: 1144,
    contextLength: 128000,
    releaseDate: '2025-10',
    providerIds: {
      openrouter: 'x-ai/grok-code-fast-1',
    },
  },
  {
    id: 'devstral-medium-2507',
    name: 'Devstral Medium 2507',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Mistral AI',
    family: 'Devstral',
    description: 'Proprietary, ELO 1103',
    elo: 1103,
    contextLength: 32000,
    releaseDate: '2025-07',
    providerIds: {
      openrouter: 'mistralai/devstral-medium-2507',
      together: 'mistralai/Devstral-Medium-2507',
      fireworks: 'accounts/fireworks/models/devstral-medium-2507',
    },
  },

  // ==========================================================================
  // 🔧 CLASSIC CODE MODELS (Lower ELO but still useful)
  // ==========================================================================
  {
    id: 'codellama-70b',
    name: 'CodeLlama 70B',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Meta',
    family: 'CodeLlama',
    description: 'Open Source',
    contextLength: 16000,
    releaseDate: '2023-08',
    providerIds: {
      openrouter: 'meta-llama/codellama-70b-instruct',
      together: 'codellama/CodeLlama-70b-Instruct-hf',
      replicate: 'meta/codellama-70b-instruct',
    },
  },
  {
    id: 'codestral',
    name: 'Codestral 22B',
    category: 'code',
    modality: 'text↔text',
    vendor: 'Mistral AI',
    family: 'Mistral',
    description: 'Open Source',
    contextLength: 32000,
    releaseDate: '2024-05',
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
    description: 'Open Source',
    contextLength: 16000,
    releaseDate: '2024-02',
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
  ...MUSIC_MODELS,
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
