import { type Recommendation, type InsertRecommendation, type ApiCredentials, type InsertApiCredentials, recommendations, apiCredentials } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getRecommendations(): Promise<Recommendation[]>;
  addRecommendation(rec: InsertRecommendation): Promise<Recommendation>;
  deleteRecommendation(id: number): Promise<void>;
  getApiCredentials(service: string): Promise<ApiCredentials | undefined>;
  setApiCredentials(creds: InsertApiCredentials): Promise<ApiCredentials>;
}

export class DatabaseStorage implements IStorage {
  async getRecommendations(): Promise<Recommendation[]> {
    return await db.select().from(recommendations);
  }

  async addRecommendation(rec: InsertRecommendation): Promise<Recommendation> {
    const [recommendation] = await db
      .insert(recommendations)
      .values(rec)
      .returning();
    return recommendation;
  }

  async deleteRecommendation(id: number): Promise<void> {
    await db
      .delete(recommendations)
      .where(eq(recommendations.id, id));
  }

  async getApiCredentials(service: string): Promise<ApiCredentials | undefined> {
    const [credentials] = await db
      .select()
      .from(apiCredentials)
      .where(eq(apiCredentials.service, service));
    return credentials;
  }

  async setApiCredentials(creds: InsertApiCredentials): Promise<ApiCredentials> {
    // Upsert - update if exists, insert if not
    const [credentials] = await db
      .insert(apiCredentials)
      .values(creds)
      .onConflictDoUpdate({
        target: apiCredentials.service,
        set: { apiKey: creds.apiKey }
      })
      .returning();
    return credentials;
  }
}

export const storage = new DatabaseStorage();