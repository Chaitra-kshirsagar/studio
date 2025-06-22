'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { uploadCertificateAction } from '@/app/admin/events/[id]/attendees/actions';
import { useToast } from '@/hooks/use-toast';

import type { Event, Registration } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, UploadCloud } from 'lucide-react';

interface CertificateUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: Event;
    registration: Registration;
    onSuccess: () => void;
}

const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const uploadFormSchema = z.object({
    certificate: z.custom<FileList>()
        .refine((files) => files?.length === 1, "A certificate file is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine((files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type), "Only .jpg, .png and .pdf formats are supported."),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

export default function CertificateUploadDialog({ open, onOpenChange, event, registration, onSuccess }: CertificateUploadDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<UploadFormValues>({
        resolver: zodResolver(uploadFormSchema),
    });

    async function onSubmit(data: UploadFormValues) {
        setIsSubmitting(true);
        setServerError(null);

        const formData = new FormData();
        formData.append('certificate', data.certificate[0]);
        formData.append('eventId', event.id);
        formData.append('userId', registration.userId);
        formData.append('eventName', event.name);

        const result = await uploadCertificateAction(formData);

        setIsSubmitting(false);

        if (result.success) {
            onSuccess();
            form.reset();
        } else {
            setServerError(result.error ?? 'An unknown error occurred.');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Certificate</DialogTitle>
                    <DialogDescription>
                        For <span className="font-semibold">{registration.userName}</span> at event: <span className="font-semibold">{event.name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="certificate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Certificate File</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                                     {field.value?.[0] ? (
                                                        <p className="text-sm font-semibold text-primary">{field.value[0].name}</p>
                                                     ) : (
                                                        <>
                                                            <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                                            <p className="text-xs text-muted-foreground">PDF, PNG, or JPG (MAX. 5MB)</p>
                                                        </>
                                                     )}
                                                </div>
                                                <Input id="dropzone-file" type="file" className="hidden" 
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                    accept={ACCEPTED_FILE_TYPES.join(',')}
                                                />
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {serverError && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Upload Failed</AlertTitle>
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Uploading...' : 'Upload & Issue'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
