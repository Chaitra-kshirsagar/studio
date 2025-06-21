"use server";

import {
  suggestEvents,
  type SuggestEventsInput,
} from "@/ai/flows/suggest-events";

export async function getSuggestedEvents(input: SuggestEventsInput) {
  try {
    // This is a placeholder for a real authentication check
    // In a real app, you would get the user from the session
    console.log("Getting suggestions for authenticated user...");

    const suggestions = await suggestEvents(input);
    return { success: true, data: suggestions };
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    // In a real app, you might want to log this error to a monitoring service
    return { success: false, error: "Failed to get AI suggestions." };
  }
}
