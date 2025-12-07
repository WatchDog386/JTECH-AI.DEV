// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Universal environment getter — works on Vercel, Next.js, Vite, Node
const getEnv = (key: string) => {
  // 1. Node & Vercel serverless
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }

  // 2. Vite / client
  if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
    return import.meta.env[key];
  }

  return undefined;
};

// Auto-detect correct env style based on platform
const supabaseUrl =
  getEnv("NEXT_PUBLIC_SUPABASE_URL") ||
  getEnv("VITE_SUPABASE_URL") ||
  getEnv("SUPABASE_URL"); // Vercel auto inject
const supabaseAnonKey =
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  getEnv("VITE_SUPABASE_ANON_KEY") ||
  getEnv("SUPABASE_ANON_KEY"); // Vercel auto inject

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables missing. Ensure they exist in Vercel/Next.js/Vite config."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  db: {
    schema: "public",
  },
  global: {
    headers: { "x-jtech-ai": "jtechai-app" },
  },
});
