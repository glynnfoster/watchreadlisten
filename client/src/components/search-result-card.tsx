import { Card } from "@/components/ui/card";
import { type SearchResult } from "@/lib/api";
import { Music, Film, Tv, BookOpen, Gamepad2, Plus, Info, type LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const mediaTypeIcons: Record<string, LucideIcon> = {
  music: Music,
  movie: Film,
  tv: Tv,
  book: BookOpen,
  game: Gamepad2,
};

interface SearchResultCardProps {
  result: SearchResult;
  onAdd: (result: SearchResult) => void;
}

export default function SearchResultCard({ result, onAdd }: SearchResultCardProps) {
  const MediaIcon = mediaTypeIcons[result.type] || Film;
  
  const getMetadataString = (metadata: Record<string, any>) => {
    const relevantFields = {
      movie: [
        ['Runtime', 'runtime'],
        ['Genre', 'genre'],
        ['Language', 'language'],
        ['IMDB Rating', 'imdbRating'],
        ['Release Date', 'releaseDate'],
        ['Actors', 'actors'],
        ['Seasons', 'totalSeasons', (val: string) => val ? `${val} seasons` : null]
      ],
      book: [
        ['ISBN', 'isbn'],
        ['Publisher', 'publisher'],
        ['Published', 'publishedDate'],
        ['Category', 'category']
      ],
      music: [
        ['Release Date', 'releaseDate'],
        ['Album', 'albumName'],
        ['Duration', 'durationMs', (ms: number) => `${Math.round(ms / 1000 / 60)}:${String(Math.round((ms / 1000) % 60)).padStart(2, '0')}`],
        ['Preview', 'previewUrl', (url: string) => url ? '🎵 Available' : 'Not available']
      ]
    };

    const fields = relevantFields[result.type] || [];
    return fields
      .map(([label, key, transform]) => {
        const value = metadata[key];
        if (!value) return null;
        const displayValue = transform ? transform(value) : value;
        return displayValue ? `${label}: ${displayValue}` : null;
      })
      .filter(Boolean)
      .join('\n');
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(result);
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        {result.imageUrl && (
          <img
          src={result.imageUrl || '/path-to-default-book-image.jpg'}
          alt={result.title || 'Book Cover'}
          className={`${
            result.type === 'book' 
              ? 'max-w-full max-h-48 object-cover mx-auto' 
              : 'w-full h-48 object-cover object-top'
          }`}
          style={result.type === 'book' ? { clipPath: 'inset(2px 0px 0px 2px)' } : {}}
        />
        )}
        <div className="absolute top-0 right-0 p-2 flex items-center gap-2 bg-gradient-to-b from-black/50 to-transparent">
          <MediaIcon className="h-5 w-5 text-white" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 rounded-full hover:bg-white/20 transition-colors">
                  <Info className="h-4 w-4 text-white" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs whitespace-pre-line">
                {getMetadataString(result.metadata)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div>
          <h3 className="font-semibold text-lg mb-1">{result.title}</h3>
          <p className="text-sm text-muted-foreground">
            {result.creator} • {result.year}
          </p>
        </div>
        {result.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
            {result.summary}
          </p>
        )}
        <div className="mt-auto pt-3">
          <button
            onClick={handleAdd}
            className="ml-auto block p-2 text-muted-foreground hover:text-primary active:scale-95 transition-all rounded-md hover:bg-primary/10"
            type="button"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}