
// @google/genai SDK Integration for Gemini models
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, GenerationStats, ApiConfig, Model, ModelLimit, SourceType, PostMode, ApiProvider, ModelSpecs } from "../types";

// Always initialize GoogleGenAI with named parameter apiKey.
const getGeminiClient = (apiKey?: string) => {
  const key = apiKey || process.env.API_KEY;
  if (!key) throw new Error("API Key is missing. Please check your settings.");
  return new GoogleGenAI({ apiKey: key });
};

const DEFAULT_SPECS: ModelSpecs = {
    maxOutputTokens: 4096,
    temperatureRange: { min: 0, max: 1, default: 0.7 },
    topP: { min: 0, max: 1, default: 1 },
    supportsImages: false,
    supportsVideo: false,
    supportsAudio: false,
    supportsJsonMode: false,
    supportsFunctionCalling: false,
    supportsSystemPrompt: true,
    knowledgeCutoff: "Unknown"
};

// Use recommended model names according to coding guidelines.
const MODEL_SPECS_DB: Record<string, Partial<ModelSpecs>> = {
    'gemini-3-flash-preview': { maxOutputTokens: 8192, temperatureRange: { min: 0, max: 2, default: 1.0 }, supportsImages: true, supportsVideo: true, supportsAudio: true, supportsJsonMode: true, supportsFunctionCalling: true, knowledgeCutoff: "Feb 2025" },
    'gemini-flash-lite-latest': { maxOutputTokens: 8192, supportsImages: true, supportsJsonMode: true },
    'gemini-3-pro-preview': { maxOutputTokens: 8192, supportsImages: true, supportsVideo: true, supportsAudio: true, supportsJsonMode: true, supportsFunctionCalling: true, knowledgeCutoff: "Feb 2025" },
    'deepseek-r1': { maxOutputTokens: 8192, supportsJsonMode: true, supportsSystemPrompt: false, knowledgeCutoff: "Dec 2023" }
};

export const getSpecsForModel = (modelId: string): ModelSpecs => {
    if (MODEL_SPECS_DB[modelId]) return { ...DEFAULT_SPECS, ...MODEL_SPECS_DB[modelId] };
    const knownKey = Object.keys(MODEL_SPECS_DB).find(key => modelId.includes(key));
    if (knownKey) return { ...DEFAULT_SPECS, ...MODEL_SPECS_DB[knownKey] };
    const heuristicSpecs = { ...DEFAULT_SPECS };
    if (/vision|4o|sonnet|gemini|flux/.test(modelId)) heuristicSpecs.supportsImages = true;
    return heuristicSpecs;
};

// Corrected Gemini model IDs based on task types and common names.
export const GEMINI_TEXT_MODELS: Model[] = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash', provider: 'gemini', isFree: true, contextLength: 1000000, created: 1735689600, description: "Fast, multimodal, low latency.", pricing: { prompt: "$0.075 / 1M", completion: "$0.30 / 1M" }, supportedInputs: ['text', 'image', 'audio', 'video'], specs: getSpecsForModel('gemini-3-flash-preview') },
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite', provider: 'gemini', isFree: true, contextLength: 1000000, created: 1710000000, description: "Cost-optimized version of Flash.", pricing: { prompt: "$0.0375 / 1M", completion: "$0.15 / 1M" }, supportedInputs: ['text', 'image'], specs: getSpecsForModel('gemini-flash-lite-latest') },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', provider: 'gemini', isFree: true, contextLength: 2000000, created: 1735689600, description: "Reasoning expert.", pricing: { prompt: "$1.25 / 1M", completion: "$5.00 / 1M" }, supportedInputs: ['text', 'image', 'audio', 'video'], specs: getSpecsForModel('gemini-3-pro-preview') }
];

export const KIE_DEFAULT_MODELS: Model[] = [
    { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'kie', description: 'Reasoning Model', contextLength: 128000, isFree: false, pricing: { prompt: "$0.55 / 1M", completion: "$2.19 / 1M" }, specs: getSpecsForModel('deepseek-r1') }
];

export const CORE_MODELS = [...GEMINI_TEXT_MODELS, ...KIE_DEFAULT_MODELS];

export const getModelLimits = (modelId: string): ModelLimit => {
    const limits: Record<string, ModelLimit> = {
        'gemini-3-flash-preview': { rpm: 15, rpd: 1500 },
        'gemini-flash-lite-latest': { rpm: 15, rpd: 1500 },
        'gemini-3-pro-preview': { rpm: 2, rpd: 50 },
        'default': { rpm: 15, rpd: 1500 }
    };
    return limits[modelId] || limits['default'];
};

// Implementation for missing testTextGeneration export.
export const testTextGeneration = async (modelId: string, provider: ApiProvider, apiKey: string): Promise<{ success: boolean, output: string, tokens: number }> => {
    if (provider === 'gemini') {
        const ai = getGeminiClient(apiKey);
        const response = await ai.models.generateContent({
            model: modelId,
            contents: "Hello, this is a test.",
        });
        // Access text property directly from GenerateContentResponse.
        return {
            success: true,
            output: response.text || '',
            tokens: response.usageMetadata?.totalTokenCount || 0
        };
    }
    const url = provider === 'kie' ? "https://api.kie.ai/v1" : "https://openrouter.ai/api/v1";
    const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };

    // OpenRouter: опциональные headers для атрибуции (и иногда полезны для совместимости)
    if (provider === 'openrouter') {
        const referer = typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost';

        headers['HTTP-Referer'] = referer;
        headers['X-Title'] = 'AutoPost.AI';
    }

    let resolvedModelId = modelId;
    if (provider === 'openrouter') {
        const modelsResp = await fetch(`${url}/models`, {
            method: 'GET',
            headers,
        });

        const modelsText = await modelsResp.text();
        const modelsJson = (() => {
            try { return JSON.parse(modelsText); } catch { return null; }
        })();

        if (!modelsResp.ok) {
            const msg = modelsJson?.error?.message || modelsJson?.message || modelsText || 'OpenRouter models request failed';
            throw new Error(msg);
        }

        const modelsArray: Array<{ id?: string }> = Array.isArray(modelsJson?.data)
            ? modelsJson.data
            : (Array.isArray(modelsJson?.models) ? modelsJson.models : []);

        const ids = modelsArray
            .map((m) => m?.id)
            .filter((id): id is string => typeof id === 'string' && id.length > 0);

        if (ids.length === 0) {
            throw new Error('OpenRouter: список моделей пуст (ключ не даёт доступ к моделям или ответ неожиданный)');
        }

        if (!ids.includes(resolvedModelId)) {
            const preferred = [
                'openai/gpt-4o-mini',
                'openai/gpt-4o',
                'anthropic/claude-3.5-sonnet',
                'google/gemini-2.0-flash-001',
                'meta-llama/llama-3.1-8b-instruct',
            ];
            resolvedModelId = preferred.find((id) => ids.includes(id)) || ids[0];
        }
    }

    const resp = await fetch(`${url}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model: resolvedModelId,
            messages: [{ role: 'user', content: 'Hello, this is a test.' }],
        }),
    });

    const text = await resp.text();
    const data = (() => {
        try { return JSON.parse(text); } catch { return null; }
    })();

    if (!resp.ok) {
        throw new Error(data?.error?.message || data?.message || text || 'API Error');
    }

    return {
        success: true,
        output: data?.choices?.[0]?.message?.content || '',
        tokens: data?.usage?.total_tokens || 0,
    };
};

export const generatePostImage = async (
    prompt: string, 
    modelId: string, 
    apiConfig: ApiConfig, 
    style: string, 
    signal?: AbortSignal,
    imageSystemPrompt?: string
): Promise<{ base64: string, stats: GenerationStats }> => {
    const ai = getGeminiClient(apiConfig.geminiKey);
    const start = Date.now();
    
    let finalPrompt = prompt;
    if (imageSystemPrompt) {
        finalPrompt = `${imageSystemPrompt}\n\nSubject: ${prompt}`;
    }
    if (style && style !== 'Realistic') {
        finalPrompt = `${finalPrompt}, style: ${style}`;
    }

    // For nano banana series (gemini-2.5-flash-image / gemini-3-pro-image-preview), use generateContent.
    const response = await ai.models.generateContent({ model: modelId, contents: finalPrompt });
    let base64 = "";
    // Iterate through candidates and parts to find the image part.
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64 = part.inlineData.data;
            break;
          }
      }
    }
    return { base64, stats: { modelName: modelId, latencyMs: Date.now() - start, inputTokens: 0, outputTokens: 0, totalTokens: 0 } };
};

export const getAvailableModels = async (apiConfig: ApiConfig, specificProvider?: ApiProvider): Promise<Model[]> => {
  let models: Model[] = [...CORE_MODELS];
  const fetchCompat = async (url: string, key: string, prov: ApiProvider) => {
      try {
          const res = await fetch(`${url}/models`, { headers: { "Authorization": `Bearer ${key}` } });
          if (!res.ok) return [];
          const json = await res.json();
          return (json.data || []).map((m: any) => ({
              id: m.id, name: m.name || m.id, provider: prov, contextLength: m.context_length || 4096,
              pricing: m.pricing || { prompt: "?", completion: "?" }, isFree: m.id.includes("free"),
              created: m.created || Date.now() / 1000, specs: getSpecsForModel(m.id), raw: m
          }));
      } catch { return []; }
  };
  if ((!specificProvider || specificProvider === 'openrouter') && apiConfig.openRouterKey) {
      const or = await fetchCompat("https://openrouter.ai/api/v1", apiConfig.openRouterKey, 'openrouter');
      models = [...models, ...or];
  }
  if ((!specificProvider || specificProvider === 'kie') && apiConfig.kieKey) {
      const kie = await fetchCompat("https://api.kie.ai/v1", apiConfig.kieKey, 'kie');
      kie.forEach(km => { if (!models.find(m => m.id === km.id)) models.push(km); });
  }
  return models.filter((m, i, self) => i === self.findIndex(t => t.id === m.id));
};

export const rewritePostSegment = async (text: string, instruction: string, modelName: string, apiConfig: ApiConfig): Promise<string> => {
    const prompt = `Rewrite: "${text}" Instruction: "${instruction}". Keep HTML tags. Output only the rewritten text.`;
    if (apiConfig.kieKey || apiConfig.openRouterKey) {
         const url = apiConfig.kieKey ? "https://api.kie.ai/v1" : "https://openrouter.ai/api/v1";
         const key = apiConfig.kieKey || apiConfig.openRouterKey;
         const res = await fetch(`${url}/chat/completions`, {
             method: "POST", headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
             body: JSON.stringify({ model: modelName, messages: [{ role: "user", content: prompt }] })
         });
         const data = await res.json();
         return data.choices?.[0]?.message?.content || text;
    }
    const ai = getGeminiClient(apiConfig.geminiKey);
    // Use gemini-3-flash-preview for basic text tasks like proofreading/rewriting.
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || text;
};

export const generatePostContent = async (
    topic: string, 
    language: string, 
    modelName: string, 
    apiConfig: ApiConfig, 
    tone: string = "Professional", 
    style: string = "Realistic", 
    customPrompt?: string, 
    postCount: number = 1, 
    sourceType: SourceType = 'text', 
    postMode: PostMode = 'short', 
    includeLongRead: boolean = false, 
    provider: ApiProvider = 'gemini', 
    signal?: AbortSignal,
    temperature: number = 0.7,
    maxTokens: number = 2048
): Promise<GeneratedContent> => {
  const start = Date.now();
  const system = customPrompt || "Act as a world-class professional Telegram editor.";
  const prompt = `${system} Topic: "${topic}" Language: ${language} Tone: ${tone} Posts: ${postCount} Mode: ${postMode}
    Output JSON: { "posts": [{"headline":"", "body":""}], "hashtags":[], "imagePrompt":"", "longReadRaw":"" }`;
  
  if (provider === 'gemini') {
    const ai = getGeminiClient(apiConfig.geminiKey);
    // Use responseMimeType: "application/json" for structured data output.
    const res = await ai.models.generateContent({ 
        model: modelName, 
        contents: prompt, 
        config: { 
            responseMimeType: "application/json",
            temperature: temperature,
            maxOutputTokens: maxTokens
        } 
    });
    // Use .text property directly.
    return { ...JSON.parse(res.text || '{}'), textStats: { modelName, latencyMs: Date.now() - start, inputTokens: res.usageMetadata?.promptTokenCount || 0, outputTokens: res.usageMetadata?.candidatesTokenCount || 0, totalTokens: res.usageMetadata?.totalTokenCount || 0 } };
  }
  
  const url = provider === 'kie' ? "https://api.kie.ai/v1" : "https://openrouter.ai/api/v1";
  const key = provider === 'kie' ? apiConfig.kieKey : apiConfig.openRouterKey;
  const resp = await fetch(`${url}/chat/completions`, {
    method: "POST", 
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ 
        model: modelName, 
        messages: [{ role: "user", content: prompt }], 
        response_format: { type: "json_object" },
        temperature: temperature,
        max_tokens: maxTokens
    }), 
    signal
  });
  const data = await resp.json();
  return { ...JSON.parse(data.choices?.[0]?.message?.content || '{}'), textStats: { modelName, latencyMs: Date.now() - start, inputTokens: data.usage?.prompt_tokens || 0, outputTokens: data.usage?.completion_tokens || 0, totalTokens: data.usage?.total_tokens || 0 } };
};
