import { CATALOG } from '../db/catalog.js';
import { contextStore } from '../stores/context.store.js';
import type { CartItem, PricedItem, Totals } from '../types/index.js';

type Context = { id: string; expiresAt: number };

const TTL_MS = 15 * 60 * 1000; // 15 minutes
const CURRENCY = 'CAD';

export class SalesforceCartClient {
  //Create a new fake Salesforce cart context
  createContext(): { id: string; expiresAt: number } {
    const id = `ctx_${Math.random().toString(36).slice(2, 10)}`;
    const expiresAt = Date.now() + TTL_MS;
    contextStore.upsert(id, expiresAt);
    return { id, expiresAt };
  }

  // Get an existing context and check if it’s valid
  getContext(id: string): Context {
    const rec = contextStore.get(id);
    if (!rec) throw this.notFound(id);

    // Ensure expiry validation always runs, even if test mutates expiresAt
    if (Date.now() > rec.expiresAt) {
      contextStore.delete?.(id); // safe optional delete
      throw this.expired(id, rec.expiresAt);
    }

    return { id, expiresAt: rec.expiresAt };
  }

  // Extend the life of an existing context
  extendContext(id: string): { id: string; expiresAt: number } {
    const rec = contextStore.get(id);
    if (!rec) throw this.notFound(id);
    if (contextStore.isExpired(id)) throw this.expired(id, rec.expiresAt);

    const newExp = Date.now() + TTL_MS;
    contextStore.extend(id, newExp);
    return { id, expiresAt: newExp };
  }

  // Calculate total prices for all cart items
  priceCart(items: CartItem[]): {
    items: PricedItem[];
    totals: Totals;
    currency: string;
  } {
    const priced: PricedItem[] = items.map((it) => {
      if (it.quantity <= 0 || !Number.isInteger(it.quantity)) {
        throw this.unprocessable('Invalid quantity');
      }
      const cat = CATALOG[it.sku];
      if (!cat) throw this.unprocessable(`Unknown SKU: ${it.sku}`);

      const subtotal = cat.price * it.quantity;
      return { ...it, price: cat.price, name: cat.name, subtotal };
    });

    const itemsTotal = priced.reduce((s, i) => s + i.subtotal, 0);
    const tax = Math.round(itemsTotal * 0.13); // simple 13% tax
    const fees = 0;
    const grandTotal = itemsTotal + tax + fees;

    return {
      items: priced,
      totals: { items: itemsTotal, tax, fees, grandTotal },
      currency: CURRENCY,
    };
  }

  // Pretend to process a checkout and create an order
  checkout(items: CartItem[]) {
    if (!items.length) throw this.unprocessable('Cart is empty');

    return {
      orderId: `ord_${Math.random().toString(36).slice(2, 10)}`,
      amount: this.priceCart(items).totals.grandTotal,
      currency: CURRENCY,
      createdAt: new Date().toISOString(),
    };
  }

  // --- Error helpers below ---

  private expired(id: string, when?: number) {
    const detail = when
      ? `Context ${id} expired at ${new Date(when).toISOString()}`
      : `Context ${id} expired`;
    return Object.assign(new Error(detail), {
      code: 409,
      type: 'context_expired',
    });
  }

  private notFound(id: string) {
    return Object.assign(new Error(`Context ${id} not found`), {
      code: 404,
      type: 'context_not_found',
    });
  }

  private unprocessable(detail: string) {
    return Object.assign(new Error(detail), {
      code: 422,
      type: 'unprocessable',
    });
  }
}

export const salesforce = new SalesforceCartClient();
