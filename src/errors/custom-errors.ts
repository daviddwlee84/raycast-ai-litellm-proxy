export class ModelNotFoundError extends Error {
  constructor(modelName: string) {
    super(`Model ${modelName} not found`);
    this.name = 'ModelNotFoundError';
  }
}

export class LiteLLMConnectionError extends Error {
  constructor(baseUrl: string, cause?: Error) {
    super(`Cannot connect to LiteLLM at ${baseUrl}. Is your LiteLLM server running?`);
    this.name = 'LiteLLMConnectionError';
    this.cause = cause;
  }
}

export class LiteLLMAuthError extends Error {
  constructor() {
    super('Authentication failed. Check your API_KEY in .env file');
    this.name = 'LiteLLMAuthError';
  }
}

export class LiteLLMNotFoundError extends Error {
  constructor() {
    super('LiteLLM endpoints not found. Check your BASE_URL in .env file');
    this.name = 'LiteLLMNotFoundError';
  }
}

export class StreamingError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Streaming error: ${message}`);
    this.name = 'StreamingError';
    this.cause = cause;
  }
}
