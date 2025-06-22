'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, Clock, Edit, Linkedin, FileText, Download } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from "@/firebase/clientApp";
import type { Certificate } from "@/lib/types";

function ProfilePageContent() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCertificates = async () => {
      setLoadingCerts(true);
      try {
        const certsCollection = collection(db, 'certificates');
        const q = query(certsCollection, where('userId', '==', user.uid), orderBy('dateIssued', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedCerts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certificate));
        setCertificates(fetchedCerts);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoadingCerts(false);
      }
    };

    fetchCertificates();
  }, [user]);

  if (!user) return null;

  const userInitial = user.name?.charAt(0).toUpperCase() || "";

  const skills = user.skills || [];
  const interests = user.interests || [];
  const volunteerHours = user.volunteerHours || 0;
  const pastEvents = user.pastEvents || [];
  
  const handleLinkedInShare = (cert: Certificate) => {
    const shareText = `I'm proud to have received this certificate for volunteering at the "${cert.eventName}" event with Bhumi! It was a great experience contributing to the community. #Bhumi #Volunteering #CommunityImpact`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cert.fileUrl)}&title=${encodeURIComponent(`Certificate of Participation - ${cert.eventName}`)}&summary=${encodeURIComponent(shareText)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-muted/40">
      <div className="container mx-auto py-8 md:py-12 px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardContent className="flex flex-col items-center text-center p-8">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait"/>
                  <AvatarFallback className="text-3xl">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold font-headline">
                  {user.name}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
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
                  {skills.length > 0 ? skills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  )) : <p className="text-sm text-muted-foreground">No skills added yet.</p>}
                </div>
                <h3 className="font-semibold text-sm mb-2">My Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {interests.length > 0 ? interests.map((interest) => (
                    <Badge variant="secondary" key={interest}>
                      {interest}
                    </Badge>
                  )) : <p className="text-sm text-muted-foreground">No interests added yet.</p>}
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
                        <div className="text-2xl font-bold">{volunteerHours}</div>
                        <div className="text-sm text-muted-foreground">Hours Volunteered</div>
                    </div>
                 </div>
                 <div className="p-4 bg-muted rounded-lg flex items-center gap-4">
                    <BookOpen className="w-8 h-8 text-secondary" />
                    <div>
                        <div className="text-2xl font-bold">{pastEvents.length}</div>
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
                {pastEvents.length > 0 ? (
                    <ul className="space-y-4">
                        {pastEvents.map((event, index) => (
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
                                {index < pastEvents.length - 1 && <Separator className="mt-4" />}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No past events recorded.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">My Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                 {loadingCerts ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading certificates...</p>
                 ) : certificates.length > 0 ? (
                     <ul className="space-y-4">
                        {certificates.map((cert, index) => (
                            <li key={cert.id}>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                    <div className="mb-2 sm:mb-0">
                                        <div className="font-semibold flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-secondary" /> {cert.eventName}
                                        </div>
                                        <p className="text-sm text-muted-foreground ml-6">
                                            Issued on {new Date(cert.dateIssued.toDate()).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 self-end sm:self-center">
                                        <Button variant="secondary" size="sm" asChild>
                                            <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer"><Download className="mr-2" /> Download</a>
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleLinkedInShare(cert)}>
                                            <Linkedin className="mr-2" /> Share
                                        </Button>
                                    </div>
                                </div>
                                {index < certificates.length - 1 && <Separator className="mt-4" />}
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50"/>
                        <p>No certificates yet.</p>
                        <p className="text-sm">Complete an event to earn a certificate.</p>
                    </div>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  )
}
