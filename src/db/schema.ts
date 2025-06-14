import { pgTable, serial, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import crypto from 'crypto'; // For generating UUIDs

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), // Switched to UUID
  email: text('email').unique(), // Can be null if user signs up with wallet only or Google doesn't provide email
  name: text('name'), // Was fullName, renamed. Nullable.
  googleId: text('google_id').unique(), // For Google OAuth unique user ID
  walletAddress: text('wallet_address').unique(), // For Wallet auth unique public address

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => {
  return {
    emailIdx: index('email_idx').on(table.email), // Index on email for faster lookups
    googleIdIdx: index('google_id_idx').on(table.googleId),
    walletAddressIdx: index('wallet_address_idx').on(table.walletAddress),
  };
});

export const emailOtps = pgTable('email_otps', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  otp: text('otp').notNull(), // OTPs should be hashed in a real production environment before storing
  expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull(),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    emailOtpIdx: index('email_otp_idx').on(table.email), // Index on email for faster OTP lookups
  };
});

// Example of how you might define relations if needed later with Drizzle:
// import { relations } from 'drizzle-orm';
// export const usersRelations = relations(users, ({ many }) => ({
//   posts: many(posts), // Assuming a 'posts' table
// }));
// export const emailOtpsRelations = relations(emailOtps, ({ one }) => ({
//  user: one(users, { // If OTPs were strictly linked to a user ID, which they are not here (linked by email)
//    fields: [emailOtps.email], // This is conceptual, actual relation might differ
//    references: [users.email],
//  }),
// }));

console.log('Database schema defined.');
// Next steps:
// 1. Ensure your database has the 'uuid-ossp' extension if using default database UUID functions,
//    OR rely on crypto.randomUUID() as shown above.
// 2. Generate migrations: bunx drizzle-kit generate:pg --schema=src/db/schema.ts --out=src/db/migrations
// 3. Apply migrations: Check migrate.ts or run appropriate drizzle-kit command.
