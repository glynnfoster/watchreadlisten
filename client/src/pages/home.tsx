import { Link } from "wouter";
import RecommendationCard from "@/components/recommendation-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getSavedRecommendations, deleteRecommendation, saveRecommendations } from "@/lib/storage";
import { type Recommendation } from "@shared/schema";
import { Settings, Plus, GripVertical, Github } from "lucide-react";
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
          <a
      href="https://github.com/glynnfoster/watchreadlisten"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-black hover:text-gray-800 transition-colors"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 0C5.372 0 0 5.372 0 12C0 17.303 3.438 21.8 8.208 23.385C8.807 23.493 9.026 23.138 9.026 22.835C9.026 22.562 9.015 21.993 9.01 21.2C5.672 21.889 4.968 19.375 4.968 19.375C4.422 17.972 3.634 17.625 3.634 17.625C2.546 16.936 3.713 16.951 3.713 16.951C4.909 17.044 5.503 18.204 5.503 18.204C6.575 20.086 8.29 19.586 8.95 19.281C9.065 18.502 9.374 17.969 9.708 17.663C7.078 17.357 4.345 16.276 4.345 11.64C4.345 10.313 4.82 9.222 5.625 8.35C5.501 8.044 5.086 6.795 5.737 5.103C5.737 5.103 6.706 4.775 8.999 6.337C9.89 6.096 10.83 6 11.767 6C12.704 6 13.645 6.096 14.536 6.337C16.83 4.775 17.8 5.103 17.8 5.103C18.45 6.795 18.035 8.044 17.911 8.35C18.717 9.222 19.191 10.313 19.191 11.64C19.191 16.276 16.458 17.357 13.829 17.663C14.164 17.969 14.473 18.502 14.473 19.281C14.473 20.087 15.066 21.044 16.148 21.2C16.143 21.993 16.133 22.562 16.133 22.835C16.133 23.138 16.35 23.493 16.95 23.385C21.72 21.8 25.158 17.303 25.158 12C25.158 5.372 19.786 0 13.158 0H12Z"
        />
      </svg>
    </a>
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
