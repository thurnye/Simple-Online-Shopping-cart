import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cartService } from '../src/services/cart.service.js';
import { success, fail } from '../src/utils/response.js';
import { CartController } from '../src/controller/cart.controller.js';

// Mock dependencies
vi.mock('../src/services/cart.service.js');
vi.mock('../src/utils/response.js');

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn();
  return res;
};

const mockReq = (
  body: any = {},
  query: any = {},
  params: any = {},
  headers: any = {}
) => {
  return {
    body,
    query,
    params,
    headers,
    header: (key: string) => headers[key],
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
  } as any;
};

describe('CartController', () => {
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();
    res = mockRes();
  });

  // --- CREATE CONTEXT ---
  it('should create a new cart context', () => {
    const fakeContext = {
      contextId: 'ctx_123',
      expiresAt: '2025-11-03T00:00:00Z',
    };
    (cartService.createContext as any).mockReturnValue(fakeContext);
    (success as any).mockImplementation((res: any, data: any) =>
      res.json(data)
    );

    const req = mockReq();
    CartController.createContext(req, res);

    expect(cartService.createContext).toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith(
      res,
      fakeContext,
      'Cart context created',
      undefined,
      201
    );
  });

  // --- GET CART ---
  it('should return the current cart when contextId is provided', () => {
    const fakeCart = { contextId: 'ctx_abc', items: [] };
    (cartService.getCart as any).mockReturnValue(fakeCart);
    (success as any).mockImplementation((res: any, data: any) =>
      res.json(data)
    );

    const req = mockReq({}, { contextId: 'ctx_abc' });
    CartController.getCart(req, res);

    expect(cartService.getCart).toHaveBeenCalledWith('ctx_abc');
    expect(success).toHaveBeenCalledWith(
      res,
      fakeCart,
      'Cart fetched successfully'
    );
  });

  it('should fail if contextId is missing in getCart', () => {
    const req = mockReq();
    CartController.getCart(req, res);
    expect(fail).toHaveBeenCalledWith(res, 'contextId is required', 400);
  });

  // --- UPSERT ITEMS ---
  it('should upsert items successfully', () => {
    const fakeCart = {
      contextId: 'ctx_123',
      items: [{ sku: 'PHONE123', quantity: 1 }],
    };
    (cartService.upsertItems as any).mockReturnValue(fakeCart);
    (success as any).mockImplementation((res: any, data: any) =>
      res.json(data)
    );

    const req = mockReq({ contextId: 'ctx_123', items: fakeCart.items });
    CartController.upsertItems(req, res);

    expect(cartService.upsertItems).toHaveBeenCalledWith(
      'ctx_123',
      fakeCart.items,
      undefined
    );
    expect(success).toHaveBeenCalledWith(
      res,
      fakeCart,
      'Items added/updated successfully'
    );
  });

  it('should fail if contextId or items are missing in upsertItems', () => {
    const req = mockReq({ contextId: '', items: [] });
    CartController.upsertItems(req, res);
    expect(fail).toHaveBeenCalledWith(
      res,
      'contextId and items are required',
      400
    );
  });

  // --- REMOVE ITEM ---
  it('should remove item successfully', () => {
    const fakeResult = { contextId: 'ctx_321', items: [] };
    (cartService.removeItem as any).mockReturnValue(fakeResult);
    (success as any).mockImplementation((res: any, data: any) =>
      res.json(data)
    );

    const req = mockReq({}, { contextId: 'ctx_321' }, { sku: 'PHONE123' });
    CartController.removeItem(req, res);

    expect(cartService.removeItem).toHaveBeenCalledWith('ctx_321', 'PHONE123');
    expect(success).toHaveBeenCalledWith(
      res,
      fakeResult,
      'Item PHONE123 removed successfully'
    );
  });

  it('should fail if contextId is missing in removeItem', () => {
    const req = mockReq({}, {}, { sku: 'PHONE123' });
    CartController.removeItem(req, res);
    expect(fail).toHaveBeenCalledWith(res, 'contextId is required', 400);
  });

  // --- refreshCart ---
  it('should extend context successfully', () => {
    const fakeExtended = {
      contextId: 'ctx_987',
      expiresAt: '2025-11-03T12:00:00Z',
    };
    (cartService.extendContext as any).mockReturnValue(fakeExtended);
    (success as any).mockImplementation((res: any, data: any) =>
      res.json(data)
    );

    const req = mockReq({ contextId: 'ctx_987' });
    CartController.refreshCart(req, res);

    expect(cartService.extendContext).toHaveBeenCalledWith('ctx_987');
    expect(success).toHaveBeenCalledWith(
      res,
      fakeExtended,
      'Context extended successfully'
    );
  });

  it('should fail if contextId is missing in refreshCart', () => {
    const req = mockReq();
    CartController.refreshCart(req, res);
    expect(fail).toHaveBeenCalledWith(res, 'contextId is required', 400);
  });

  // --- CHECKOUT ---
  it('should checkout successfully', () => {
    const fakeCheckout = { orderId: 'ord_999', amount: 100 };
    (cartService.checkout as any).mockReturnValue(fakeCheckout);
    (success as any).mockImplementation((res: any, data: any) =>
      res.json(data)
    );

    const req = mockReq({ contextId: 'ctx_111' });
    CartController.checkout(req, res);

    expect(cartService.checkout).toHaveBeenCalledWith('ctx_111');
    expect(success).toHaveBeenCalledWith(
      res,
      fakeCheckout,
      'Checkout successful'
    );
  });

  it('should fail if contextId is missing in checkout', () => {
    const req = mockReq();
    CartController.checkout(req, res);
    expect(fail).toHaveBeenCalledWith(res, 'contextId is required', 400);
  });
});
