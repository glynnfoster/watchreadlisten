import { Link } from "wouter";
import ApiSettings from "@/components/api-settings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Settings() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="max-w-2xl">
        <ApiSettings />
      </div>
    </div>
  );
}
