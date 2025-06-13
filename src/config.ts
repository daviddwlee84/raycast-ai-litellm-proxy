import * as dotenv from 'dotenv';
import { z } from 'zod/v4';

export const Config = z.object({
  port: z.coerce.number().int().positive().default(3000),
  apiKey: z
    .string()
    .trim()
    .min(1, 'API_KEY environment variable is required. Check your .env file'),
  baseUrl: z
    .url('BASE_URL must be a valid URL (e.g., http://localhost:4000/v1)')
    .default('http://localhost:4000/v1'),
  pingInterval: z.coerce.number().int().positive().default(10000),
  modelRefreshInterval: z.coerce.number().int().positive().default(300000),
});
export type Config = z.infer<typeof Config>;

export const getConfig = (): Config => {
  dotenv.config();
  return Config.parse({
    port: process.env.PORT,
    apiKey: process.env.API_KEY,
    baseUrl: process.env.BASE_URL,
    pingInterval: process.env.PING_INTERVAL,
    modelRefreshInterval: process.env.MODEL_REFRESH_INTERVAL,
  });
};
