export type Event = {
  id: string;
  name: string;
  category: "Environment" | "Education" | "Health" | "Community";
  date: string;
  location: string;
  description: string;
  requiredSkills: string[];
  imageUrl: string;
  imageHint: string;
  participants: number;
  maxParticipants: number;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  skills: string[];
  interests: string[];
  volunteerHours: number;
  pastEvents: Pick<Event, "id" | "name" | "date">[];
};
