import { cartStore } from "../stores/cart.store.js";
import { idempotencyStore } from "../stores/idempotency.store.js";
import { salesforce } from "../clients/salesforceCartClient.js";
import type { CartItem, ExperienceCart } from "../types/index.js";

const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000; // 10 minutes

// A simple helper to create standard error responses
function problem(status: number, type: string, title: string, detail?: string) {
  return { status, type, title, detail };
}

export class CartService {
  // Create a new cart context (fake Salesforce session)
  createContext() {
    const ctx = salesforce.createContext();
    return {
      contextId: ctx.id,
      expiresAt: new Date(ctx.expiresAt).toISOString(),
      ttlSeconds: 15 * 60,
    };
  }

  // Extend how long a context stays valid
  extendContext(contextId: string) {
    const ctx = salesforce.extendContext(contextId);
    return {
      contextId: ctx.id,
      expiresAt: new Date(ctx.expiresAt).toISOString(),
      ttlSeconds: 15 * 60,
    };
  }

  // Get the current cart and price it
  getCart(contextId: string): ExperienceCart {
    const ctx = salesforce.getContext(contextId);

    const current = cartStore.get(contextId) || {
      contextId,
      items: [] as CartItem[],
      currency: "CAD",
      updatedAt: Date.now(),
      status: "open" as const,
    };

    // Ask Salesforce to calculate real prices/totals
    const priced = salesforce.priceCart(current.items);

    return {
      contextId,
      items: priced.items,
      currency: priced.currency,
      totals: priced.totals,
      status: current.status,
      updatedAt: new Date(current.updatedAt).toISOString(),
    };
  }

  // Add or update items in the cart
  upsertItems(contextId: string, items: CartItem[], idemKey?: string):
    | ExperienceCart
    | { replay: true; body: any } {
    // Make sure context is valid
    const ctx = salesforce.getContext(contextId);

    // If same request seen before, return the old response
    if (idemKey) {
      const cached = idempotencyStore.get(contextId, idemKey);
      if (cached) return { replay: true, body: cached };
    }

    // Update items in the in-memory cart
    cartStore.upsertItems(contextId, items);

    // Recalculate totals
    const result = this.getCart(contextId);

    // Save the result for 10 minutes if it had an Idempotency-Key
    if (idemKey) idempotencyStore.set(contextId, idemKey, result, IDEMPOTENCY_TTL_MS);

    return result;
  }

  // Remove one item from the cart
  removeItem(contextId: string, sku: string): ExperienceCart {
    const ctx = salesforce.getContext(contextId);
    const existed = cartStore.removeItem(contextId, sku);

    if (!existed) {
      throw problem(
        404,
        "https://errors/cart/sku-not-found",
        "SKU not in cart",
        `SKU ${sku} not found in cart`
      );
    }

    return this.getCart(contextId);
  }

  // “Checkout” the cart (pretend to complete an order)
  checkout(contextId: string) {
    const ctx = salesforce.getContext(contextId);
    const current = cartStore.get(contextId) || { items: [] as CartItem[] };
    const order = salesforce.checkout(current.items as CartItem[]);
    cartStore.setStatus(contextId, "checked_out");

    return {
      orderId: order.orderId,
      contextId,
      amount: order.amount,
      currency: order.currency,
      createdAt: order.createdAt,
    };
  }
}

// Single shared service instance
export const cartService = new CartService();
