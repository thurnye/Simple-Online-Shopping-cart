type CacheRecord = { json: any; expiresAt: number };

export class IdempotencyStore {
  private store = new Map<string, CacheRecord>();

  // Create a unique key that ties the request to a specific cart
  makeKey(contextId: string, key: string) {
    return `${contextId}:${key}`;
  }

  // Store a response for a given request (with an expiry)
  set(contextId: string, key: string, json: any, ttlMs: number) {
    const cacheKey = this.makeKey(contextId, key);
    this.store.set(cacheKey, { json, expiresAt: Date.now() + ttlMs });
  }

  // Retrieve a saved response if it hasn’t expired yet
  get(contextId: string, key: string) {
    const cacheKey = this.makeKey(contextId, key);
    const rec = this.store.get(cacheKey);
    if (!rec) return undefined;

    // If expired, remove it
    if (Date.now() >= rec.expiresAt) {
      this.store.delete(cacheKey);
      return undefined;
    }

    // Deep clone to avoid accidental modification
    return JSON.parse(JSON.stringify(rec.json));
  }
}

// Single shared instance used by the app
export const idempotencyStore = new IdempotencyStore();
