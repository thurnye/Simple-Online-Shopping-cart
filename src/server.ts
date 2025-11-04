import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT || 3000);
const app = buildApp();

// Start the Express server
app.listen(PORT, "0.0.0.0", () => {
  console.log(` Swagger running at http://localhost:${PORT}/docs`);
  console.log(` Telecom Cart API is running at http://localhost:${PORT}`);
});
