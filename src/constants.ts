// Cache and refresh intervals
export const DEFAULT_REFRESH_INTERVAL = 300000; // 5 minutes
export const DEFAULT_PING_INTERVAL = 10000; // 10 seconds

// Model defaults
export const DEFAULT_CONTEXT_LENGTH = 4096;
export const DEFAULT_CAPABILITIES = ['tools'] as const;

// Model context lengths
export const CONTEXT_LENGTHS = {
  CLAUDE_3: 200000,
  CLAUDE_SONNET_4: 200000,
  GPT_4O: 128000,
  GPT_4O_MINI: 128000,
  DEEPSEEK: 128000,
  GEMINI: 1000000,
  GPT_4: 8192,
  GPT_3_5_TURBO: 16385,
} as const;

// Server defaults
export const DEFAULT_PORT = 3000;
export const DEFAULT_BASE_URL = 'http://localhost:4000/v1';
export const DEFAULT_JSON_LIMIT = '100mb';

// Model size for Ollama compatibility
export const FIXED_MODEL_SIZE = 500000000;

// Parameter defaults
export const DEFAULT_PARAMETER_SIZE = '7B';
export const DEFAULT_QUANTIZATION = 'Q4_K_M';
export const DEFAULT_FORMAT = 'gguf';
export const DEFAULT_FAMILY = 'llama';
export const DEFAULT_EMBEDDING_LENGTH = 4096;
export const DEFAULT_PARAMETER_COUNT = 7000000000;
