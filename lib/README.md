# lib/

Shared utilities (formatting, validation schemas, constants). Framework-agnostic where possible. No business logic here — see `services/`.

## Supabase clients (MM-002)

- `lib/supabase/client.ts` — browser / Client Components
- `lib/supabase/server.ts` — server, RLS-scoped (user session)
- `lib/supabase/service.ts` — service role, server-only, bypasses RLS
- `lib/supabase/middleware.ts` — session refresh helper (used by root `proxy.ts`)
