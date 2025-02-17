import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { saveApiCredentials, getApiCredentials } from "@/lib/storage";
import { Info, type LucideIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApiCredentialForm {
  omdbKey: string;
  googleBooksKey: string;
  spotifyKey: string;
}

export default function ApiSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit } = useForm<ApiCredentialForm>({
    defaultValues: {
      omdbKey: getApiCredentials("movie") || "",
      googleBooksKey: getApiCredentials("book") || "",
      spotifyKey: getApiCredentials("music") || ""
    }
  });

  const onSubmit = async (data: ApiCredentialForm) => {
    setIsLoading(true);
    try {
      saveApiCredentials("movie", data.omdbKey);
      saveApiCredentials("book", data.googleBooksKey);
      saveApiCredentials("music", data.spotifyKey);
      
      toast({
        title: "Settings saved",
        description: "Your API credentials have been updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="omdbKey">OMDB API Key</Label>
            <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 rounded-full hover:bg-white/20 transition-colors">
                  <Info className="h-4 w-4 text-black" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs whitespace-pre-line">
                Create an API key at <a href="http://omdbapi.com">http://omdbapi.com</a>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
            <Input id="omdbKey" {...register("omdbKey")} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="googleBooksKey">Google Books API Key</Label>
            <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 rounded-full hover:bg-white/20 transition-colors">
                  <Info className="h-4 w-4 text-black" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs whitespace-pre-line">
                Create an API key at <a href="https://console.cloud.google.com">https://console.cloud.google.com</a>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
            <Input id="googleBooksKey" {...register("googleBooksKey")} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="spotifyKey">Spotify API Key</Label>
            <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 rounded-full hover:bg-white/20 transition-colors">
                  <Info className="h-4 w-4 text-black" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs whitespace-pre-line">
                Create an API key at <a href="http://developer.spotify.com">http://developer.spotify.com</a>. Ensure
                the API callback is <code>https://DOMAIN/spotify-callback</code>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
            <Input id="spotifyKey" {...register("spotifyKey")} />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
