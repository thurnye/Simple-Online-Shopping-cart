## Architecture And Abstractions Spec.

Write the SPEC-A-architecture.md for this simple online shopping cart backend project called Telecom Cart API.
It’s a small REST API built with Express, using in-memory stores (no database) and a fake SalesforceCartClient to simulate cart operations, expiry, and checkout.
The goal is to show a clean, modular design and explain how the parts connect.

Include:

- A short overview of the architecture and folder structure (routes, controllers, services, stores, clients, utils).

- A simple diagram or bullet list showing how data flows between components.

- One short paragraph per main abstraction (CartService, ContextStore, SalesforceCartClient, etc.).

- How idempotency and context expiry are handled in memory.

- Why Express, TypeScript, and in-memory logic were chosen.

A short section on logging (Winston) and documentation (Swagger).

## Endpoint Contracts Spec.

Write the SPEC-B-api.md for a Node.js + TypeScript backend project called Telecom Cart API.
It’s a small REST API that provides a thin Experience API layer over a simulated Salesforce cart.

The system has no database — all data lives in memory and expires after a short time.

Include:

- A list of all REST endpoints (POST /cart/context, GET /cart, POST /cart/items, DELETE /cart/items/:sku, POST /cart/refreshCart, POST /cart/checkout).

For each endpoint, describe:

- Purpose (what it does)

- HTTP method and path

- Request body or query parameters (with examples)

- Response structure (success + error example)

- Status codes

- Use simple, clear JSON examples.

- Keep it consistent with a standard REST API format.

End with a short section describing common response wrapper format (e.g., { success, data, message }) used by all endpoints.

For SPEC-A-architecture.md and SPEC-B-api.md Write it in clean Markdown, easy to skim, as if it’s part of a public developer API doc.


### followup prompt
- create the respective files in the root dir of the project 