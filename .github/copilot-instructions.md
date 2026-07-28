# AI Coding Agent Instructions

## Architecture Overview

This is a **microservices-based e-commerce platform** using:
- **Monorepo**: Turborepo + pnpm workspaces (`apps/*` and `packages/*`)
- **Event-driven communication**: Kafka for async messaging between services
- **Polyglot persistence**: PostgreSQL (products), MongoDB (orders)
- **Authentication**: Clerk for all services and frontends
- **Payment**: Razorpay (primary) and Stripe (legacy)

### Service Boundaries & Ports

```
Frontend:
- client (Next.js):      localhost:3002 - Customer-facing storefront
- admin (Next.js):       localhost:3003 - Admin dashboard

Backend Services:
- product-service:       :8000 - Express + Prisma (PostgreSQL)
- order-service:         :8001 - Fastify + Mongoose (MongoDB)
- payment-service:       :8002 - Hono + Razorpay/Stripe
- auth-service:          :8003 - Express + Clerk
- email-service:         :8004 - Handles email notifications

Infrastructure:
- Kafka:                 :9094 (external), :9092 (internal)
- Kafka UI:              :8080
- PostgreSQL:            :5432
- MongoDB:               :27017
```

## Kafka Event Flow (Critical)

Services communicate via Kafka topics in `@repo/kafka` package:

**Key Topics & Handlers:**
- `product.created`, `product.deleted` → payment-service creates/deletes Stripe products
- `payment.successful` → order-service creates order ([apps/order-service/src/utils/subscriptions.ts](../apps/order-service/src/utils/subscriptions.ts))
- `user.created` → downstream services sync user data
- `order.created` → email-service sends confirmation

**Publishing events:**
```typescript
// From any service
import { producer } from "./utils/kafka.js";
await producer.send("topic.name", { value: data });
```

**Subscribing to events:**
```typescript
// In utils/subscriptions.ts
consumer.subscribe([
  { topicName: "event.name", topicHandler: async (message) => { /*...*/ } }
]);
```

## Developer Workflows

### Starting the Stack

**Option 1 - All services (Windows PowerShell):**
```powershell
.\start-all.ps1  # Starts Kafka + all 7 services in separate terminals
```

**Option 2 - Individual services:**
```bash
# Start infrastructure first
cd packages/kafka && docker-compose up -d

# Then start services individually
pnpm --filter product-service dev
pnpm --filter order-service dev
pnpm --filter payment-service dev
# etc...
```

**Option 3 - Concurrent (single terminal):**
```bash
pnpm dev:all  # Runs all services with concurrently
```

### Database Operations

**Product DB (Prisma + PostgreSQL):**
```bash
cd packages/product-db
pnpm db:generate   # Generate Prisma client
pnpm db:migrate    # Run migrations (dev)
pnpm db:deploy     # Apply migrations (prod)
```

**Order DB (Mongoose + MongoDB):**
- Models in [packages/order-db/src/](../packages/order-db/src/)
- No migrations needed (schema-less)

### Building & Type Checking

```bash
# Build all packages (respects Turbo dependency graph)
pnpm build

# Type check all services
pnpm check-types

# Lint everything
pnpm lint
```

## Project-Specific Patterns

### Service Structure Template

Every service follows this pattern:
```
apps/<service-name>/
├── src/
│   ├── index.ts           # Entry point, Kafka setup
│   ├── routes/            # Route handlers
│   ├── middleware/        # Auth, error handling
│   └── utils/
│       ├── kafka.ts       # producer/consumer instances
│       └── subscriptions.ts  # Kafka topic subscriptions
├── package.json           # Uses "type": "module"
└── .env                   # Service-specific config
```

### Authentication Pattern

All services use Clerk middleware but with **different frameworks**:

```typescript
// Express (product-service, auth-service)
import { clerkMiddleware } from "@clerk/express";
app.use(clerkMiddleware());

// Fastify (order-service)
import { clerkPlugin } from "@clerk/fastify";
await fastify.register(clerkPlugin);

// Hono (payment-service)
import { clerkMiddleware } from "@hono/clerk-auth";
app.use("*", clerkMiddleware());

// Next.js (client, admin)
import { clerkMiddleware } from "@clerk/nextjs";
export default clerkMiddleware();  // in middleware.ts
```

### Shared Packages

**Always use workspace protocol:**
```json
"dependencies": {
  "@repo/kafka": "workspace:*",
  "@repo/types": "workspace:*",
  "@repo/product-db": "workspace:*"
}
```

**Key exports:**
- `@repo/kafka` → `createKafkaClient`, `createProducer`, `createConsumer`
- `@repo/types` → Shared TypeScript types (auth, product, cart, order, etc.)
- `@repo/product-db` → Prisma client for product database
- `@repo/order-db` → Mongoose models for orders

### Payment Service Specifics

**Razorpay is primary** (Stripe code is commented out but present):

```typescript
// Creating Razorpay order
POST /razorpay/create-order
Body: { amount: number, currency: string, items: CartItem[] }

// Verify payment callback
POST /razorpay/verify-payment
Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
```

**Environment variables required:**
```
# apps/payment-service/.env
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=wvKjlxrWpMEiXq7Z9oN2pQrS

# apps/client/.env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
```

See `apps/payment-service/src/routes/razorpay.route.ts` for payment flow details.

### Indian Localization Standards

**Currency formatting:**
- Always use ₹ symbol (Indian Rupee)
- Format: `₹${amount.toLocaleString('en-IN')}`
- Examples: `₹99.00`, `₹1,549.00`

**Address format (Indian standard):**
- Phone: 10-digit mobile (starts with 6-9), regex: `/^[6-9]\d{9}$/`
- Pincode: 6 digits, regex: `/^[1-9]\d{5}$/`
- States: All 28 states + 8 UTs
- Format: Street Address, City, State, Pincode

**Form validation patterns:**
```typescript
// Indian mobile validation
phone: z.string()
  .regex(/^[6-9]\d{9}$/, "Enter valid Indian mobile number")
  .length(10, "Phone must be 10 digits")

// Pincode validation  
pincode: z.string()
  .regex(/^[1-9]\d{5}$/, "Enter valid Indian pincode")
  .length(6, "Pincode must be 6 digits")
```

## Common Pitfalls

1. **Kafka startup order**: Infrastructure (Kafka) must be running before services start, or consumer connections fail silently. Services handle this with async connect in background.

2. **TypeScript ESM**: All services use `"type": "module"` - always use `.js` extensions in imports:
   ```typescript
   import { router } from "./routes/product.route.js";  // ✅
   import { router } from "./routes/product.route";     // ❌
   ```

3. **CORS origins**: Services whitelist frontend ports. Update when adding new frontends:
   ```typescript
   cors({ origin: ["http://localhost:3002", "http://localhost:3003"] })
   ```

4. **Database connections**: Services connect at startup but don't block server start. Check health endpoints (`/health`) to verify full readiness.

5. **Port conflicts**: If a service fails to start, check if port is in use. Use `taskkill /F /IM node.exe /T` (Windows) or kill individual processes.

## Debugging Tips

- **Kafka UI**: http://localhost:8080 - View topics, messages, consumer groups
- **Health checks**: All services expose `GET /health` endpoint
- **Service info**: All services have root `GET /` endpoint showing available endpoints
- **Logs**: Services use emoji-prefixed console logs (📡 network, 🔑 auth, ❌ errors)
- **Test auth**: Each service has `/test` endpoint requiring valid Clerk token
- **Windows localhost issue**: Use `127.0.0.1` instead of `localhost` in `.env` files for Next.js SSR fetch calls to avoid DNS resolution failures
