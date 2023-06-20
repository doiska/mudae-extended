import { pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export interface Wish {
  target: string;
  type: 'character' | 'series';
  category?: string | null | undefined;
}

const types = pgEnum('category', ['character', 'series']);

export const wishes = pgTable('wishes', {
  userId: varchar('user_id', { length: 255 }).notNull(),
  target: varchar('target', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }),
  type: types('type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});