import OpenAI from 'openai';
import { makeApp } from './app';
import { getConfig } from './config';
import { loadModels } from './data/models';
import { makeLogger } from './logger';
import { makeMiddleware } from './middleware';

async function main() {
  const config = getConfig();
  const logger = makeLogger();

  // Load models from LiteLLM
  const models = await loadModels(config.baseUrl, config.apiKey, config.modelRefreshInterval);

  const middleware = makeMiddleware(logger);
  const openai = new OpenAI({
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
  });
  const app = makeApp({ config, middleware, models, openai });

  app.listen(config.port, () => {
    logger.info(`Server is up on port ${config.port}`);
    logger.info(`Loaded ${models.length} models from LiteLLM`);
  });
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
