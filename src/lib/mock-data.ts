import type { Event, UserProfile } from "./types";

export const allEvents: Event[] = [
  {
    id: "1",
    name: "Beach Cleanup Drive",
    category: "Environment",
    date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    location: "Marina Beach, Chennai",
    description:
      "Join us for a massive beach cleanup drive to protect our marine ecosystem. Let's work together to make our beaches clean and safe for everyone.",
    requiredSkills: ["Teamwork", "Environmental Awareness"],
    imageUrl: "https://placehold.co/600x400",
    imageHint: "beach cleanup",
    participants: 45,
    maxParticipants: 100,
  },
  {
    id: "2",
    name: "Teach for a Day",
    category: "Education",
    date: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    location: "Govt. School, Velachery",
    description:
      "Spend a day teaching and inspiring underprivileged children. Subjects include English, Math, and Science. No prior teaching experience required.",
    requiredSkills: ["Communication", "Patience", "Teaching"],
    imageUrl: "https://placehold.co/600x400",
    imageHint: "children education",
    participants: 12,
    maxParticipants: 20,
  },
  {
    id: "3",
    name: "Community Health Camp",
    category: "Health",
    date: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(),
    location: "Community Hall, Adyar",
    description:
      "Assist medical professionals in a free health check-up camp for the local community. Roles include registration, crowd management, and basic health awareness.",
    requiredSkills: ["Management", "First Aid", "Communication"],
    imageUrl: "https://placehold.co/600x400",
    imageHint: "health camp",
    participants: 25,
    maxParticipants: 40,
  },
  {
    id: "4",
    name: "Tree Plantation Initiative",
    category: "Environment",
    date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    location: "Guindy National Park",
    description:
      "Be a part of our green initiative to plant 1000 saplings in the city. Help us combat climate change and increase our green cover.",
    requiredSkills: ["Gardening", "Teamwork"],
    imageUrl: "https://placehold.co/600x400",
    imageHint: "tree planting",
    participants: 78,
    maxParticipants: 150,
  },
  {
    id: "5",
    name: "Senior Citizen Assistance",
    category: "Community",
    date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    location: "Elders Home, Nungambakkam",
    description:
      "Spend quality time with senior citizens, assist them with daily chores, and organize recreational activities. A day of compassion and connection.",
    requiredSkills: ["Empathy", "Patience", "Communication"],
    imageUrl: "https://placehold.co/600x400",
    imageHint: "senior care",
    participants: 8,
    maxParticipants: 15,
  },
  {
    id: "6",
    name: "Coding Bootcamp for Girls",
    category: "Education",
    date: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(),
    location: "Online",
    description:
      "Mentor and guide young girls in our free online coding bootcamp. Help empower the next generation of women in tech. Basic programming knowledge required.",
    requiredSkills: ["Programming", "Mentoring", "JavaScript"],
    imageUrl: "https://placehold.co/600x400",
    imageHint: "coding bootcamp",
    participants: 30,
    maxParticipants: 50,
  },
];

export const userProfile: UserProfile = {
  id: "user-123",
  name: "Anya Sharma",
  email: "anya.sharma@example.com",
  avatarUrl: "https://placehold.co/100x100",
  skills: ["JavaScript", "Teaching", "Teamwork", "First Aid"],
  interests: ["Education", "Technology", "Healthcare"],
  volunteerHours: 128,
  pastEvents: [
    { id: "p1", name: "Blood Donation Camp", date: "2023-11-20" },
    { id: "p2", name: "River Cleanup", date: "2024-01-15" },
    { id: "p3", name: "Winter Clothes Drive", date: "2024-02-10" },
  ],
};
