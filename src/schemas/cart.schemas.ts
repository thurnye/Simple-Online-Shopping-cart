import { z } from 'zod';

// No input needed to create a new context
export const createContextSchema = z.object({});

// For routes that expect a context ID in the query string
export const contextQuerySchema = z.object({
  contextId: z.string().min(1, 'contextId is required'),
});

// Add or update items in a cart
export const upsertItemsSchema = z.object({
  contextId: z.string().min(1, 'contextId is required'),
  items: z
    .array(
      z.object({
        sku: z.string().min(1, 'SKU is required'),
        quantity: z.number().int().min(1, 'quantity must be >= 1'),
      })
    )
    .min(1, 'At least one item must be provided'),
});

// Remove item from a cart
export const removeItemSchema = z.object({
  contextId: z.string().min(1),
});

// Extend session (refreshCart)
export const refreshCartSchema = z.object({
  contextId: z.string().min(1),
});

// Checkout a cart
export const checkoutSchema = z.object({
  contextId: z.string().min(1),
});
