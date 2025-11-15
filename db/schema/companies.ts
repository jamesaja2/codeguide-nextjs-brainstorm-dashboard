import { pgTable, text, timestamp, decimal, uuid, json } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  previousPrice: decimal("previous_price", { precision: 10, scale: 2 }).notNull(),
  marketCap: decimal("market_cap", { precision: 15, scale: 2 }).notNull(),
  financials: json("financials").$type<{
    revenue: string;
    profit: string;
    growth: string;
    marketShare: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});