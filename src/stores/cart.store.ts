import type { CartItem } from "../types/index.js";

type CartRecord = {
  contextId: string;
  items: CartItem[];
  currency: string;
  updatedAt: number;
  status: "open" | "checked_out";
};

export class CartStore {
  private store = new Map<string, CartRecord>();

  // Retrieve the current cart by context ID
  get(contextId: string): CartRecord | undefined {
    return this.store.get(contextId);
  }

  // Replace or create a new cart record
  set(contextId: string, rec: CartRecord) {
    this.store.set(contextId, rec);
  }

  // Add or update items in the cart
  upsertItems(contextId: string, items: CartItem[], currency = "CAD") {
    const existing = this.store.get(contextId);
    const now = Date.now();

    if (!existing) {
      this.store.set(contextId, {
        contextId,
        items: [...items],
        currency,
        updatedAt: now,
        status: "open",
      });
      return;
    }

    // merge old and new items (update quantity if exists)
    const map = new Map<string, CartItem>();
    for (const it of existing.items) map.set(it.sku, { ...it });
    for (const it of items) {
      if (it.quantity <= 0) map.delete(it.sku);
      else map.set(it.sku, { sku: it.sku, quantity: it.quantity });
    }

    existing.items = Array.from(map.values());
    existing.updatedAt = now;
    this.store.set(contextId, existing);
  }

  // Remove one specific item from the cart
  removeItem(contextId: string, sku: string) {
    const existing = this.store.get(contextId);
    if (!existing) return false;
    const before = existing.items.length;
    existing.items = existing.items.filter((i) => i.sku !== sku);
    existing.updatedAt = Date.now();
    this.store.set(contextId, existing);
    return existing.items.length !== before;
  }

  // Mark cart as open or checked out
  setStatus(contextId: string, status: "open" | "checked_out") {
    const existing = this.store.get(contextId);
    if (!existing) return;
    existing.status = status;
    existing.updatedAt = Date.now();
    this.store.set(contextId, existing);
  }
}

export const cartStore = new CartStore();
