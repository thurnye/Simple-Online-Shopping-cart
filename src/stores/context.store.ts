type ContextRecord = {
  contextId: string;
  expiresAt: number; // when this context will expire (timestamp in ms)
};

export class ContextStore {
  private store = new Map<string, ContextRecord>();

  // Create or update a context
  upsert(contextId: string, expiresAt: number) {
    this.store.set(contextId, { contextId, expiresAt });
  }

  // Get a context by its ID
  get(contextId: string): ContextRecord | undefined {
    return this.store.get(contextId);
  }

  // Check if a context has expired
  isExpired(contextId: string, now = Date.now()): boolean {
    const rec = this.store.get(contextId);
    if (!rec) return true; // not found counts as expired
    return now >= rec.expiresAt;
  }

  // Extend how long a context is valid
  extend(contextId: string, newExpiresAt: number) {
    const rec = this.store.get(contextId);
    if (!rec) return;
    rec.expiresAt = newExpiresAt;
    this.store.set(contextId, rec);
  }

  // Delete a context completely
  delete(contextId: string) {
    this.store.delete(contextId);
  }
}

// export a single shared instance
export const contextStore = new ContextStore();
