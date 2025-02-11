import { useState, useEffect } from "react";
import { Link } from "wouter";
import MediaSearch from "@/components/media-search";
import RecommendationCard from "@/components/recommendation-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getSavedRecommendations, deleteRecommendation } from "@/lib/storage";
import { type Recommendation } from "@shared/schema";
import { Settings } from "lucide-react";

export default function Home() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const { toast } = useToast();

  const refreshRecommendations = () => {
    setRecommendations(getSavedRecommendations());
  };

  useEffect(() => {
    refreshRecommendations();
  }, []);

  const handleDelete = (id: number) => {
    try {
      deleteRecommendation(id);
      refreshRecommendations();
      toast({
        title: "Deleted",
        description: "Recommendation removed from your list"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recommendation",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Media Recommendations</h1>
        <Link href="/settings">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            API Settings
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="search">
        <TabsList>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="saved">
            Saved ({recommendations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-4">
          <MediaSearch onSave={refreshRecommendations} />
        </TabsContent>

        <TabsContent value="saved" className="mt-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No recommendations saved yet. Start by searching for some media!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}