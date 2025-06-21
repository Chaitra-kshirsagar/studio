"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Sparkles, Filter, LogIn } from "lucide-react";
import EventCard from "@/components/event-card";
import { allEvents } from "@/lib/mock-data";
import SuggestedEventsDialog from "@/components/suggested-events-dialog";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";


export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesCategory =
        category === "all" ||
        event.category.toLowerCase() === category.toLowerCase();
      const matchesSearch =
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, category]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(allEvents.map((e) => e.category)))],
    []
  );

  const handleGetSuggestions = () => {
    if (user) {
      setIsSuggesting(true);
    } else {
      toast({
        title: "Please log in",
        description: "You need to be logged in to get AI suggestions.",
        action: (
          <Button onClick={() => router.push('/login')}><LogIn className="mr-2 h-4 w-4" />Login</Button>
        ),
      });
    }
  };


  return (
    <>
      <div className="w-full bg-card shadow-sm">
        <div className="container mx-auto">
          <section className="text-center py-16 md:py-24 px-4">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-primary">
              Make a Difference Today
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover meaningful volunteer opportunities that match your skills
              and passion. Join Bhumi and be the change.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetSuggestions}>
                <Sparkles className="mr-2" /> Get AI Suggestions
              </Button>
            </div>
          </section>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <Card className="p-4 mb-8 sticky top-20 z-10 bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search events by name or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-muted-foreground md:hidden" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No Events Found</h2>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {user && (
        <SuggestedEventsDialog
            open={isSuggesting}
            onOpenChange={setIsSuggesting}
            volunteerProfile={user}
            upcomingEvents={allEvents}
        />
      )}
    </>
  );
}
