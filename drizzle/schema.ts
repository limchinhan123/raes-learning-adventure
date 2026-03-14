import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Player progress - tracks which world/level the player has reached
 */
export const playerProgress = mysqlTable("playerProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  currentWorld: int("currentWorld").notNull().default(1),
  currentLevel: int("currentLevel").notNull().default(1),
  totalStars: int("totalStars").notNull().default(0),
  totalHearts: int("totalHearts").notNull().default(0),
  totalPlayTimeMinutes: int("totalPlayTimeMinutes").notNull().default(0),
  foodsCollected: json("foodsCollected").$type<string[]>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlayerProgress = typeof playerProgress.$inferSelect;

/**
 * Level completions - tracks individual level results
 */
export const levelCompletions = mysqlTable("levelCompletions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  worldId: int("worldId").notNull(),
  levelId: int("levelId").notNull(),
  gameType: mysqlEnum("gameType", ["alphabet", "math", "motor"]).notNull(),
  starsEarned: int("starsEarned").notNull().default(0),
  score: int("score").notNull().default(0),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type LevelCompletion = typeof levelCompletions.$inferSelect;
