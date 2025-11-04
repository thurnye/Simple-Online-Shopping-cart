import type { Logger } from "../utils/logger.js";

declare global {
  namespace Express {
    interface Request {
      logger?: Logger;
      requestId?: string;
    }
  }
}

export {};
