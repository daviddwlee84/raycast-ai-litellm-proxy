import crypto from 'crypto';
import { z } from 'zod/v4';

export const ModelConfig = z.object({
  name: z.string(),
  id: z.string(),
  contextLength: z.number(),
  capabilities: z.array(z.enum(['vision', 'tools'])),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  max_tokens: z.int().min(1).optional(),
  extra: z.record(z.string(), z.any()).optional(),
});
export type ModelConfig = z.infer<typeof ModelConfig>;

// LiteLLM API response schema
const LiteLLMModel = z.object({
  id: z.string(),
  object: z.literal('model'),
  created: z.number().optional(),
  owned_by: z.string().optional(),
});

const LiteLLMResponse = z.object({
  data: z.array(LiteLLMModel),
});

// Detailed model info response schema
const DetailedModelInfo = z.object({
  model_name: z.string(),
  litellm_params: z.object({
    model: z.string(),
  }),
  model_info: z
    .object({
      max_tokens: z.number().optional(),
      max_input_tokens: z.number().optional(),
      max_output_tokens: z.number().optional(),
      litellm_provider: z.string().optional(),
      mode: z.string().optional(),
      supports_vision: z.boolean().nullable().optional(),
      supports_function_calling: z.boolean().nullable().optional(),
      supports_tool_choice: z.boolean().nullable().optional(),
    })
    .optional(),
});

const DetailedLiteLLMResponse = z.object({
  data: z.array(DetailedModelInfo),
});

// Model cache
interface ModelCache {
  models: ModelConfig[];
  lastFetch: number;
  ttl: number;
}

let modelCache: ModelCache | null = null;
const DEFAULT_REFRESH_INTERVAL = 300000; // 5 minutes
const DEFAULT_CONTEXT_LENGTH = 4096;
const DEFAULT_CAPABILITIES: ModelConfig['capabilities'] = ['tools'];

// Vision model patterns
const VISION_MODEL_PATTERNS = [
  /gpt-4.*vision/i,
  /gpt-4o/i,
  /claude-3/i,
  /gemini.*pro.*vision/i,
  /gemini.*flash/i,
  /llava/i,
];

function hasVisionCapability(modelId: string): boolean {
  return VISION_MODEL_PATTERNS.some((pattern) => pattern.test(modelId));
}

function detectCapabilitiesFromLiteLLM(
  modelInfo?: z.infer<typeof DetailedModelInfo>['model_info'],
): ModelConfig['capabilities'] {
  const capabilities: ModelConfig['capabilities'] = [];

  // Use LiteLLM's actual capability flags (most reliable)
  if (modelInfo) {
    if (modelInfo.supports_function_calling === true || modelInfo.supports_tool_choice === true) {
      capabilities.push('tools');
    }
    if (modelInfo.supports_vision === true) {
      capabilities.push('vision');
    }
  }

  // If we don't have any capabilities detected, default to tools for chat models
  if (capabilities.length === 0) {
    capabilities.push('tools');
  }

  return capabilities;
}

function detectCapabilitiesFromProvider(
  modelName: string,
  provider?: string,
): ModelConfig['capabilities'] {
  const capabilities: ModelConfig['capabilities'] = ['tools']; // Default for chat models

  // Provider-based detection (more reliable than pattern matching)
  if (provider) {
    switch (provider.toLowerCase()) {
      case 'openai':
        if (
          modelName.includes('gpt-4') &&
          (modelName.includes('vision') || modelName.includes('4o'))
        ) {
          capabilities.push('vision');
        }
        break;
      case 'anthropic':
        if (modelName.includes('claude-3')) {
          capabilities.push('vision');
        }
        break;
      case 'vertex_ai':
      case 'gemini':
        if (
          modelName.includes('gemini') &&
          (modelName.includes('pro') || modelName.includes('flash'))
        ) {
          capabilities.push('vision');
        }
        break;
    }
  } else {
    // Fallback to pattern matching if no provider info
    if (hasVisionCapability(modelName)) {
      capabilities.push('vision');
    }
  }

  return capabilities;
}

function getModelMetadata(modelId: string): {
  contextLength: number;
  capabilities: ModelConfig['capabilities'];
} {
  const capabilities: ModelConfig['capabilities'] = [...DEFAULT_CAPABILITIES];

  if (hasVisionCapability(modelId)) {
    capabilities.push('vision');
  }

  // Set context length based on known model patterns
  let contextLength = DEFAULT_CONTEXT_LENGTH;

  if (modelId.includes('claude-3') || modelId.includes('claude-sonnet-4')) {
    contextLength = 200000;
  } else if (
    modelId.includes('gpt-4o') ||
    modelId.includes('deepseek') ||
    modelId.includes('gpt-4o-mini')
  ) {
    contextLength = 128000;
  } else if (modelId.includes('gemini')) {
    contextLength = 1000000;
  } else if (modelId.includes('gpt-4')) {
    contextLength = 8192;
  }

  return { contextLength, capabilities };
}

function convertDetailedLiteLLMToModelConfig(response: unknown): ModelConfig[] {
  try {
    const parsedResponse = DetailedLiteLLMResponse.parse(response);

    return parsedResponse.data.map((model) => {
      const modelInfo = model.model_info;

      // Use LiteLLM's context length if available, otherwise fall back to our detection
      const contextLength =
        modelInfo?.max_tokens ||
        modelInfo?.max_input_tokens ||
        getModelMetadata(model.model_name).contextLength;

      // Use LiteLLM's capability flags (most reliable), with fallback to provider detection
      const capabilities =
        detectCapabilitiesFromLiteLLM(modelInfo) ||
        detectCapabilitiesFromProvider(model.model_name, modelInfo?.litellm_provider);

      return {
        name: model.model_name,
        id: model.litellm_params.model,
        contextLength,
        capabilities,
      };
    });
  } catch (error) {
    console.warn('Failed to parse detailed model info, falling back to basic parsing');
    // If parsing fails, treat as basic response
    if (response.data && Array.isArray(response.data)) {
      return convertLiteLLMToModelConfig(response.data);
    }
    throw error;
  }
}

function convertLiteLLMToModelConfig(litellmModels: z.infer<typeof LiteLLMModel>[]): ModelConfig[] {
  return litellmModels.map((model) => {
    const { contextLength, capabilities } = getModelMetadata(model.id);

    return {
      name: model.id, // Use the model ID directly as the display name
      id: model.id,
      contextLength,
      capabilities,
    };
  });
}

async function fetchModelsFromLiteLLM(baseUrl: string, apiKey?: string): Promise<ModelConfig[]> {
  // Try the detailed model/info endpoint first, fall back to basic /models
  const modelInfoUrl = new URL('/model/info', baseUrl).toString();
  const modelsUrl = new URL('/models', baseUrl).toString();

  // First try to get detailed model info
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    // Add Authorization header if API key is provided
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(modelInfoUrl, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      const modelCount = Array.isArray(data?.data) ? data.data.length : 0;
      console.log(`Successfully fetched detailed model info for ${modelCount} models`);
      // If we get detailed info, use it
      return convertDetailedLiteLLMToModelConfig(data);
    }
  } catch (_error) {
    console.log('Model info endpoint not available, falling back to basic /models');
  }

  // Fallback to basic /models endpoint
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    // Add Authorization header if API key is provided
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(modelsUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const modelCount = Array.isArray(data?.data) ? data.data.length : 0;
    console.log(`Fallback to basic /models endpoint, found ${modelCount} models`);
    const parsedResponse = LiteLLMResponse.parse(data);

    return convertLiteLLMToModelConfig(parsedResponse.data);
  } catch (error) {
    console.warn('Failed to fetch models from LiteLLM:', error);
    throw error;
  }
}

function getFallbackModels(): ModelConfig[] {
  return [
    {
      name: 'GPT-3.5 Turbo',
      id: 'gpt-3.5-turbo',
      contextLength: 4096,
      capabilities: ['tools'],
    },
  ];
}

export async function loadModels(
  baseUrl: string,
  apiKey?: string,
  refreshInterval?: number,
): Promise<ModelConfig[]> {
  const modelRefreshInterval = refreshInterval || DEFAULT_REFRESH_INTERVAL;
  const now = Date.now();

  // Return cached models if still valid
  if (modelCache && now - modelCache.lastFetch < modelRefreshInterval) {
    return modelCache.models;
  }

  try {
    const models = await fetchModelsFromLiteLLM(baseUrl, apiKey);

    // Update cache
    modelCache = {
      models,
      lastFetch: now,
      ttl: modelRefreshInterval,
    };

    console.log(`Successfully loaded ${models.length} models from LiteLLM`);
    return models;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to load models from LiteLLM:', errorMessage);

    // Check if it's a connection error
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
      console.error(`Cannot connect to LiteLLM at ${baseUrl}. Is your LiteLLM server running?`);
    } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
      console.error('Authentication failed. Check your API_KEY in .env file');
    } else if (errorMessage.includes('404')) {
      console.error('LiteLLM endpoints not found. Check your BASE_URL in .env file');
    }

    // If we have cached models, use them even if expired
    if (modelCache?.models) {
      console.log('Using expired cached models');
      return modelCache.models;
    }

    // Last resort: use fallback models
    const fallbackModels = getFallbackModels();
    console.log('Using fallback models:', fallbackModels.map((m) => m.name).join(', '));
    return fallbackModels;
  }
}

export const findModelConfig = (
  models: ModelConfig[],
  modelName: string,
): ModelConfig | undefined => {
  return models.find((config) => config.name === modelName);
};

function generateDigest(modelName: string): string {
  return crypto.createHash('sha256').update(modelName).digest('hex');
}

export const generateModelsList = (models: ModelConfig[]) => {
  return {
    models: models.map((config) => ({
      name: config.name,
      model: config.id,
      modified_at: new Date().toISOString(),
      size: 500000000, // Fixed size
      digest: generateDigest(config.id),
      details: {
        parent_model: '',
        format: 'gguf',
        family: 'llama',
        families: ['llama'],
        parameter_size: '7B',
        quantization_level: 'Q4_K_M',
      },
    })),
  };
};

export const generateModelInfo = (models: ModelConfig[], modelName: string) => {
  const config = findModelConfig(models, modelName);

  if (!config) {
    throw new Error(`Model ${modelName} not found`);
  }

  return {
    modelfile: `FROM ${config.name}`,
    parameters: 'stop "<|eot_id|>"',
    template: '{{ .Prompt }}',
    details: {
      parent_model: '',
      format: 'gguf',
      family: 'llama',
      families: ['llama'],
      parameter_size: '7B',
      quantization_level: 'Q4_K_M',
    },
    model_info: {
      'general.architecture': 'llama',
      'general.file_type': 2,
      'general.parameter_count': 7000000000,
      'llama.context_length': config.contextLength,
      'llama.embedding_length': 4096,
      'tokenizer.ggml.model': 'gpt2',
    },
    capabilities: ['completion', ...config.capabilities],
  };
};
