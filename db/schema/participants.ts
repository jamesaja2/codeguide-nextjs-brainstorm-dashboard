import { pgTable, text, timestamp, decimal, uuid, integer, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { transactions } from "./transactions";

export const participants = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
  teamName: text("team_name").notNull(),
  school: text("school").notNull(),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).default("1000000.00").notNull(),
  startingBalance: decimal("starting_balance", { precision: 12, scale: 2 }).default("1000000.00").notNull(),
  totalInvestments: decimal("total_investments", { precision: 12, scale: 2 }).default("0.00").notNull(),
  days: integer("days").default(0).notNull(),
  brokers: text("brokers").default("").notNull(),
  settings: json("settings").$type<{
    notificationsEnabled: boolean;
    riskTolerance: string;
    autoInvest: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const participantsRelations = relations(participants, ({ one, many }) => ({
  user: one(user, {
    fields: [participants.userId],
    references: [user.id],
  }),
  transactions: many(transactions),
}));