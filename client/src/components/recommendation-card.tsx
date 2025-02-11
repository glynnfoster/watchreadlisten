import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Recommendation } from "@shared/schema";
import { Trash2 } from "lucide-react";

interface Props {
  recommendation: Recommendation;
  onDelete: (id: number) => void;
}

export default function RecommendationCard({ recommendation, onDelete }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(recommendation.id)}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {recommendation.imageUrl && (
          <img
            src={recommendation.imageUrl}
            alt={recommendation.title}
            className="w-full h-40 object-contain mb-4"
          />
        )}
        <h3 className="font-bold mb-2">{recommendation.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">
          {recommendation.creator} • {recommendation.year}
        </p>
        {recommendation.type === "movie" ? (
          <p className="text-sm text-muted-foreground mb-2">
            Cast: {recommendation.genre}
          </p>
        ) : recommendation.genre && (
          <p className="text-sm text-muted-foreground mb-2">
            Genre: {recommendation.genre}
          </p>
        )}
        {recommendation.summary && (
          <p className="text-sm line-clamp-3">{recommendation.summary}</p>
        )}
      </CardContent>
    </Card>
  );
}