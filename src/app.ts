import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
import logger, { createRequestLogger } from "./utils/logger.js";
import { cartRoutes } from "./routes/cart.routes.js";

const require = createRequire(import.meta.url);
let swaggerFile: any;
try {
  swaggerFile = require("./config/swagger-output.json");
} catch {
  logger.warn("Swagger output not found. Run `npm run swagger:gen` first.");
  swaggerFile = { info: { title: "Telecom Cart API", version: "1.0.0" }, paths: {} };
}

export function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.use((req, res, next) => {
    const requestId = uuidv4();
    req.requestId = requestId;
    req.logger = createRequestLogger(requestId);

    logger.info("Incoming request", { requestId, method: req.method, url: req.url });

    res.on("finish", () => {
      logger.info("Request completed", {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
      });
    });
    next();
  });

  // Serve Swagger UI
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

  // API Routes
  app.use("/api", cartRoutes);

  app.get("/", (_req, res) => {
    res.json({ message: "Telecom Cart API is running " });
  });

  // Error handler
  app.use((err: any, req: any, res: any, _next: any) => {
    const reqLogger = req.logger || logger;
    reqLogger.error({ err }, "Unhandled error");
    res.status(500).json({
      success: false,
      data: null,
      errors: [{ code: "INTERNAL_ERROR", message: err.message || "Server error" }],
    });
  });

  return app;
}
