
import { ApiConfig, GenerationStats } from "../types";

// We use a CORS proxy because Replicate does not allow direct browser calls (CORS).
// In a production app, you should proxy these requests through your own backend.
const PROXY_URL = "https://corsproxy.io/?"; 
const REPLICATE_BASE_URL = "https://api.replicate.com/v1";

// Helper to construct Proxy URL with Cache Busting
// Fixes 404 errors caused by malformed URLs when appending params after encoding
const getProxyUrl = (targetUrl: string) => {
    // Check if URL already has params
    const separator = targetUrl.includes('?') ? '&' : '?';
    // Append timestamp to original URL to force new fetch from upstream
    const urlWithTimestamp = `${targetUrl}${separator}_ts=${Date.now()}`;
    // Encode the full URL including the new param
    return `${PROXY_URL}${encodeURIComponent(urlWithTimestamp)}`;
};

// Helper to convert base64 to data URI
const toDataUri = (base64: string, mimeType: string = 'image/png') => `data:${mimeType};base64,${base64}`;

// Helper to convert URL result back to base64
const urlToBase64 = async (url: string, signal?: AbortSignal): Promise<string> => {
    // 1. Try Direct Fetch (Fastest, works if CORS enabled on source)
    try {
        const response = await fetch(url, { signal });
        if (response.ok) {
            const blob = await response.blob();
            return await blobToBase64(blob);
        }
    } catch (e) {
        // Ignore and try proxy
    }

    if (signal?.aborted) throw new Error("Download Cancelled");

    // 2. Fallback to Proxy
    const targetUrl = getProxyUrl(url);
    
    try {
        const response = await fetch(targetUrl, { signal });
        if (!response.ok) throw new Error(`Image download failed: ${response.status}`);
        const blob = await response.blob();
        return await blobToBase64(blob);
    } catch (e: any) {
        if (e.name === 'AbortError') throw e;
        throw new Error(`Failed to download image: ${e.message}`);
    }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Remove the data:image/...;base64, prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

const pollPrediction = async (predictionUrl: string, token: string, signal?: AbortSignal): Promise<string> => {
    let attempts = 0;
    const maxAttempts = 60; // 60 * 2s = 120 seconds timeout
    
    while (attempts < maxAttempts) {
        if (signal?.aborted) throw new Error("Generation Cancelled");
        
        attempts++;
        
        // Use helper to ensure valid URL structure with cache buster
        const targetUrl = getProxyUrl(predictionUrl);
        
        const response = await fetch(targetUrl, {
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json",
            },
            signal
        });
        
        if (!response.ok) {
            // Handle rate limits
            if (response.status === 429) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }
            throw new Error(`Replicate Polling Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.status === "succeeded") {
            // Output can be a string (URL) or an array of strings depending on model
            const output = data.output;
            return Array.isArray(output) ? output[0] : output;
        } else if (data.status === "failed" || data.status === "canceled") {
            console.error("Replicate Error Details:", data.error);
            throw new Error(`Image generation ${data.status}: ${data.error || 'Unknown error'}`);
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error("Replicate Timeout: Generation took too long.");
};

export const removeBackground = async (imageBase64: string, apiConfig: ApiConfig): Promise<string> => {
    if (!apiConfig.replicateKey) throw new Error("Replicate API Key is missing");

    // Model: cjwbw/rembg
    const version = "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";
    const url = `${REPLICATE_BASE_URL}/predictions`;
    // For POST, we don't necessarily need cache busting, but encoding is needed
    const targetUrl = `${PROXY_URL}${encodeURIComponent(url)}`;
    
    const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
            "Authorization": `Token ${apiConfig.replicateKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            version: version,
            input: {
                image: toDataUri(imageBase64)
            }
        })
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error("Invalid Replicate API Key");
        const errText = await response.text();
        throw new Error(`Replicate Error (${response.status}): ${errText}`);
    }

    const prediction = await response.json();
    const resultUrl = await pollPrediction(prediction.urls.get, apiConfig.replicateKey);
    return await urlToBase64(resultUrl);
};

export const upscaleImage = async (imageBase64: string, apiConfig: ApiConfig): Promise<string> => {
    if (!apiConfig.replicateKey) throw new Error("Replicate API Key is missing");

    // Model: nightmareai/real-esrgan
    const version = "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73ab41510699dbdb8ca95";
    const url = `${REPLICATE_BASE_URL}/predictions`;
    const targetUrl = `${PROXY_URL}${encodeURIComponent(url)}`;
    
    const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
            "Authorization": `Token ${apiConfig.replicateKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            version: version,
            input: {
                image: toDataUri(imageBase64),
                scale: 2, // 2x upscale
                face_enhance: true
            }
        })
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error("Invalid Replicate API Key");
        const errText = await response.text();
        throw new Error(`Replicate Error (${response.status}): ${errText}`);
    }

    const prediction = await response.json();
    const resultUrl = await pollPrediction(prediction.urls.get, apiConfig.replicateKey);
    return await urlToBase64(resultUrl);
};

export const generateReplicateImage = async (
    prompt: string,
    modelId: string,
    apiConfig: ApiConfig,
    style: string,
    signal?: AbortSignal,
    imageSystemPrompt?: string
): Promise<{ base64: string, stats: GenerationStats }> => {
    if (!apiConfig.replicateKey) throw new Error("Replicate API Key is missing");
    
    if (signal?.aborted) throw new Error("Image Generation Cancelled");

    const startTime = Date.now();
    
    let finalPrompt = prompt;
    if (imageSystemPrompt) {
        finalPrompt = `${imageSystemPrompt}\n\nSubject: ${prompt}`;
    }
    if (style && style !== 'Realistic') {
        finalPrompt = `${finalPrompt}, style of ${style}, high quality`;
    }

    // Define Inputs based on common Replicate models
    const input: any = { prompt: finalPrompt };

    // Common settings for FLUX and SDXL
    if (modelId.includes("flux") || modelId.includes("sdxl")) {
        input.aspect_ratio = "16:9"; 
        input.output_format = "png";
        input.go_fast = true; // Optimization for Flux Schnell
    }

    // 1. Construct URL for Model-based prediction
    const [owner, name] = modelId.split('/');
    if (!owner || !name) throw new Error("Invalid Model ID format (expected owner/name)");

    const url = `${REPLICATE_BASE_URL}/models/${owner}/${name}/predictions`;
    const targetUrl = `${PROXY_URL}${encodeURIComponent(url)}`;

    const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
            "Authorization": `Token ${apiConfig.replicateKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            input: input
        }),
        signal
    });

    if (!response.ok) {
        const errText = await response.text();
        try {
            const errJson = JSON.parse(errText);
            throw new Error(`Replicate Gen Error: ${errJson.detail || errJson.error || response.statusText}`);
        } catch {
             throw new Error(`Replicate Gen Error (${response.status}): ${errText}`);
        }
    }

    const prediction = await response.json();
    
    // 2. Poll for result
    const resultUrl = await pollPrediction(prediction.urls.get, apiConfig.replicateKey, signal);
    
    // 3. Download Result
    const base64 = await urlToBase64(resultUrl, signal);

    const endTime = Date.now();

    return {
        base64,
        stats: {
            modelName: `Replicate: ${modelId}`,
            latencyMs: endTime - startTime,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0
        }
    };
};

// LIGHTWEIGHT TEST (NEW)
export const testImageGeneration = async (
    modelId: string,
    apiKey: string
): Promise<{ success: boolean, base64: string }> => {
    // Generate a simple, small request to verify the entire pipeline works.
    // Uses generateReplicateImage logic but wrapped for the test interface.
    
    const prompt = "A single red sphere, 3d render";
    const apiConfig = { 
        provider: 'replicate' as any, 
        geminiKey: '', openRouterKey: '', kieKey: '', 
        replicateKey: apiKey 
    };

    const result = await generateReplicateImage(prompt, modelId, apiConfig, 'Realistic');
    
    return { success: true, base64: result.base64 };
};
