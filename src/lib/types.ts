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
  visibility?: 'public' | 'private';
  groupId?: string;
  createdBy?: string;
  createdAt?: any; // Should be Firestore Timestamp
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'volunteer' | 'event_admin' | 'super_admin';
  skills?: string[];
  interests?: string[];
  volunteerHours?: number;
  pastEvents?: Pick<Event, "id" | "name" | "date">[];
  createdAt?: any; // Should be Firestore Timestamp
};
