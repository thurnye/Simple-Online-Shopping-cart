# Telecom Cart Experience API

Thin Experience API over a non-persistent Salesforce-like cart context. Node 20 + TypeScript + Express. All state in memory; no DB.

## Quickstart

```bash
npm i
npm run dev
```

## Swagger

```bash
Swagger UI: http://localhost:3000/docs
```

Setup, run, test commands. Brief decisions and tradeoffs. Note any known gaps.

## Scripts

- To Generate Swagger + start in watch mode

```bash
npm run dev
```

- Compile TypeScript

```bash
npm run build
```

- run compiled build

```bash
npm start
```

- vitest unit tests

```bash
npm test
```

## Endpoints (summary)

- POST /api/cart/context

- GET /api/cart?contextId=...

- POST /api/cart/items (Idempotency-Key supported)

- DELETE /api/cart/items/:sku?contextId=...

- POST /api/cart/refreshCart

- POST /api/cart/checkout

See /docs (Swagger) and SPEC-B-api.md for details.

## Architecture

```bash
Controllers -> Services -> Stores/Clients.
```

SalesforceCartClient

```
simulates context expiry, pricing, and checkout.
See SPEC-A-Architecture.md for more details
```

## Decisions & Tradeoffs

- In-memory stores by design (non-persistent requirement).

- Idempotency for write paths (10 min TTL).(use random guid for now)

- Express for familiarity + minimal surface.

- Swagger autogen for fast docs; not fully hand-curated schemas.

## Known Gaps

- In-memory only: contexts reset on server restart.

- Minimal validation (enough for exercise).

- Swagger schemas are basic; could be expanded with zod/openapi decorators.

## Testing

Service unit tests cover pricing, expiry, idempotency, and checkout.

Controller unit tests cover validation, happy paths, and error paths.


# Note for the Idempotency-Key in the cart/items use a random string as this is supposed to be generated from the front end to track request 