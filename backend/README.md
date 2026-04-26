# My Pharmacy Backend

Express + Supabase backend for the frontend app.

## Setup

1) Copy `.env.example` to `.env` and fill in Supabase values.
2) Install deps and run dev server.

```
bun install
bun run dev
```

## Scripts

- `bun run dev` - Start dev server
- `bun run build` - Build for production
- `bun run start` - Start production server

## Notes

- Auth uses Supabase JWTs via the `Authorization: Bearer <token>` header.
- For user-scoped data, RLS should be enabled on Supabase tables.
- Apply [supabase/schema.sql](supabase/schema.sql) in Supabase SQL editor.
- Create a storage bucket named `prescriptions` for uploads.
