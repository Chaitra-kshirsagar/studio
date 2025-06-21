"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Event, UserProfile } from "@/lib/types";
import { getSuggestedEvents } from "@/app/actions";
import type { SuggestEventsOutput } from "@/ai/flows/suggest-events";
import { AlertTriangle, ArrowRight, Lightbulb } from "lucide-react";
import Link from "next/link";

type SuggestedEventsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteerProfile: UserProfile;
  upcomingEvents: Event[];
};

export default function SuggestedEventsDialog({
  open,
  onOpenChange,
  volunteerProfile,
  upcomingEvents,
}: SuggestedEventsDialogProps) {
  const [suggestions, setSuggestions] = useState<SuggestEventsOutput>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && upcomingEvents.length > 0) {
      const fetchSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions([]);

        const result = await getSuggestedEvents({
          volunteerSkills: volunteerProfile.skills || [],
          volunteerInterests: volunteerProfile.interests || [],
          upcomingEvents: upcomingEvents.map(
            ({ name, description, category, date, location, requiredSkills }) => ({
              eventName: name,
              eventDescription: description,
              eventCategory: category,
              eventDate: date,
              eventLocation: location,
              requiredSkills,
            })
          ),
        });

        if (result.success) {
          setSuggestions(result.data!);
        } else {
          setError(result.error!);
        }
        setIsLoading(false);
      };
      fetchSuggestions();
    }
  }, [open, volunteerProfile, upcomingEvents]);

  const findEventIdByName = (name: string) => {
    const event = upcomingEvents.find(e => e.name === name);
    return event ? event.id : null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">
            Events Curated For You
          </DialogTitle>
          <DialogDescription>
            Our AI has analyzed your profile to find events where you can make
            the biggest impact.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-4">
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && (
            <div className="space-y-4">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion) => {
                  const eventId = findEventIdByName(suggestion.eventName);
                  return (
                    <div
                      key={suggestion.eventName}
                      className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                    >
                      <h3 className="font-semibold">{suggestion.eventName}</h3>
                      <p className="text-sm text-muted-foreground mt-1 flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                        <span>{suggestion.reasoning}</span>
                      </p>
                      {eventId && (
                        <div className="mt-3 flex justify-end">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/events/${eventId}`}>
                              View Event <ArrowRight className="ml-2" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No specific suggestions found at the moment. Explore all events to find your fit!
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
