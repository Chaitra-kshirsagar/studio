"use client";

import React, { useState, useMemo, useEffect } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase/clientApp";
import type { Event } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Sparkles, Filter, LogIn, Loader2 } from "lucide-react";
import EventCard from "@/components/event-card";
import SuggestedEventsDialog from "@/components/suggested-events-dialog";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";


export default function Home() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsCollection = collection(db, 'events');
        const q = query(
          eventsCollection, 
          where('visibility', '==', 'public'), 
          orderBy('date', 'asc'),
          where('date', '>', new Date().toISOString())
        );
        const querySnapshot = await getDocs(q);
        
        const fetchedEvents = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const eventDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
            return { 
                id: doc.id,
                ...data,
                date: eventDate.toISOString(),
            } as Event
        });
        
        setAllEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch events.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

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
  }, [searchQuery, category, allEvents]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(allEvents.map((e) => e.category)))],
    [allEvents]
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

  const renderEventSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-48 w-full" />
          <div className="p-6 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-full mt-2" />
          </div>
        </Card>
      ))}
    </div>
  )

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

        {loading ? (
          renderEventSkeletons()
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No Upcoming Events Found</h2>
            <p className="text-muted-foreground mt-2">
              Please check back later for new opportunities.
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
