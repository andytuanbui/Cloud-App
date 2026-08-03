export async function runNarrationProviderFallback(
  preferred: (() => Promise<boolean>) | undefined,
  fallback: (() => Promise<boolean>) | undefined,
): Promise<boolean> {
  if (preferred) {
    try {
      if (await preferred()) return true;
    } catch {
      // A configured AI provider may be offline; the local browser provider is next.
    }
  }
  if (!fallback) return false;
  try {
    return await fallback();
  } catch {
    return false;
  }
}
