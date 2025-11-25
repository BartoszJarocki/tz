import { z } from 'zod';

const envSchema = z.object({
  SLACK_BOT_TOKEN: z
    .string()
    .startsWith('xoxb-', 'SLACK_BOT_TOKEN must start with xoxb-'),
  SLACK_SIGNING_SECRET: z
    .string()
    .min(32, 'SLACK_SIGNING_SECRET must be at least 32 characters'),
  // Optional
  SLACK_APP_TOKEN: z.string().startsWith('xapp-').optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function getEnv(): Env {
  if (validatedEnv) return validatedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
      .join('\n');

    throw new Error(`Invalid environment variables:\n${errorMessages}`);
  }

  validatedEnv = result.data;
  return validatedEnv;
}

// For checking if env is valid without throwing
export function isEnvValid(): boolean {
  try {
    getEnv();
    return true;
  } catch {
    return false;
  }
}
