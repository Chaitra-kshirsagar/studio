import { userProfile } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, Clock, Edit, FileText, Share2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const userInitial = userProfile.name.charAt(0);
  return (
    <div className="bg-muted/40">
      <div className="container mx-auto py-8 md:py-12 px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardContent className="flex flex-col items-center text-center p-8">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} data-ai-hint="female portrait"/>
                  <AvatarFallback className="text-3xl">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold font-headline">
                  {userProfile.name}
                </h1>
                <p className="text-muted-foreground">{userProfile.email}</p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Skills & Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-sm mb-2">My Skills</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {userProfile.skills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
                <h3 className="font-semibold text-sm mb-2">My Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest) => (
                    <Badge variant="secondary" key={interest}>
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">My Impact</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 bg-muted rounded-lg flex items-center gap-4">
                    <Clock className="w-8 h-8 text-primary" />
                    <div>
                        <div className="text-2xl font-bold">{userProfile.volunteerHours}</div>
                        <div className="text-sm text-muted-foreground">Hours Volunteered</div>
                    </div>
                 </div>
                 <div className="p-4 bg-muted rounded-lg flex items-center gap-4">
                    <BookOpen className="w-8 h-8 text-secondary" />
                    <div>
                        <div className="text-2xl font-bold">{userProfile.pastEvents.length}</div>
                        <div className="text-sm text-muted-foreground">Events Attended</div>
                    </div>
                 </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Past Events</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                    {userProfile.pastEvents.map((event, index) => (
                        <li key={event.id}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{event.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(event.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/events/${event.id}`}>View</Link>
                                </Button>
                            </div>
                            {index < userProfile.pastEvents.length - 1 && <Separator className="mt-4" />}
                        </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">My Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-center text-muted-foreground py-8">
                    <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50"/>
                    <p>No certificates yet.</p>
                    <p className="text-sm">Complete an event to earn a certificate.</p>
                 </div>
                 {/* Example of a certificate item */}
                 {/*
                 <div className="flex justify-between items-center border p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                        <FileText className="w-6 h-6 text-primary" />
                        <div>
                            <p className="font-semibold">Certificate of Appreciation</p>
                            <p className="text-sm text-muted-foreground">For: Beach Cleanup Drive</p>
                        </div>
                    </div>
                    <Button variant="secondary" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                 </div>
                 */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
