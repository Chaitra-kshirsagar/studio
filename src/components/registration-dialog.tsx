'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import type { Event, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { registerForEventAction } from '@/app/events/actions';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';

interface RegistrationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: Event;
    user: UserProfile;
    onSuccess: () => void;
}

const registrationFormSchema = z.object({
    name: z.string(),
    tShirtSize: z.enum(['S', 'M', 'L', 'XL', 'XXL'], { required_error: 'Please select a T-shirt size' }),
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

export default function RegistrationDialog({ open, onOpenChange, event, user, onSuccess }: RegistrationDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationFormSchema),
        defaultValues: {
            name: user.name || '',
            tShirtSize: undefined,
        },
    });
    
    const isEventFull = event.participants >= event.maxParticipants;

    async function onSubmit(data: RegistrationFormValues) {
        setIsSubmitting(true);
        setServerError(null);

        const result = await registerForEventAction({
            eventId: event.id,
            userId: user.uid,
            userName: user.name,
            customFields: {
                tShirtSize: data.tShirtSize,
            },
        });

        setIsSubmitting(false);

        if (result.success) {
            onSuccess();
        } else {
            setServerError(result.error ?? 'An unknown error occurred.');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register for: {event.name}</DialogTitle>
                    <DialogDescription>
                        Confirm your details to volunteer. 
                        {isEventFull && " The event is currently full, but you can join the waitlist."}
                    </DialogDescription>
                </DialogHeader>

                {isEventFull && (
                    <Alert variant="default" className="bg-accent/50 border-accent">
                        <AlertTriangle className="h-4 w-4 text-accent-foreground" />
                        <AlertTitle className="font-semibold text-accent-foreground">You'll be on the Waitlist</AlertTitle>
                        <AlertDescription className="text-accent-foreground/80">
                            We'll notify you if a spot opens up.
                        </AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="tShirtSize" render={({ field }) => (
                            <FormItem>
                                <FormLabel>T-Shirt Size (for event gear)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your size" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="S">Small (S)</SelectItem>
                                        <SelectItem value="M">Medium (M)</SelectItem>
                                        <SelectItem value="L">Large (L)</SelectItem>
                                        <SelectItem value="XL">Extra Large (XL)</SelectItem>
                                        <SelectItem value="XXL">XX-Large (XXL)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                        {serverError && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Registration Failed</AlertTitle>
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Submitting...' : isEventFull ? 'Join Waitlist' : 'Confirm Registration'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
