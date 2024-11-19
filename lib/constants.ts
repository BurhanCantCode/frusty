export const GROQ_MODELS = [
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B-32K",
    category: "Mistral",
    description: "Powerful open-source mixture-of-experts model",
    bestFor: ["General purpose", "Code generation", "Analysis"],
    limits: { requestsPerDay: 100, contextWindow: 32768 },
  },
  {
    id: "gemma2-9b-it",
    name: "Gemma 2 9B",
    category: "Google",
    description: "Google's efficient instruction-tuned model",
    bestFor: ["Chat", "Text generation", "Analysis"],
    limits: { requestsPerDay: 100, contextWindow: 8192 },
  },
  {
    id: "gemma-7b-it",
    name: "Gemma 7B",
    category: "Google",
    description: "Lightweight version of Gemma",
    bestFor: ["Chat", "Quick responses", "Analysis"],
    limits: { requestsPerDay: 100, contextWindow: 8192 },
  },
  {
    id: "llama-3.1-70b-versatile",
    name: "Llama 3.1 70B Versatile",
    category: "Meta",
    description: "Large versatile model with extended context",
    bestFor: ["Complex tasks", "Long-form content", "Analysis"],
    limits: { requestsPerDay: 100, contextWindow: 128000 },
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B Instant",
    category: "Meta",
    description: "Fast, lightweight Llama model",
    bestFor: ["Quick responses", "Simple tasks"],
    limits: { requestsPerDay: 100, contextWindow: 128000 },
  },
  {
    id: "llama-3.2-1b-preview",
    name: "Llama 3.2 1B Preview",
    category: "Meta",
    description: "Tiny but capable preview model",
    bestFor: ["Basic tasks", "Quick responses"],
    limits: { requestsPerDay: 100, contextWindow: 128000 },
  },
  {
    id: "llama-3.2-3b-preview",
    name: "Llama 3.2 3B Preview",
    category: "Meta",
    description: "Small but versatile preview model",
    bestFor: ["General tasks", "Efficient processing"],
    limits: { requestsPerDay: 100, contextWindow: 128000 },
  },
  {
    id: "llama-3.2-11b-vision-preview",
    name: "Llama 3.2 11B Vision",
    category: "Vision Models",
    description: "Vision-capable Llama model",
    bestFor: ["Image analysis", "Visual tasks", "Multimodal"],
    limits: { requestsPerDay: 100, contextWindow: 128000 },
    type: "vision"
  },
  {
    id: "llama-3.2-90b-vision-preview",
    name: "Llama 3.2 90B Vision",
    category: "Vision Models",
    description: "Large vision-capable model",
    bestFor: ["Complex visual tasks", "Detailed analysis"],
    limits: { requestsPerDay: 100, contextWindow: 128000 },
    type: "vision"
  },
  {
    id: "llama3-groq-70b-8192-tool-use-preview",
    name: "Llama 3 Groq 70B Tool",
    category: "Groq",
    description: "Large model optimized for tool use",
    bestFor: ["Tool integration", "Complex tasks"],
    limits: { requestsPerDay: 100, contextWindow: 8192 },
  },
  {
    id: "llama3-groq-8b-8192-tool-use-preview",
    name: "Llama 3 Groq 8B Tool",
    category: "Groq",
    description: "Efficient model for tool integration",
    bestFor: ["Quick tool use", "Simple automation"],
    limits: { requestsPerDay: 100, contextWindow: 8192 },
  },
  {
    id: "distil-whisper-large-v3-en",
    name: "Distil Whisper Large V3",
    category: "Audio Models",
    description: "Efficient English speech recognition model",
    bestFor: ["Fast English transcription", "Efficient processing"],
    limits: { requestsPerDay: 100, maxAudioSize: "25 MB" },
    type: "audio",
    provider: "huggingface"
  }
] as const;

export type ModelId = typeof GROQ_MODELS[number]['id'];
export type ModelCategory = typeof GROQ_MODELS[number]['category'];

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | {
    type: 'text' | 'image_url' | 'audio_url';
    text?: string;
    image_url?: { url: string };
    audio_url?: { url: string };
  }[];
}

export interface ModelCapabilities {
  supportsImage?: boolean;
  supportsAudio?: boolean;
}

export interface ChatSession {
  id: string;
  name: string;
  modelId: ModelId;
  messages: Message[];
  lastUpdated: number;
}

// Initialize with empty arrays for each model
export const initialChatSessions = GROQ_MODELS.reduce((acc, model) => {
  acc[model.id] = [];
  return acc;
}, {} as Record<ModelId, Message[]>);

// Helper functions
export function getModelById(id: ModelId) {
  return GROQ_MODELS.find(model => model.id === id);
}

export function getModelsByCategory(category: string) {
  return GROQ_MODELS.filter(model => {
    switch (category) {
      case 'Text':
        return model.category === 'Mistral' || model.category === 'Google';
      case 'Vision':
        return model.category === 'Vision Models';
      case 'Audio':
        return model.category === 'Audio Models';
      default:
        return false;
    }
  });
}

export function getModelCapabilities(model: typeof GROQ_MODELS[number]): ModelCapabilities {
  switch (model.category) {
    case 'Vision Models':
      return { supportsImage: true };
    case 'Audio Models':
      return { supportsAudio: true };
    default:
      return {};
  }
}

export function getAppropriateModel(hasImage: boolean, hasAudio: boolean, preferredModel: ModelId): ModelId {
  const model = getModelById(preferredModel);
  if (!model) return "mixtral-8x7b-32768";
  
  const capabilities = getModelCapabilities(model);
  
  if (hasImage && !capabilities.supportsImage) {
    return "llama-3.2-11b-vision-preview";
  }
  
  if (hasAudio && capabilities.supportsAudio) {
    return "distil-whisper-large-v3-en";
  }
  
  return preferredModel;
} 