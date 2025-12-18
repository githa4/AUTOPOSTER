
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
