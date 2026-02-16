import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
  intMode: 'number',
});

// Retry wrapper for database operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      const isNetworkError = error instanceof Error && 
        (error.message.includes('EAI_AGAIN') || 
         error.message.includes('ENOTFOUND') ||
         error.message.includes('ETIMEDOUT'));
      
      if (isNetworkError && attempt < maxRetries) {
        console.warn(`Database connection attempt ${attempt} failed, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}
