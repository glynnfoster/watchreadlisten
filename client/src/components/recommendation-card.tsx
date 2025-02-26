import { Card } from "@/components/ui/card";
import { type Recommendation } from "@shared/schema";
import { Music, Film, Tv, BookOpen, Gamepad2, Trash2, Info, ExternalLink, type LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import React from 'react';

const mediaTypeIcons: Record<string, LucideIcon> = {
  music: Music,
  movie: Film,
  tv: Tv,
  book: BookOpen,
  game: Gamepad2,
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDelete: (id: number) => void;
}

export default function RecommendationCard({
  recommendation,
  onDelete,
}: RecommendationCardProps) {
  const MediaIcon = mediaTypeIcons[recommendation.type] || Film;

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

    const fields = relevantFields[recommendation.type] || [];
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

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(recommendation.id);
  };

  console.log(recommendation);
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        {recommendation.imageUrl && (
          <img
            src={recommendation.imageUrl}
            alt={recommendation.title}
            className="w-full aspect-[3/2] object-cover"
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
                {getMetadataString(recommendation.metadata)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg mb-1 flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {recommendation.title.length > 27 ? `${recommendation.title.slice(0, 27)}...` : recommendation.title}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs whitespace-pre-line">
                    {recommendation.title}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <a href={recommendation.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                <ExternalLink className="h-3 w-3 text-gray-500" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              {recommendation.creator} • {recommendation.year}
            </p>
          </div>
        </div>
        {recommendation.summary && (
          <p className="text-sm text-muted-foreground line-clamp-6 mt-2">
            {recommendation.summary}
          </p>
        )}
        <div className="mt-auto pt-3">
          <button
            onClick={handleDelete}
            className="ml-auto block p-2 text-muted-foreground hover:text-destructive active:scale-95 transition-all rounded-md hover:bg-destructive/10"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}