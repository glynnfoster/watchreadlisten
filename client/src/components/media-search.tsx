import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { searchMedia } from "@/lib/api";
import { saveRecommendation } from "@/lib/storage";
import { type MediaType } from "@shared/schema";
import { Search, Loader2 } from "lucide-react";
import SearchResultCard from "@/components/search-result-card";

interface MediaSearchProps {
  className?: string;
}

export default function MediaSearch({ className }: MediaSearchProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset } = useForm<{ query: string }>();

  const onSearch = async (type: MediaType, query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const searchResults = await searchMedia(type, query);
      setResults(searchResults);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search",
        variant: "destructive"
      });
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = (result: SearchResult, type: MediaType) => {
    try {
      saveRecommendation({
        type,
        title: result.title,
        creator: result.creator,
        summary: result.summary || "",
        year: result.year || "",
        imageUrl: result.imageUrl || "",
        url: result.url || "",
        metadata: result.metadata
      });

      toast({
        title: "Saved!",
        description: `Added ${result.title} to your recommendations`
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save recommendation",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="movie" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="movie">Movies and TV Series</TabsTrigger>
          <TabsTrigger value="book">Books</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
        </TabsList>

        {["movie", "book", "music"].map((type) => (
          <TabsContent key={type} value={type} className="mt-4">
            <form onSubmit={handleSubmit((data) => onSearch(type as MediaType, data.query))} className="flex gap-2 mb-4">
              <Input
                placeholder={`Search ${type}s...`} 
                {...register("query")}
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>

            {isSearching ? (
              <div className={className}>
                {/* Add skeleton cards here if desired */}
              </div>
            ) : results.length > 0 ? (
              <div className={className}>
                {results.map((result) => (
                  <SearchResultCard
                    key={result.id}
                    result={result}
                    onAdd={() => handleSave(result, type as MediaType)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No results found.</p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}