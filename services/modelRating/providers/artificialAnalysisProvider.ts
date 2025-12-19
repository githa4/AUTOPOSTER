/**
 * Artificial Analysis Provider
 * 
 * Источник: artificialanalysis.ai
 * Данные: Intelligence Index, Omniscience, Speed, Price, Latency
 * 
 * У AA нет публичного API, поэтому храним курируемые данные
 * на основе их leaderboard. Обновляется вручную или через scraping.
 * 
 * Последнее обновление: 2025-12-20
 */

export interface AAModelData {
    /** Название модели */
    name: string;
    /** Организация */
    organization: string;
    /** Intelligence Index (0-100) — главный рейтинг качества */
    intelligenceIndex: number;
    /** Omniscience Index (-100 to +100) — надёжность знаний */
    omniscienceIndex?: number;
    /** Цена за 1M токенов (blend input/output 3:1) */
    pricePerMTokens: number;
    /** Output Speed (tokens/sec) */
    outputSpeed?: number;
    /** Latency - time to first token (seconds) */
    latencyTTFT?: number;
    /** Context window */
    contextWindow?: number;
    /** Open Weights или Proprietary */
    isOpenWeights: boolean;
    /** Ссылка на детали модели */
    detailsUrl: string;
    /** Категория: text, code, multimodal */
    category: 'text' | 'code' | 'multimodal';
    /** Reasoning модель? */
    isReasoning: boolean;
}

// Данные из leaderboard AA на 2025-12-20
// TOP-30 моделей по Intelligence Index
const AA_MODELS_DATA: AAModelData[] = [
    // === TOP TIER (Intelligence 65+) ===
    {
        name: 'Gemini 3 Pro Preview (high)',
        organization: 'Google',
        intelligenceIndex: 73,
        omniscienceIndex: 13,
        pricePerMTokens: 4.50,
        outputSpeed: 134,
        latencyTTFT: 31.17,
        contextWindow: 1_000_000,
        isOpenWeights: false,
        detailsUrl: '/models/gemini-3-pro/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'GPT-5.2 (xhigh)',
        organization: 'OpenAI',
        intelligenceIndex: 73,
        omniscienceIndex: -4,
        pricePerMTokens: 4.81,
        outputSpeed: 151,
        latencyTTFT: 42.29,
        contextWindow: 400_000,
        isOpenWeights: false,
        detailsUrl: '/models/gpt-5-2/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'Gemini 3 Flash',
        organization: 'Google',
        intelligenceIndex: 71,
        omniscienceIndex: 13,
        pricePerMTokens: 1.13,
        outputSpeed: 207,
        latencyTTFT: 12.18,
        contextWindow: 1_000_000,
        isOpenWeights: false,
        detailsUrl: '/models/gemini-3-flash/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'Claude Opus 4.5',
        organization: 'Anthropic',
        intelligenceIndex: 70,
        omniscienceIndex: 10,
        pricePerMTokens: 10.00,
        outputSpeed: 63,
        latencyTTFT: 2.01,
        contextWindow: 200_000,
        isOpenWeights: false,
        detailsUrl: '/models/claude-opus-4-5/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'GPT-5.1 (high)',
        organization: 'OpenAI',
        intelligenceIndex: 70,
        omniscienceIndex: 2,
        pricePerMTokens: 3.44,
        outputSpeed: 102,
        latencyTTFT: 38.68,
        contextWindow: 400_000,
        isOpenWeights: false,
        detailsUrl: '/models/gpt-5-1/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'Kimi K2 Thinking',
        organization: 'Kimi',
        intelligenceIndex: 67,
        omniscienceIndex: -23,
        pricePerMTokens: 1.07,
        outputSpeed: 81,
        latencyTTFT: 0.67,
        contextWindow: 256_000,
        isOpenWeights: true,
        detailsUrl: '/models/kimi-k2-thinking/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'GPT-5.1 Codex (high)',
        organization: 'OpenAI',
        intelligenceIndex: 67,
        omniscienceIndex: -7,
        pricePerMTokens: 3.44,
        outputSpeed: 171,
        latencyTTFT: 17.68,
        contextWindow: 400_000,
        isOpenWeights: false,
        detailsUrl: '/models/gpt-5-1-codex/providers',
        category: 'code',
        isReasoning: true
    },
    {
        name: 'MiMo-V2-Flash',
        organization: 'Xiaomi',
        intelligenceIndex: 66,
        omniscienceIndex: -42,
        pricePerMTokens: 0.15,
        outputSpeed: 89,
        latencyTTFT: 1.49,
        contextWindow: 256_000,
        isOpenWeights: true,
        detailsUrl: '/models/mimo-v2-flash/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'DeepSeek V3.2',
        organization: 'DeepSeek',
        intelligenceIndex: 66,
        omniscienceIndex: -23,
        pricePerMTokens: 0.32,
        outputSpeed: 27,
        latencyTTFT: 1.32,
        contextWindow: 128_000,
        isOpenWeights: true,
        detailsUrl: '/models/deepseek-v3-2/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'Grok 4',
        organization: 'xAI',
        intelligenceIndex: 65,
        omniscienceIndex: 1,
        pricePerMTokens: 6.00,
        outputSpeed: 28,
        latencyTTFT: 12.42,
        contextWindow: 256_000,
        isOpenWeights: false,
        detailsUrl: '/models/grok-4/providers',
        category: 'text',
        isReasoning: true
    },

    // === HIGH TIER (Intelligence 55-64) ===
    {
        name: 'o3',
        organization: 'OpenAI',
        intelligenceIndex: 65,
        pricePerMTokens: 3.50,
        outputSpeed: 265,
        latencyTTFT: 12.95,
        contextWindow: 200_000,
        isOpenWeights: false,
        detailsUrl: '/models/o3/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'Grok 4.1 Fast',
        organization: 'xAI',
        intelligenceIndex: 64,
        omniscienceIndex: -31,
        pricePerMTokens: 0.28,
        outputSpeed: 122,
        latencyTTFT: 12.84,
        contextWindow: 2_000_000,
        isOpenWeights: false,
        detailsUrl: '/models/grok-4-1-fast/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'Claude 4.5 Sonnet',
        organization: 'Anthropic',
        intelligenceIndex: 63,
        omniscienceIndex: -2,
        pricePerMTokens: 6.00,
        outputSpeed: 70,
        latencyTTFT: 1.98,
        contextWindow: 1_000_000,
        isOpenWeights: false,
        detailsUrl: '/models/claude-4-5-sonnet/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'Nova 2.0 Pro Preview (medium)',
        organization: 'Amazon',
        intelligenceIndex: 62,
        omniscienceIndex: -50,
        pricePerMTokens: 3.44,
        outputSpeed: 123,
        latencyTTFT: 25.69,
        contextWindow: 256_000,
        isOpenWeights: false,
        detailsUrl: '/models/nova-2-0-pro/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'MiniMax-M2',
        organization: 'MiniMax',
        intelligenceIndex: 61,
        omniscienceIndex: -50,
        pricePerMTokens: 0.53,
        outputSpeed: 102,
        latencyTTFT: 1.50,
        contextWindow: 205_000,
        isOpenWeights: true,
        detailsUrl: '/models/minimax-m2/providers',
        category: 'text',
        isReasoning: false
    },
    {
        name: 'gpt-oss-120B (high)',
        organization: 'OpenAI',
        intelligenceIndex: 61,
        omniscienceIndex: -52,
        pricePerMTokens: 0.26,
        outputSpeed: 334,
        latencyTTFT: 0.44,
        contextWindow: 131_000,
        isOpenWeights: true,
        detailsUrl: '/models/gpt-oss-120b/providers',
        category: 'text',
        isReasoning: false
    },
    {
        name: 'Gemini 2.5 Pro',
        organization: 'Google',
        intelligenceIndex: 60,
        omniscienceIndex: -18,
        pricePerMTokens: 3.44,
        outputSpeed: 159,
        latencyTTFT: 34.59,
        contextWindow: 1_000_000,
        isOpenWeights: false,
        detailsUrl: '/models/gemini-2-5-pro/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'Nova 2.0 Lite (medium)',
        organization: 'Amazon',
        intelligenceIndex: 58,
        omniscienceIndex: -58,
        pricePerMTokens: 0.85,
        contextWindow: 1_000_000,
        isOpenWeights: false,
        detailsUrl: '/models/nova-2-0-lite/providers',
        category: 'text',
        isReasoning: false
    },
    {
        name: 'Qwen3 235B A22B 2507',
        organization: 'Alibaba',
        intelligenceIndex: 57,
        omniscienceIndex: -48,
        pricePerMTokens: 2.63,
        outputSpeed: 65,
        latencyTTFT: 1.19,
        contextWindow: 256_000,
        isOpenWeights: true,
        detailsUrl: '/models/qwen3-235b-a22b-instruct-2507/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'GLM-4.6',
        organization: 'Z AI',
        intelligenceIndex: 56,
        omniscienceIndex: -44,
        pricePerMTokens: 1.00,
        outputSpeed: 114,
        latencyTTFT: 0.57,
        contextWindow: 200_000,
        isOpenWeights: true,
        detailsUrl: '/models/glm-4-6/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'Claude 4.5 Haiku',
        organization: 'Anthropic',
        intelligenceIndex: 55,
        omniscienceIndex: -6,
        pricePerMTokens: 2.00,
        outputSpeed: 78,
        latencyTTFT: 0.98,
        contextWindow: 200_000,
        isOpenWeights: false,
        detailsUrl: '/models/claude-4-5-haiku/providers',
        category: 'text',
        isReasoning: false
    },

    // === VALUE TIER (дёшево и качественно) ===
    {
        name: 'DeepSeek R1 0528',
        organization: 'DeepSeek',
        intelligenceIndex: 52,
        omniscienceIndex: -30,
        pricePerMTokens: 1.98,
        contextWindow: 128_000,
        isOpenWeights: true,
        detailsUrl: '/models/deepseek-r1/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'NVIDIA Nemotron 3 Nano',
        organization: 'NVIDIA',
        intelligenceIndex: 52,
        omniscienceIndex: -52,
        pricePerMTokens: 0.10,
        outputSpeed: 126,
        latencyTTFT: 0.24,
        contextWindow: 1_000_000,
        isOpenWeights: true,
        detailsUrl: '/models/nvidia-nemotron-3-nano-30b-a3b/providers',
        category: 'text',
        isReasoning: true
    },
    {
        name: 'gpt-oss-20B (high)',
        organization: 'OpenAI',
        intelligenceIndex: 52,
        omniscienceIndex: -65,
        pricePerMTokens: 0.10,
        outputSpeed: 238,
        latencyTTFT: 0.56,
        contextWindow: 131_000,
        isOpenWeights: true,
        detailsUrl: '/models/gpt-oss-20b/providers',
        category: 'text',
        isReasoning: false
    },
    {
        name: 'Mistral Large 3',
        organization: 'Mistral',
        intelligenceIndex: 38,
        omniscienceIndex: -41,
        pricePerMTokens: 0.75,
        outputSpeed: 47,
        latencyTTFT: 0.54,
        contextWindow: 256_000,
        isOpenWeights: true,
        detailsUrl: '/models/mistral-large-3/providers',
        category: 'text',
        isReasoning: false
    },
    {
        name: 'Llama 4 Maverick',
        organization: 'Meta',
        intelligenceIndex: 36,
        omniscienceIndex: -43,
        pricePerMTokens: 0.42,
        outputSpeed: 132,
        latencyTTFT: 0.43,
        contextWindow: 1_000_000,
        isOpenWeights: true,
        detailsUrl: '/models/llama-4-maverick/providers',
        category: 'text',
        isReasoning: false
    },
    {
        name: 'Llama 3.3 70B',
        organization: 'Meta',
        intelligenceIndex: 28,
        omniscienceIndex: -55,
        pricePerMTokens: 0.64,
        outputSpeed: 97,
        latencyTTFT: 0.48,
        contextWindow: 128_000,
        isOpenWeights: true,
        detailsUrl: '/models/llama-3-3-instruct-70b/providers',
        category: 'text',
        isReasoning: false
    },
    {
        name: 'Nova Micro',
        organization: 'Amazon',
        intelligenceIndex: 18,
        omniscienceIndex: -49,
        pricePerMTokens: 0.06,
        outputSpeed: 421,
        latencyTTFT: 0.35,
        contextWindow: 130_000,
        isOpenWeights: false,
        detailsUrl: '/models/nova-micro/providers',
        category: 'text',
        isReasoning: false
    },
];

// Кэш
const CACHE_KEY = 'aa_models_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа (данные обновляются редко)

interface CacheData {
    timestamp: number;
    data: AAModelData[];
}

/**
 * Получить модели от Artificial Analysis
 */
export async function fetchAAModels(): Promise<AAModelData[]> {
    // Проверяем кэш
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed: CacheData = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < CACHE_TTL) {
                return parsed.data;
            }
        }
    } catch (e) {
        // ignore
    }

    // Возвращаем статичные данные (в будущем можно добавить scraping)
    const data = AA_MODELS_DATA;

    // Сохраняем в кэш
    try {
        const cacheData: CacheData = {
            timestamp: Date.now(),
            data
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
        // ignore
    }

    return data;
}

/**
 * Получить TOP N моделей по Intelligence Index
 */
export function getTopByIntelligence(models: AAModelData[], limit: number = 10): AAModelData[] {
    return [...models]
        .sort((a, b) => b.intelligenceIndex - a.intelligenceIndex)
        .slice(0, limit);
}

/**
 * Получить лучшие модели по соотношению цена/качество
 * (Intelligence / Price ratio)
 */
export function getTopByValueRatio(models: AAModelData[], limit: number = 10): AAModelData[] {
    return [...models]
        .filter(m => m.pricePerMTokens > 0)
        .map(m => ({
            ...m,
            valueRatio: m.intelligenceIndex / m.pricePerMTokens
        }))
        .sort((a, b) => b.valueRatio - a.valueRatio)
        .slice(0, limit);
}

/**
 * Получить самые быстрые модели
 */
export function getTopBySpeed(models: AAModelData[], limit: number = 10): AAModelData[] {
    return [...models]
        .filter(m => m.outputSpeed && m.outputSpeed > 0)
        .sort((a, b) => (b.outputSpeed || 0) - (a.outputSpeed || 0))
        .slice(0, limit);
}

/**
 * Получить модели для кода
 */
export function getCodeModels(models: AAModelData[]): AAModelData[] {
    return models.filter(m => m.category === 'code');
}

/**
 * Получить open-source модели
 */
export function getOpenSourceModels(models: AAModelData[]): AAModelData[] {
    return models.filter(m => m.isOpenWeights);
}
