'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/clientApp';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Event } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, CheckSquare, ArrowLeft, Loader2, LogIn, PartyPopper, Hourglass } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import RegistrationDialog from "@/components/registration-dialog";


export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegDialog, setShowRegDialog] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    setLoading(true);
    const docRef = doc(db, 'events', eventId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const eventDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        setEvent({
          id: docSnap.id,
          ...data,
          date: eventDate.toISOString(),
        } as Event);
      } else {
        notFound();
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching event:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch event details.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId, toast]);

  const registrationStatus = useMemo(() => {
    if (!user || !event) return 'unregistered';
    if (user.registeredEventIds?.includes(event.id)) {
      // In a real app, you'd check the registrations collection to see if it's 'registered' or 'waitlisted'
      // For now, we assume if it's in the array, they are registered.
      return 'registered';
    }
    return 'unregistered';
  }, [user, event]);

  const handleRegisterClick = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to register for an event.",
        action: <Button onClick={() => router.push('/login')}><LogIn className="mr-2 h-4 w-4" />Login</Button>,
      });
      return;
    }
    setShowRegDialog(true);
  };
  
  if (loading || authLoading) {
    return (
      <div className="container mx-auto py-8 md:py-12 px-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="w-full h-96" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="w-full h-64" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return notFound();
  }
  
  const eventDate = new Date(event.date);
  const isEventFull = event.participants >= event.maxParticipants;

  return (
    <>
    <div className="bg-background">
      <div className="container mx-auto py-8 md:py-12 px-4">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all events
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative w-full h-64 md:h-96">
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  fill
                  objectFit="cover"
                  className="bg-muted"
                  data-ai-hint={event.imageHint}
                />
              </div>
              <CardHeader>
                <Badge
                  variant="secondary"
                  className="w-fit mb-2 bg-secondary/80 text-secondary-foreground"
                >
                  {event.category}
                </Badge>
                <CardTitle className="text-3xl md:text-4xl font-headline text-primary">
                  {event.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-foreground/80">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-headline">
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {eventDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="font-medium">{event.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {event.participants} / {event.maxParticipants} Volunteers
                  </span>
                </div>
                <Separator />
                
                {registrationStatus === 'registered' ? (
                  <Button size="lg" className="w-full font-bold text-lg" disabled>
                    <PartyPopper className="mr-2" /> You are Registered!
                  </Button>
                ) : (
                  <Button size="lg" className="w-full font-bold text-lg" onClick={handleRegisterClick}>
                    {isEventFull ? <><Hourglass className="mr-2" /> Join Waitlist</> : 'Register for this Event'}
                  </Button>
                )}

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-headline">
                  Required Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {event.requiredSkills.length > 0 ? event.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-sm">
                    <CheckSquare className="mr-2 h-4 w-4 text-secondary" />
                    {skill}
                  </Badge>
                )) : (
                  <p className="text-sm text-muted-foreground">No specific skills required.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    {user && (
      <RegistrationDialog
        open={showRegDialog}
        onOpenChange={setShowRegDialog}
        event={event}
        user={user}
        onSuccess={() => {
          toast({
            title: "Registration successful!",
            description: "We've saved your spot. Check your profile for details.",
          });
          setShowRegDialog(false);
        }}
      />
    )}
    </>
  );
}
