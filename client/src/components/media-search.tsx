import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { searchMedia } from "@/lib/api";
import { saveRecommendation } from "@/lib/storage";
import { type MediaType } from "@shared/schema";
import { Search, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  creator: string;
  actors?: string;
  year?: string;
  summary?: string;
  imageUrl?: string;
  metadata: Record<string, any>;
}

interface Props {
  onSave?: () => void;
}

export default function MediaSearch({ onSave }: Props) {
  const [movieResults, setMovieResults] = useState<SearchResult[]>([]);
  const [bookResults, setBookResults] = useState<SearchResult[]>([]);
  const [musicResults, setMusicResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const { register: registerMovie, handleSubmit: handleSubmitMovie, reset: resetMovie } = useForm<{ query: string }>();
  const { register: registerBook, handleSubmit: handleSubmitBook, reset: resetBook } = useForm<{ query: string }>();
  const { register: registerMusic, handleSubmit: handleSubmitMusic, reset: resetMusic } = useForm<{ query: string }>();

  // Reset search input when changing tabs
  useEffect(() => {
    resetMovie();
    resetBook();
    resetMusic();
  }, [resetMovie, resetBook, resetMusic]);

  const onSearch = async (type: MediaType, query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const searchResults = await searchMedia(type, query);
      switch (type) {
        case "movie":
          setMovieResults(searchResults);
          break;
        case "book":
          setBookResults(searchResults);
          break;
        case "music":
          setMusicResults(searchResults);
          break;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search",
        variant: "destructive"
      });
      // Clear only the current tab's results on error
      switch (type) {
        case "movie":
          setMovieResults([]);
          break;
        case "book":
          setBookResults([]);
          break;
        case "music":
          setMusicResults([]);
          break;
      }
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
        genre: result.actors || "",  // Use actors instead of genre for movies
        year: result.year || "",
        summary: result.summary || "",
        imageUrl: result.imageUrl || "",
        metadata: result.metadata
      });

      toast({
        title: "Saved!",
        description: `Added ${result.title} to your recommendations`
      });

      onSave?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save recommendation",
        variant: "destructive"
      });
    }
  };

  const renderMovieResults = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {movieResults.map((result) => (
        <Card key={result.id}>
          <CardContent className="p-4">
            {result.imageUrl && (
              <img 
                src={result.imageUrl} 
                alt={result.title}
                className="w-full h-40 object-contain mb-4"
              />
            )}
            <h3 className="font-bold mb-2">{result.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {result.creator} • {result.year}
            </p>
            {result.actors && (
              <p className="text-sm text-muted-foreground mb-2">
                Cast: {result.actors}
              </p>
            )}
            {result.summary && (
              <p className="text-sm mb-4 line-clamp-3">{result.summary}</p>
            )}
            <Button onClick={() => handleSave(result, "movie")} className="w-full">
              Save
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderBookResults = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bookResults.map((result) => (
        <Card key={result.id}>
          <CardContent className="p-4">
            {result.imageUrl && (
              <img 
                src={result.imageUrl} 
                alt={result.title}
                className="w-full h-40 object-contain mb-4"
              />
            )}
            <h3 className="font-bold mb-2">{result.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {result.creator} • {result.year}
            </p>
            {result.summary && (
              <p className="text-sm mb-4 line-clamp-3">{result.summary}</p>
            )}
            <Button onClick={() => handleSave(result, "book")} className="w-full">
              Save
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMusicResults = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {musicResults.map((result) => (
        <Card key={result.id}>
          <CardContent className="p-4">
            {result.imageUrl && (
              <img 
                src={result.imageUrl} 
                alt={result.title}
                className="w-full h-40 object-contain mb-4"
              />
            )}
            <h3 className="font-bold mb-2">{result.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {result.creator} • {result.year}
            </p>
            {result.summary && (
              <p className="text-sm mb-4 line-clamp-3">{result.summary}</p>
            )}
            <Button onClick={() => handleSave(result, "music")} className="w-full">
              Save
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="movie">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="movie">Movies and TV Series</TabsTrigger>
          <TabsTrigger value="book">Books</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
        </TabsList>

        <TabsContent value="movie" className="mt-4">
          <form onSubmit={handleSubmitMovie((data) => onSearch("movie", data.query))} className="flex gap-2 mb-4">
            <Input placeholder="Search movies..." {...registerMovie("query")} />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
          {renderMovieResults()}
        </TabsContent>

        <TabsContent value="book" className="mt-4">
          <form onSubmit={handleSubmitBook((data) => onSearch("book", data.query))} className="flex gap-2 mb-4">
            <Input placeholder="Search books..." {...registerBook("query")} />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
          {renderBookResults()}
        </TabsContent>

        <TabsContent value="music" className="mt-4">
          <form onSubmit={handleSubmitMusic((data) => onSearch("music", data.query))} className="flex gap-2 mb-4">
            <Input placeholder="Search music..." {...registerMusic("query")} />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
          {renderMusicResults()}
        </TabsContent>
      </Tabs>
    </div>
  );
}