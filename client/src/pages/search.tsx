import { Link } from "wouter";
import MediaSearch from "@/components/media-search";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Search() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Add Recommendation</h1>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </Link>
      </div>

      <MediaSearch className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
    </div>
  );
}