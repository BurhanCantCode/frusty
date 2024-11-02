export const config = {
  groqApiKey: process.env.GROQ_API_KEY || '',
  isDev: process.env.NODE_ENV === 'development'
};

if (!config.groqApiKey) {
  throw new Error('GROQ_API_KEY is not set');
} 