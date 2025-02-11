import { type InsertRecommendation, type Recommendation } from "@shared/schema";

const STORAGE_KEY = "media_recommendations";

export function saveRecommendation(rec: InsertRecommendation): void {
  const saved = getSavedRecommendations();
  const newRec: Recommendation = {
    ...rec,
    id: Date.now()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved, newRec]));
}

export function getSavedRecommendations(): Recommendation[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function deleteRecommendation(id: number): void {
  const saved = getSavedRecommendations();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(saved.filter(r => r.id !== id))
  );
}

export function saveApiCredentials(service: string, apiKey: string): void {
  localStorage.setItem(`${service}_api_key`, apiKey);
}

export function getApiCredentials(service: string): string | null {
  return localStorage.getItem(`${service}_api_key`);
}
