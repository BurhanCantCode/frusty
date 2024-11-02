export const GROQ_MODELS = [
  {
    id: "llama-3.2-11b-vision-preview",
    name: "Llama Vision",
    description: "Vision-capable model for image and text analysis",
    supportsImage: true
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    description: "Powerful model for complex tasks",
    supportsImage: false
  },
  {
    id: "gemma-7b-it",
    name: "Gemma 7B",
    description: "Efficient model for general purposes",
    supportsImage: false
  }
] as const;

export type ModelId = (typeof GROQ_MODELS)[number]['id'];

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string | {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }[];
}; 