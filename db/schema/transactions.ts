import { pgTable, text, timestamp, decimal, uuid, pgEnum, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { participants } from "./participants";
import { companies } from "./companies";

export const transactionType = pgEnum("transaction_type", ["buy", "sell"]);

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  participantId: uuid("participant_id").references(() => participants.id, { onDelete: "cascade" }).notNull(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  type: transactionType("type").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  stockCode: text("stock_code").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").default("completed").notNull(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  participant: one(participants, {
    fields: [transactions.participantId],
    references: [participants.id],
  }),
  company: one(companies, {
    fields: [transactions.companyId],
    references: [companies.id],
  }),
}));