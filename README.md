# PropertyManager Admin Dashboard

Property management admin frontend for `PropertyManagerAPI` (`/api/v1`) built with Next.js App Router, TypeScript, and Tailwind CSS.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| Forms | React Hook Form + Zod |
| HTTP client | Axios (with refresh interceptor) |
| Charts | Recharts |
| UI primitives | Radix UI + custom components |
| Notifications | Sonner |

## Features

- **Authentication** — JWT login, auto-refresh on 401, secure session persistence
- **Multi-property** — Property switcher scopes all data to the selected property
- **Dashboard** — Live KPI cards and recent operational activity (no production fake data)
- **Properties** — List + detail view with occupancy metrics
- **Users & Memberships** — Owner/admin CRUD and assignment screens
- **Units** — Property-scoped list/detail/create/edit
- **Tenants** — Property-scoped list/detail/create/edit
- **Leases** — List/create/detail/edit with 3/6/12 month support
- **Rent Installments** — List and detail
- **Invoices** — List/create/detail/edit + item management
- **Payments** — List/create/detail
- **Payment Allocations** — List and detail
- **Meter Readings** — List/detail/create/edit
- **Pump Topups** — List/detail/create/edit
- **Maintenance** — Priority/aging indicators, status workflow, create/update requests
- **Audit Logs** — List and detail
- **Billing** — Water billing run action page
- **Role-based access** — Middleware + UI guard for `owner`, `admin`, `property_manager`, `accountant`, `caretaker`, `tenant`

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — app redirects to `/app/dashboard`.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | API host (client app appends `/api/v1`) | `https://propertyapi.rohodev.com` |
| `NEXT_PUBLIC_APP_NAME` | App display name | `PropertyManager Admin` |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Currency code | `GHS` |

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── app/                   # Protected app routes (/app/*)
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── memberships/
│   │   ├── properties/
│   │   ├── units/
│   │   ├── tenants/
│   │   ├── leases/
│   │   ├── rent-installments/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── payment-allocations/
│   │   ├── meter-readings/
│   │   ├── pump-topups/
│   │   ├── maintenance/
│   │   ├── audit-logs/
│   │   └── billing/water/
│   ├── layout.tsx             # Root layout (Providers)
│   └── page.tsx               # Redirects to /app/dashboard
├── components/
│   ├── ui/                    # Radix-based primitives
│   ├── shared/                # DataTable, KpiCard, StatusBadge, etc.
│   └── layout/                # Sidebar, TopNav, PropertySwitcher
├── hooks/                     # use-auth, use-property
├── lib/
│   ├── api/                   # Typed API modules (auth, properties, …)
│   ├── jsonapi.ts             # JSON:API response parsers
│   ├── utils.ts               # cn, formatCurrency, formatDate, …
│   └── validations/           # Zod schemas
├── providers/                 # QueryClient + Toaster
├── store/                     # Zustand (auth, property)
├── types/                     # TypeScript contracts
└── proxy.ts                   # Route protection + role guards
```

## Demo Accounts

Configure your backend seed with these roles:

| Email | Role |
|---|---|
| owner@demo.com | owner |
| manager@demo.com | property_manager |
| accountant@demo.com | accountant |
| caretaker@demo.com | caretaker |

## API Contract

All API calls target `NEXT_PUBLIC_API_BASE_URL` and append `/api/v1`. The client handles `{ data }` success payloads and surfaces JSON:API-style `errors[].detail`.

### Token Refresh Flow

1. Request fails with 401
2. Interceptor pauses queue and calls `POST /auth/refresh`
3. On success — new token applied, queued requests retried
4. On failure — localStorage cleared, user redirected to `/login`

## Tests

```bash
# After adding vitest in your environment:
npx vitest run tests/auth-guard.test.ts tests/crud-flow.test.ts
```
