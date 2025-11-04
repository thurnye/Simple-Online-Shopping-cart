import { describe, it, expect, beforeEach } from 'vitest';
import { cartService } from '../src/services/cart.service.js';
import { contextStore } from '../src/stores/context.store.js';

describe('CartService', () => {
  let contextId: string;

  beforeEach(() => {
    // Create new cart context before each test
    const result = cartService.createContext();
    contextId = result.contextId;
  });

  it('should create a new cart context', () => {
    const result = cartService.createContext();
    expect(result).toHaveProperty('contextId');
    expect(result.expiresAt).toBeDefined();
  });

  it('should allow adding an item to the cart', () => {
    const item = { sku: 'PHONE123', quantity: 1 };
    const updatedCart = cartService.upsertItems(contextId, [item]);
    if ('replay' in updatedCart)
      throw new Error('Expected ExperienceCart, got replay');
    expect(updatedCart.items.length).toBeGreaterThan(0);
    expect(updatedCart.items[0].sku).toBe('PHONE123');
  });

  it('should update quantity if item already exists', () => {
    cartService.upsertItems(contextId, [{ sku: 'MODEM001', quantity: 1 }]);
    const updatedCart = cartService.upsertItems(contextId, [
      { sku: 'MODEM001', quantity: 3 },
    ]);
    if ('replay' in updatedCart)
      throw new Error('Expected ExperienceCart, got replay');
    expect(updatedCart.items[0].quantity).toBe(3);
  });

  it('should remove an item from the cart', () => {
    cartService.upsertItems(contextId, [{ sku: 'SIMCARD', quantity: 2 }]);
    const result = cartService.removeItem(contextId, 'SIMCARD');
    expect(result.items.length).toBe(0);
  });

  it('should extend context expiry when refreshCart is called', () => {
    const before = cartService.getCart(contextId);
    const extended = cartService.extendContext(contextId);
    expect(new Date(extended.expiresAt).getTime()).toBeGreaterThan(
      new Date(before.updatedAt).getTime()
    );
  });

  it('should simulate successful checkout', () => {
    // Add an item to prepare the cart for checkout
    cartService.upsertItems(contextId, [{ sku: 'INTERNET_PACK', quantity: 1 }]);

    // Perform checkout
    const result = cartService.checkout(contextId);

    // Verify order details
    expect(result).toHaveProperty('orderId');
    expect(result).toHaveProperty('contextId');
    expect(result).toHaveProperty('amount');
    expect(result).toHaveProperty('currency');
    expect(result).toHaveProperty('createdAt');

    // Also check that the cart is now marked as checked_out
    const cart = cartService.getCart(contextId);
    expect(cart.status).toBe('checked_out');
  });

  it('should throw if context is expired', () => {
    const expiredContext = cartService.createContext();

    // Force expiry in the actual store
    contextStore.extend(expiredContext.contextId, Date.now() - 5000);

    expect(() => cartService.getCart(expiredContext.contextId)).toThrowError();
  });

  it('should replay idempotent request if same key is used', () => {
    const idemKey = 'REQ123';
    const item = { sku: 'PLAN_X', quantity: 1 };

    const first = cartService.upsertItems(contextId, [item], idemKey);
    const second = cartService.upsertItems(contextId, [item], idemKey);

    // Use type narrowing to handle union type safely
    if ('replay' in second) {
      expect(second.replay).toBe(true);
      expect(second.body.items[0].sku).toBe('PLAN_X');
    } else {
      throw new Error('Expected replay response on second call');
    }
  });
});
