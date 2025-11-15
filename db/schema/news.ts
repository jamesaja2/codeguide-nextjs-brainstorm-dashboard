import { pgTable, text, timestamp, boolean, pgEnum, uuid } from "drizzle-orm/pg-core";

export const newsType = pgEnum("news_type", ["free", "paid"]);

export const news = pgTable("news", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: newsType("type").default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});