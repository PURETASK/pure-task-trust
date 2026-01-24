# PureTask - Cleaning Services Platform

A comprehensive cleaning services marketplace connecting clients with professional cleaners.

## 🧪 Testing

This project includes a comprehensive test suite with 300+ tests:

| Test Type | Location | Runner |
|-----------|----------|--------|
| Unit Tests | `tests/unit/` | Vitest |
| Integration Tests | `tests/integration/` | Vitest |
| Security Tests | `tests/security/` | Vitest |
| E2E Tests | `tests/e2e/` | Playwright |
| Edge Function Tests | `supabase/functions/*/` | Deno |

### Running Tests Locally

```sh
# Unit & Integration tests
npm run test

# E2E tests
npm run test:e2e

# With coverage
npm run test -- --coverage
```

### CI/CD

Tests run automatically via GitHub Actions on every push and pull request:
- **CI** (`ci.yml`) - Lint, typecheck, unit tests, E2E tests, build
- **Edge Functions** (`edge-functions.yml`) - Deno tests for backend functions
- **Security** (`security.yml`) - RLS policy tests, dependency audit, secrets scan

---

## Project Info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## Technologies

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Edge Functions)
- Stripe (Payments)

## Development

```sh
# Install dependencies
npm install

# Start dev server
npm run dev
```

## Deployment

Open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click Share → Publish.

## Custom Domain

Navigate to Project > Settings > Domains > Connect Domain.

See: [Custom Domain Docs](https://docs.lovable.dev/features/custom-domain#custom-domain)
