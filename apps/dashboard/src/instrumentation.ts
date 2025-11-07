// src/instrumentation.ts
import { validateEnv } from '@/config/env';
import z from 'zod';

// Register and validate environment variables at startup
export async function register() {
  const envValidationResult = validateEnv();

  if (envValidationResult.error) {
    const errorMessages = z.prettifyError(envValidationResult.error);
    console.info('❌ Environment variable validation failed:\n', errorMessages);
    throw new Error(errorMessages);
  }

  console.info('✅ Environment variables loaded successfully');
}
