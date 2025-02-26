import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mediaTypes = ["movie", "book", "music"] as const;
export type MediaType = typeof mediaTypes[number];

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  creator: text("creator").notNull(), // director/author/artist
  genre: text("genre").notNull().default(""),
  year: text("year").notNull().default(""),
  summary: text("summary").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  url: text("url").notNull().default(""),
  metadata: jsonb("metadata").notNull().$type<Record<string, any>>().default({}),
});

export const apiCredentials = pgTable("api_credentials", {
  id: serial("id").primaryKey(),
  service: text("service").notNull().unique(), // omdb, google_books, spotify
  apiKey: text("api_key").notNull(),
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true });
export const insertApiCredentialsSchema = createInsertSchema(apiCredentials).omit({ id: true });

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type ApiCredentials = typeof apiCredentials.$inferSelect;
export type InsertApiCredentials = z.infer<typeof insertApiCredentialsSchema>;