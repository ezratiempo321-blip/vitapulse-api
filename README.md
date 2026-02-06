# VitaPulse API

A blood pressure and pulse monitoring API built with Hono, Drizzle ORM, and PostgreSQL.

---

## Prerequisites

- [Bun](https://bun.sh) runtime installed
- PostgreSQL database
- Node.js (for some dependencies)

---

## Installation

1. **Install dependencies:**
   ```sh
   bun install
   ```

2. **Configure environment variables:**
   
   Create a `env-sample` file in the root directory
   Change it into `.env`

3. **Set up the database:**

   Generate and apply migrations:
   ```sh
   bun run drizzle-kit generate
   bun run drizzle-kit migrate
   ```

   Or push schema directly (for development):
   ```sh
   bun run drizzle-kit push
   ```

---

## Running the Application

### Development Mode
Start the server with hot reload:
```sh
bun run dev
```

The API will be available at: **http://localhost:3000**

### Production Build
Build the application:
```sh
bun run build
```

Run the compiled binary:
```sh
bun run start
```

---

## Database Management

### Generate Migration
```sh
bun run drizzle-kit generate
```

### Apply Migrations
```sh
bun run drizzle-kit migrate
```

### Push Schema (Development)
```sh
bun run drizzle-kit push
```

### Reset Database
```sh
bun run drizzle-kit push --force
```
⚠️ **Warning**: This deletes all data.

For detailed migration guide, see [DB_MIGRATION_GUIDE.md](./DB_MIGRATION_GUIDE.md)

---

## Project Structure

```
vitapulse-api/
├── src/
│   ├── db/
│   │   ├── schema.ts      # Database schema definitions
│   │   └── index.ts       # Database connection
│   └── index.ts           # Main application entry
├── drizzle/               # Migration files
├── .env                   # Environment variables
├── drizzle.config.ts      # Drizzle Kit configuration
└── package.json
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Compile application to binary |
| `bun run start` | Run production binary |

---

## Technologies

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Email**: Nodemailer, Resend

---

## API Endpoints

The API serves at **http://localhost:3000**

(Add your endpoint documentation here)

---

## Environment Variables

Required environment variables in `.env`:

```env
DATABASE_URL=postgresql://username:password@host:port/database
# Add other variables as needed
```

---