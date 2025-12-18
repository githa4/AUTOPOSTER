
import { createClient } from '@supabase/supabase-js';

// Support both standard process.env (Create React App/Webpack) and import.meta.env (Vite)
const getEnv = (key: string, viteKey: string) => {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        return import.meta.env[viteKey];
    }
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return '';
};

// User provided credentials
const PROVIDED_URL = 'https://usbrjuqnaxbkrywbgawk.supabase.co';
const PROVIDED_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzYnJqdXFuYXhia3J5d2JnYXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzgwMjIsImV4cCI6MjA4MTMxNDAyMn0.BYTOzXOZLRjHhg1kVYR6d1tVwkjnjZltzoPWY5AT2D4';

const SUPABASE_URL = getEnv('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL') || PROVIDED_URL;
const SUPABASE_ANON_KEY = getEnv('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY') || PROVIDED_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase credentials missing. Cloud features will be disabled.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type IntegrationType = 'telegram' | 'facebook' | 'wordpress' | 'viber' | 'linkedin';

// Matches the SQL table 'integrations' structure
export interface DBIntegration {
    id: string;
    user_id: string;
    provider: IntegrationType;
    name: string;
    credentials: any; 
    is_active: boolean;
    created_at: string;
}

// Matches 'projects' table
export interface DBProject {
    id: string;
    user_id: string;
    name: string;
    config: any;
    created_at: string;
}

// Matches 'posts' table
export interface DBPost {
    id: string;
    user_id: string;
    project_id: string | null;
    topic: string;
    content: string;
    image_url: string | null; // Storage URL (do not store base64)
    status: 'draft' | 'published' | 'scheduled';
    stats: any; // JSONB
    created_at: string;
    // Extra fields stored in stats or separate columns if needed
    post_count?: number;
    image_prompt?: string;
    custom_system_prompt?: string;
    title?: string;
}

// Matches 'templates' table
export interface DBTemplate {
    id: string;
    user_id: string;
    name: string;
    config: any;
    created_at: string;
}

// --- UTILITIES ---

/**
 * Helper to convert Base64 string to Blob
 */
const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

/**
 * Uploads a base64 image to Supabase Storage 'post_images' bucket.
 * Returns the Public URL of the uploaded image.
 */
export const uploadPostImage = async (userId: string, base64Image: string): Promise<string | null> => {
    if (!userId || !base64Image) return null;

    try {
        const blob = base64ToBlob(base64Image);
        const fileName = `${userId}/${Date.now()}_gen.png`;

        const { data, error } = await supabase.storage
            .from('post_images')
            .upload(fileName, blob, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error("Storage Upload Error:", error);
            return null;
        }

        const { data: publicData } = supabase.storage
            .from('post_images')
            .getPublicUrl(fileName);

        return publicData.publicUrl;
    } catch (e) {
        console.error("Upload Logic Error:", e);
        return null;
    }
};
