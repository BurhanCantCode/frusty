export const env = {
  GROQ_API_KEY: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Type-safe environment variable validation
const requiredEnvVars = ['NEXT_PUBLIC_GROQ_API_KEY'] as const;

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}); 