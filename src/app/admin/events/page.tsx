'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase/clientApp';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsCollection = collection(db, 'events');
        
        let q;
        if (user.role === 'super_admin') {
          // Super admin sees all events
          q = query(eventsCollection, orderBy('date', 'desc'));
        } else {
          // Event admin sees only their events
          q = query(eventsCollection, where('createdBy', '==', user.uid), orderBy('date', 'desc'));
        }
        
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
        
        setEvents(fetchedEvents);
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
  }, [user, toast]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-3xl font-headline">
              Event Management
            </CardTitle>
            <CardDescription>
              {user?.role === 'super_admin' ? 'Create, update, and manage all volunteer events.' : 'Manage the events you have created.'}
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/events/create">
              <PlusCircle className="mr-2" /> Create New Event
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
        <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-center">Participants</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{event.category}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(event.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell className="text-center">
                  {event.participants} / {event.maxParticipants}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                          <Link href={`/admin/events/${event.id}/attendees`}><Users className="mr-2 h-4 w-4" />Manage Attendees</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
        )}
        {!loading && events.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No events found.</p>
            <p>Click "Create New Event" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
