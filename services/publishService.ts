
import { Integration, IntegrationProvider } from "../types";
import { sendToTelegram } from "./telegramService";

// This service is the "Router" for publishing. 
// It decides which logic to use based on the Integration Provider.

interface PublishOptions {
    isSilent?: boolean;
    inlineButtons?: any[];
}

export const publishContent = async (
    integration: Integration,
    text: string,
    imageBase64: string | null,
    options?: PublishOptions
): Promise<boolean> => {
    console.log(`Publishing to ${integration.provider} (${integration.name})...`);

    switch (integration.provider) {
        case 'telegram':
            return publishToTelegram(integration, text, imageBase64, options);
        case 'facebook':
            return publishToFacebook(integration, text, imageBase64);
        case 'wordpress':
            return publishToWordPress(integration, text, imageBase64);
        default:
            throw new Error(`Provider ${integration.provider} not implemented yet.`);
    }
};

const publishToTelegram = async (
    integration: Integration,
    text: string,
    imageBase64: string | null,
    options?: PublishOptions
) => {
    const { botToken, channelId, messageThreadId } = integration.credentials;
    
    // Reuse existing logic from telegramService
    return await sendToTelegram(
        { botToken, channelId, messageThreadId },
        text,
        imageBase64,
        options
    );
};

const publishToFacebook = async (integration: Integration, text: string, imageBase64: string | null) => {
    // Placeholder for FB Graph API logic
    console.warn("Facebook publishing logic to be implemented on Server Side via Supabase Functions for CORS safety.");
    throw new Error("Facebook integration requires Server-Side setup (Supabase Edge Functions).");
};

const publishToWordPress = async (integration: Integration, text: string, imageBase64: string | null) => {
    // Placeholder for WP REST API
    console.warn("WP publishing logic to be implemented.");
    throw new Error("WordPress integration coming soon.");
};
