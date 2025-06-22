'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { format } from 'date-fns';

import { useAuth } from '@/context/AuthContext';
import { storage } from '@/firebase/clientApp';
import { createEventAction } from './actions';
import { useToast } from '@/hooks/use-toast';

import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2, UploadCloud, MessageSquarePlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const eventFormSchema = z.object({
  name: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  location: z.string().min(3, { message: "Location is required." }),
  date: z.date({ required_error: "An event date is required." })
    .refine((date) => date > new Date(), { message: "Event date must be in the future." }),
  maxParticipants: z.coerce.number().int().positive({ message: "Capacity must be a positive number." }),
  visibility: z.enum(['public', 'private'], { required_error: "Please select event visibility." }),
  groupId: z.string().optional(),
  customReminderMessage: z.string().optional(),
  postEventMessage: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

function CreateEventPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      visibility: 'public',
      groupId: '',
      customReminderMessage: '',
      postEventMessage: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  async function onSubmit(data: EventFormValues) {
    if (!imageFile) {
      toast({ variant: 'destructive', title: 'Image Required', description: 'Please upload a cover image for the event.' });
      return;
    }
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create an event.' });
        return;
    }

    setIsSubmitting(true);
    
    try {
      const storageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload the image.' });
          setIsSubmitting(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const result = await createEventAction({
            ...data,
            imageUrl: downloadURL,
            createdBy: user.uid,
          });

          if (result.success) {
            toast({ title: 'Success', description: result.message });
            router.push('/admin/events');
          } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
            setIsSubmitting(false);
          }
        }
      );
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Create a New Event</CardTitle>
            <CardDescription>Fill out the details below to create a new volunteer event.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input placeholder="e.g., Annual Beach Cleanup" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the event, its goals, and what volunteers will do." {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid md:grid-cols-2 gap-8">
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Marina Beach, Chennai" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="maxParticipants" render={({ field }) => (
                    <FormItem><FormLabel>Capacity (Max Volunteers)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Date and Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date <= new Date()} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                    {imageFile ? (
                                        <p className="font-semibold text-primary">{imageFile.name}</p>
                                    ) : (
                                        <>
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG or GIF (MAX. 800x400px)</p>
                                        </>
                                    )}
                                </div>
                                <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/png, image/jpeg, image/gif" />
                            </label>
                        </div>
                    </FormControl>
                    {uploadProgress > 0 && <Progress value={uploadProgress} className="w-full mt-2" />}
                    <FormMessage />
                </FormItem>

                <FormField control={form.control} name="visibility" render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel>Visibility</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="public" /></FormControl>
                          <FormLabel className="font-normal">Public - Visible to everyone.</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="private" /></FormControl>
                          <FormLabel className="font-normal">Private - Visible only to invited users.</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="groupId" render={({ field }) => (
                  <FormItem><FormLabel>Group ID (Optional)</FormLabel><FormControl><Input placeholder="e.g., summer-cleanup-2024" {...field} /></FormControl><FormDescription>If this is part of a series of recurring events, enter a common group ID.</FormDescription><FormMessage /></FormItem>
                )} />

                <Separator />
                
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-lg font-medium font-headline flex items-center"><MessageSquarePlus className="mr-2 h-5 w-5" />Automated Reminders (Optional)</h3>
                        <p className="text-sm text-muted-foreground">Customize the messages sent to volunteers. Leave blank to use default messages.</p>
                    </div>
                    <FormField control={form.control} name="customReminderMessage" render={({ field }) => (
                        <FormItem><FormLabel>Pre-Event Reminder Message</FormLabel><FormControl><Textarea placeholder="e.g., Hi [Volunteer Name], just a friendly reminder about the [Event Name] event tomorrow at [Time]. We can't wait to see you there!" {...field} rows={3} /></FormControl><FormDescription>This message will be sent 24 hours before the event.</FormDescription><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="postEventMessage" render={({ field }) => (
                        <FormItem><FormLabel>Post-Event Follow-Up Message</FormLabel><FormControl><Textarea placeholder="e.g., Thank you for making the [Event Name] a success! We'd love to hear your feedback." {...field} rows={3} /></FormControl><FormDescription>This message will be sent about an hour after the event ends.</FormDescription><FormMessage /></FormItem>
                    )} />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Creating Event...' : 'Create Event'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <RoleProtectedRoute allowedRoles={['event_admin', 'super_admin']}>
      <CreateEventPageContent />
    </RoleProtectedRoute>
  )
}
