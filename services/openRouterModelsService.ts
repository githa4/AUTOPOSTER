export interface OpenRouterModelPricing {
  prompt?: string;
  completion?: string;
  request?: string;
  image?: string;
  audio?: string;
  web_search?: string;
  internal_reasoning?: string;
  input_cache_read?: string;
}

export interface OpenRouterPerRequestLimits {
  max_input_tokens?: number;
  max_output_tokens?: number;
}

export interface OpenRouterTopProvider {
  context_length?: number;
  max_completion_tokens?: number;
  is_moderated?: boolean;
}

export interface OpenRouterModelArchitecture {
  modality?: string;
  tokenizer?: string;
  instruct_type?: string;
}

export interface OpenRouterModel {
  id: string;
  canonical_slug?: string;
  hugging_face_id?: string;
  name: string;
  created?: number;
  description?: string;
  context_length?: number;
  architecture?: OpenRouterModelArchitecture;
  pricing?: OpenRouterModelPricing;
  top_provider?: OpenRouterTopProvider | null;
  per_request_limits?: OpenRouterPerRequestLimits | null;
  supported_parameters?: string[];
  default_parameters?: Record<string, unknown>;
}

type OpenRouterModelsResponse = {
  data: OpenRouterModel[];
};

let cache:
  | {
      fetchedAtMs: number;
      models: OpenRouterModel[];
    }
  | undefined;

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

export const fetchOpenRouterModels = async (): Promise<OpenRouterModel[]> => {
  const now = Date.now();
  if (cache && now - cache.fetchedAtMs < CACHE_TTL_MS) return cache.models;

  const response = await fetch('https://openrouter.ai/api/v1/models');
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `OpenRouter models fetch failed: ${response.status} ${text}`.trim(),
    );
  }

  const body = (await response.json()) as OpenRouterModelsResponse;
  const models = Array.isArray(body.data) ? body.data : [];

  cache = {
    fetchedAtMs: now,
    models,
  };

  return models;
};
