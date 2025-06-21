// src/ai/flows/suggest-events.ts
'use server';
/**
 * @fileOverview A flow to suggest events to volunteers based on their profile information.
 *
 * - suggestEvents - A function that suggests events based on a volunteer's profile.
 * - SuggestEventsInput - The input type for the suggestEvents function.
 * - SuggestEventsOutput - The return type for the suggestEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEventsInputSchema = z.object({
  volunteerSkills: z
    .array(z.string())
    .describe('The skills of the volunteer.'),
  volunteerInterests: z
    .array(z.string())
    .describe('The interests of the volunteer.'),
  upcomingEvents: z.array(z.object({
    eventName: z.string(),
    eventDescription: z.string(),
    eventCategory: z.string(),
    eventDate: z.string().describe('The date of the event in ISO format.'),
    eventLocation: z.string(),
    requiredSkills: z.array(z.string()),
  })).describe('A list of upcoming events.'),
});
export type SuggestEventsInput = z.infer<typeof SuggestEventsInputSchema>;

const SuggestEventsOutputSchema = z.array(z.object({
  eventName: z.string(),
  eventDescription: z.string(),
  eventCategory: z.string(),
  eventDate: z.string().describe('The date of the event in ISO format.'),
  eventLocation: z.string(),
  requiredSkills: z.array(z.string()),
  relevanceScore: z.number().describe('A score indicating how relevant the event is to the volunteer.'),
  reasoning: z.string().describe('The reasoning behind the relevance score.'),
})).describe('A list of suggested events, with a relevance score for each event.');
export type SuggestEventsOutput = z.infer<typeof SuggestEventsOutputSchema>;

export async function suggestEvents(input: SuggestEventsInput): Promise<SuggestEventsOutput> {
  return suggestEventsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEventsPrompt',
  input: {schema: SuggestEventsInputSchema},
  output: {schema: SuggestEventsOutputSchema},
  prompt: `You are an AI assistant that suggests relevant volunteer events to users based on their skills and interests.

Here are the volunteer's skills: {{volunteerSkills}}
Here are the volunteer's interests: {{volunteerInterests}}

Here are the upcoming events:
{{#each upcomingEvents}}
  Event Name: {{eventName}}
  Description: {{eventDescription}}
  Category: {{eventCategory}}
  Date: {{eventDate}}
  Location: {{eventLocation}}
  Required Skills: {{requiredSkills}}
{{/each}}

Suggest events that match the volunteer's skills and interests. For each suggested event, provide a relevance score (0-1) and reasoning for the score.

Return a JSON array of events, sorted by relevance score in descending order.
`,
});

const suggestEventsFlow = ai.defineFlow(
  {
    name: 'suggestEventsFlow',
    inputSchema: SuggestEventsInputSchema,
    outputSchema: SuggestEventsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
