# Database Migration and Reset Guide

## Overview
This guide explains how to manage database migrations and reset the database for the VitaPulse API using Drizzle ORM and Drizzle Kit.

---

## Prerequisites
- PostgreSQL database running
- `.env` file with `DATABASE_URL` configured
- Drizzle Kit installed (`drizzle-kit@0.30.6`)

---

## Migration Commands

### 1. Generate New Migration
Creates migration files based on schema changes in `src/db/schema.ts`:

```bash
bun run drizzle-kit generate
```

This creates SQL migration files in the `drizzle/` folder.

---

### 2. Apply Migrations
Applies pending migrations to the database:

```bash
bun run drizzle-kit migrate
```

---

### 3. Push Schema Directly (No Migration Files)
Pushes schema changes directly to the database without generating migration files:

```bash
bun run drizzle-kit push
```

Use `--force` to overwrite existing tables:

```bash
bun run drizzle-kit push --force
```

---

## Database Reset Options

1. **Temporarily comment out all tables** in `src/db/schema.ts`:

```typescript
// filepath: c:\Users\jomav\Desktop\vitapulse\vitapulse-api\src\db\schema.ts
/*
export const users = pgTable('users_table', { ... });
export const bpPulseRecords = pgTable('bp_records_table', { ... });
// ... comment out all tables
*/
```

2. **Run push to drop all tables**:

```bash
bun run drizzle-kit push --force
```

3. **Uncomment tables** in `schema.ts` if you want to recreate them.

4. **Run push again** to recreate:

```bash
bun run drizzle-kit push
```

---

## Delete Migration Files Only
The `drizzle-kit drop` command removes migration **files**, not database tables:

```bash
bun run drizzle-kit drop
```

Then select migrations to delete from the interactive prompt.

---

## Common Workflows

### Full Reset and Migrate
1. Drop all tables:
   ```bash
   bun run drizzle-kit push --force
   ```

2. Generate fresh migrations:
   ```bash
   bun run drizzle-kit generate
   ```

3. Apply migrations:
   ```bash
   bun run drizzle-kit migrate
   ```

---

### Update Schema and Migrate
1. Edit `src/db/schema.ts`

2. Generate migration:
   ```bash
   bun run drizzle-kit generate
   ```

3. Apply migration:
   ```bash
   bun run drizzle-kit migrate
   ```

---

### Quick Reset (Development)
For quick iterations in development:

```bash
bun run drizzle-kit push --force
```

This drops and recreates tables instantly without migration files.

---

## Important Notes

- **`drizzle-kit drop`** deletes migration files, NOT database tables
- **`drizzle-kit push --force`** deletes database tables and data
- Always backup production data before resetting
- Migration files are stored in `drizzle/` folder
- Migration history is tracked in `__drizzle_migrations` table

---

## Troubleshooting

### Error: "Unrecognized options for command 'migrate': reset"
Drizzle Kit doesn't have a `migrate reset` command. Use `push --force` instead.

### Tables Not Dropping
Use SQL commands directly via `psql` or database client to manually drop tables.

### Schema Mismatch
If schema doesn't match database:
1. Generate new migration: `bun run drizzle-kit generate`
2. Review the generated SQL in `drizzle/` folder
3. Apply: `bun run drizzle-kit migrate`

---

## Configuration

Ensure `drizzle.config.ts` is properly configured:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## Database URL Format

```
DATABASE_URL=postgresql://username:password@host:port/database
```

Example:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/vitapulse
```