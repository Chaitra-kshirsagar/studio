'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';

import CertificateUploadDialog from '@/components/certificate-upload-dialog';
import { db } from '@/firebase/clientApp';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Registration, Event, Certificate } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Download, UploadCloud } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageAttendeesPage() {
    const { id: eventId } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [certificates, setCertificates] = useState<Map<string, Certificate>>(new Map());
    const [loading, setLoading] = useState(true);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const { toast } = useToast();
    
    const fetchData = useCallback(async () => {
        if (!eventId || typeof eventId !== 'string') return;
        setLoading(true);
        try {
            // Fetch event details
            const eventRef = doc(db, 'events', eventId);
            const eventSnap = await getDoc(eventRef);
            if (!eventSnap.exists()) {
                notFound();
                return;
            }
            const eventData = eventSnap.data() as Omit<Event, 'id' | 'date'>;
            const eventDate = eventData.date?.toDate ? eventData.date.toDate() : new Date(eventData.date);
            setEvent({ id: eventSnap.id, ...eventData, date: eventDate.toISOString() });

            // Fetch registrations
            const regQuery = query(collection(db, 'registrations'), where('eventId', '==', eventId));
            const regSnap = await getDocs(regQuery);
            const fetchedRegistrations = regSnap.docs.map(d => ({ id: d.id, ...d.data() } as Registration));
            setRegistrations(fetchedRegistrations);

            // Fetch existing certificates
            const certQuery = query(collection(db, 'certificates'), where('eventId', '==', eventId));
            const certSnap = await getDocs(certQuery);
            const fetchedCertificates = new Map<string, Certificate>();
            certSnap.docs.forEach(d => {
                const cert = { id: d.id, ...d.data() } as Certificate;
                fetchedCertificates.set(cert.userId, cert);
            });
            setCertificates(fetchedCertificates);

        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load attendee data.' });
        } finally {
            setLoading(false);
        }
    }, [eventId, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUploadSuccess = () => {
        toast({ title: 'Success', description: 'Certificate uploaded successfully.' });
        setSelectedRegistration(null);
        fetchData(); // Refresh data
    };
    
    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-8" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                           {[...Array(3)].map((i, idx) => <Skeleton key={idx} className="h-10 w-full" />)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!event) return null;

    return (
        <div className="space-y-6">
             <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Manage Attendees</CardTitle>
                    <CardDescription>Event: {event.name}</CardDescription>
                </CardHeader>
                <CardContent>
                    {registrations.length > 0 ? (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>T-Shirt Size</TableHead>
                                        <TableHead className="text-right">Certificate</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {registrations.map(reg => {
                                        const certificate = certificates.get(reg.userId);
                                        return (
                                        <TableRow key={reg.id}>
                                            <TableCell className="font-medium">{reg.userName}</TableCell>
                                            <TableCell>
                                                <Badge variant={reg.status === 'registered' ? 'secondary' : 'outline'}>{reg.status}</Badge>
                                            </TableCell>
                                            <TableCell>{reg.customFields?.tShirtSize || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                {certificate ? (
                                                    <Button variant="outline" size="sm" asChild>
                                                       <a href={certificate.fileUrl} target="_blank" rel="noopener noreferrer">
                                                            <Download className="mr-2" /> View
                                                        </a>
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" onClick={() => setSelectedRegistration(reg)}>
                                                        <UploadCloud className="mr-2" /> Upload
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )})}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>No one has registered for this event yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            {selectedRegistration && event && (
                <CertificateUploadDialog
                    open={!!selectedRegistration}
                    onOpenChange={() => setSelectedRegistration(null)}
                    event={event}
                    registration={selectedRegistration}
                    onSuccess={handleUploadSuccess}
                />
            )}
        </div>
    );
}
