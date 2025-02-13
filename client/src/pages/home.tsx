import { Link } from "wouter";
import RecommendationCard from "@/components/recommendation-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getSavedRecommendations, deleteRecommendation, saveRecommendations } from "@/lib/storage";
import { type Recommendation } from "@shared/schema";
import { Settings, Plus, GripVertical } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import splashImage from "@/media/recommendations_splash.png";

interface SortableItemProps {
  recommendation: Recommendation;
  onDelete: (id: number) => void;
}

function SortableItem({ recommendation, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: recommendation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative touch-none">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 z-20 p-2 rounded-md bg-black/50 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </div>

      {/* Card Content */}
      <RecommendationCard
        recommendation={recommendation}
        onDelete={onDelete}
      />
    </div>
  );
}

export default function Home() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRecommendations((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        saveRecommendations(newItems);
        return newItems;
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Watch<span className="text-foreground">Read</span>Listen
          </h1>
          <span className="text-sm text-muted-foreground font-medium">
            Your Media Recommendations
          </span>
        </div>
        <div className="flex gap-2">
          <Link href="/search">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              API Settings
            </Button>
          </Link>
        </div>
      </div>

      {recommendations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto mb-8">
                    <img
                      src={splashImage}
                      alt="Add your recommendations"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">
                    Start tracking what you'll watch, read or listen to next
                 </p>
          <Link href="/search">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Recommendation
            </Button>
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={recommendations}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {recommendations.map((rec) => (
                <SortableItem
                  key={rec.id}
                  recommendation={rec}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
