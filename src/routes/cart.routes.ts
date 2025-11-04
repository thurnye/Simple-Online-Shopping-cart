import express from 'express';
import { CartController } from '../controller/cart.controller';

export const cartRoutes = express.Router();

/* --- Cart Context Routes --- */
cartRoutes.post('/cart/context', CartController.createContext);
cartRoutes.get('/cart', CartController.getCart);

/* --- Cart Item Routes --- */
cartRoutes.post('/cart/items', CartController.upsertItems);
cartRoutes.delete('/cart/items/:sku', CartController.removeItem);

/* --- Session & Checkout --- */
cartRoutes.post('/cart/refreshCart', CartController.refreshCart);
cartRoutes.post('/cart/checkout', CartController.checkout);
