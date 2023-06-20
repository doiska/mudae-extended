import 'dotenv/config';

import { Config } from 'drizzle-kit';

export const config = {
  out: './schema',
  schema: './src/db/schema/*',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URI,
  }
} satisfies Config;