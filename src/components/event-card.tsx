import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/types";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";

type EventCardProps = {
  event: Event;
};

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={event.imageUrl}
            alt={event.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={event.imageHint}
          />
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 bg-secondary/80 text-secondary-foreground"
          >
            {event.category}
          </Badge>
        </div>
        <div className="p-6 pb-2">
          <CardTitle className="font-headline text-xl leading-tight">
            {event.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 px-6 pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{eventDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {event.participants} / {event.maxParticipants} volunteers
          </span>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6">
        <Button asChild className="w-full">
          <Link href={`/events/${event.id}`}>
            View Details <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
