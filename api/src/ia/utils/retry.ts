export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 500,
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed:`, error);

      if (i < attempts - 1) {
        const backoff = delayMs * Math.pow(2, i);
        await new Promise((res) => setTimeout(res, backoff));
      }
    }
  }

  throw lastError;
}
