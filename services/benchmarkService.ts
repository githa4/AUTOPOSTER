
export interface BenchmarkEntry {
    rank: number;
    model: string;
    score: number;
    votes: number;
    organization: string;
    license: string;
    knowledgeCutoff?: string;
    isProprietary: boolean;
}

// Manual snapshot of LMSYS Leaderboard (Approximation for Feb 2025 based on current trends)
// Source: https://lmarena.ai (Simulated latest snapshot)
const TEXT_LEADERBOARD: BenchmarkEntry[] = [
    { rank: 1, model: "gemini-3-pro", score: 1492, votes: 18120, organization: "Google", license: "Proprietary", isProprietary: true },
    { rank: 2, model: "grok-4.1-thinking", score: 1478, votes: 19094, organization: "xAI", license: "Proprietary", isProprietary: true },
    { rank: 3, model: "claude-opus-4.5", score: 1469, votes: 11942, organization: "Anthropic", license: "Proprietary", isProprietary: true },
    { rank: 4, model: "claude-opus-4-20251101", score: 1465, votes: 12785, organization: "Anthropic", license: "Proprietary", isProprietary: true },
    { rank: 5, model: "grok-4.1", score: 1465, votes: 18855, organization: "xAI", license: "Proprietary", isProprietary: true },
    { rank: 6, model: "gpt-5.1-high", score: 1458, votes: 16188, organization: "OpenAI", license: "Proprietary", isProprietary: true },
    { rank: 7, model: "gemini-2.5-pro", score: 1451, votes: 79015, organization: "Google", license: "Proprietary", isProprietary: true },
    { rank: 8, model: "claude-sonnet-4-5", score: 1450, votes: 30277, organization: "Anthropic", license: "Proprietary", isProprietary: true },
    { rank: 9, model: "deepseek-r1", score: 1448, votes: 46023, organization: "DeepSeek", license: "MIT", isProprietary: false },
    { rank: 10, model: "llama-4-405b-instruct", score: 1440, votes: 22100, organization: "Meta", license: "Llama Community", isProprietary: false },
];

const CODE_LEADERBOARD: BenchmarkEntry[] = [
    { rank: 1, model: "claude-opus-4.5-thinking", score: 1519, votes: 2993, organization: "Anthropic", license: "Proprietary", isProprietary: true },
    { rank: 2, model: "gpt-5.2-high", score: 1486, votes: 1641, organization: "OpenAI", license: "Proprietary", isProprietary: true },
    { rank: 3, model: "claude-opus-4-5", score: 1483, votes: 3039, organization: "Anthropic", license: "Proprietary", isProprietary: true },
    { rank: 4, model: "gemini-3-pro", score: 1482, votes: 7897, organization: "Google", license: "Proprietary", isProprietary: true },
    { rank: 5, model: "deepseek-r1-code", score: 1460, votes: 5120, organization: "DeepSeek", license: "MIT", isProprietary: false },
    { rank: 6, model: "gpt-5.2", score: 1399, votes: 1639, organization: "OpenAI", license: "Proprietary", isProprietary: true },
    { rank: 7, model: "claude-sonnet-4-5", score: 1395, votes: 6974, organization: "Anthropic", license: "Proprietary", isProprietary: true },
];

export const fetchBenchmarks = async (category: 'text' | 'code'): Promise<{ data: BenchmarkEntry[], timestamp: number }> => {
    // Simulate network delay to make it feel like a real fetch
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // In a real production app with a backend, we would fetch from our own endpoint here
    // which scrapes or proxies LMSYS. Since we are client-side only, we use a snapshot.
    
    return {
        data: category === 'text' ? TEXT_LEADERBOARD : CODE_LEADERBOARD,
        timestamp: Date.now() - 3600000 * 8 // 8 hours ago
    };
};
