import Image from "next/image";
import { notFound } from "next/navigation";
import { allEvents } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, CheckSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const event = allEvents.find((e) => e.id === params.id);

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.date);

  return (
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
                  layout="fill"
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
                <Button size="lg" className="w-full font-bold text-lg">
                  Register for this Event
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-headline">
                  Required Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {event.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-sm">
                    <CheckSquare className="mr-2 h-4 w-4 text-secondary" />
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
