export type ContextId = string;

export interface CartItem {
  sku: string;
  quantity: number; // must be at least 1
}

export interface PricedItem extends CartItem {
  price: number; // stored in cents 
  name?: string;
  subtotal: number; // price * quantity
}

export interface Totals {
  items: number;     // total of all item subtotals
  tax: number;       // tax amount
  fees: number;      // extra fees if any
  grandTotal: number;// total + tax + fees
}

export interface ExperienceCart {
  contextId: ContextId;
  items: PricedItem[];
  currency: string; // e.g., "CAD"
  totals: Totals;
  status: "open" | "checked_out";
  updatedAt: string; // ISO date string
}
