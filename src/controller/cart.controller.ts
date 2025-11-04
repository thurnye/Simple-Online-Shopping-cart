import { Request, Response } from 'express';
import { cartService } from '../services/cart.service.js';
import { success, fail } from '../utils/response.js';

export class CartController {
  /** Create a new cart context */
  static createContext(req: Request, res: Response) {
    const log = req.logger!;
    log.info('Creating new cart context');

    try {
      const result = cartService.createContext();
      log.info('Cart context created successfully', {
        contextId: result.contextId,
      });
      return success(res, result, 'Cart context created', undefined, 201);
    } catch (err: any) {
      log.error('Error creating cart context', { err });
      return fail(
        res,
        err.message || 'Internal server error',
        err.statusCode || 500
      );
    }
  }

  /** Get the current cart */
  static getCart(req: Request, res: Response) {
    const log = req.logger!;
    const contextId = req.query.contextId as string | undefined;

    if (!contextId) {
      return fail(res, 'contextId is required', 400);
    }

    log.info('Fetching cart', { contextId });

    try {
      const result = cartService.getCart(contextId); // string only
      log.info('Cart fetched successfully', { contextId });
      return success(res, result, 'Cart fetched successfully');
    } catch (err: any) {
      log.error('Error fetching cart', { err, contextId });
      return fail(
        res,
        err.message || 'Internal server error',
        err.statusCode || 500
      );
    }
  }

  /** Add or update items in the cart (idempotent) */
  static upsertItems(req: Request, res: Response) {
    const log = req.logger!;
    const { contextId, items } = req.body;

    if (!contextId || !Array.isArray(items) || items.length === 0) {
      return fail(res, 'contextId and items are required', 400);
    }

    const idemKey = req.header('Idempotency-Key') || undefined;
    log.info('Upserting cart items', {
      contextId,
      idemKey,
      itemsCount: items.length,
    });

    try {
      const result = cartService.upsertItems(contextId, items, idemKey);

      if ((result as any).replay) {
        log.info('Idempotent replay detected', { contextId, idemKey });
        res.setHeader('Idempotent-Replay', 'true');
        return success(res, (result as any).body, 'Replay successful');
      }

      log.info('Items upserted successfully', { contextId });
      return success(res, result, 'Items added/updated successfully');
    } catch (err: any) {
      log.error('Error upserting cart items', { err, contextId });
      return fail(
        res,
        err.message || 'Internal server error',
        err.statusCode || 500
      );
    }
  }

  /** Remove an item from the cart */
  static removeItem(req: Request, res: Response) {
    const log = req.logger!;
    const contextId = req.query.contextId as string | undefined;
    const { sku } = req.params;

    if (!contextId) {
      return fail(res, 'contextId is required', 400);
    }

    log.info('Removing item from cart', { contextId, sku });

    try {
      const result = cartService.removeItem(contextId, sku); // string only
      log.info('Item removed successfully', { contextId, sku });
      return success(res, result, `Item ${sku} removed successfully`);
    } catch (err: any) {
      log.error('Error removing item', { err, contextId, sku });
      return fail(
        res,
        err.message || 'Internal server error',
        err.statusCode || 500
      );
    }
  }

  /** Extend cart context (refreshCart) */
  static refreshCart(req: Request, res: Response) {
    const log = req.logger!;
    const contextId = req.body.contextId as string | undefined;

    if (!contextId) {
      return fail(res, 'contextId is required', 400);
    }

    log.info('Extending cart context', { contextId });

    try {
      const result = cartService.extendContext(contextId); // string only
      log.info('Context extended successfully', {
        contextId,
        expiresAt: result.expiresAt,
      });
      return success(res, result, 'Context extended successfully');
    } catch (err: any) {
      log.error('Error extending cart context', { err, contextId });
      return fail(
        res,
        err.message || 'Internal server error',
        err.statusCode || 500
      );
    }
  }

  /** Checkout the cart */
  static checkout(req: Request, res: Response) {
    const log = req.logger!;
    const contextId = req.body.contextId as string | undefined;

    if (!contextId) {
      return fail(res, 'contextId is required', 400);
    }

    log.info('Processing cart checkout', { contextId });

    try {
      const result = cartService.checkout(contextId); // string only
      log.info('Cart checkout successful', {
        contextId,
        orderId: result.orderId,
      });
      return success(res, result, 'Checkout successful');
    } catch (err: any) {
      log.error('Error during checkout', { err, contextId });
      return fail(
        res,
        err.message || 'Internal server error',
        err.statusCode || 500
      );
    }
  }
}
