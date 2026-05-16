import goa from "@/assets/campaign-goa.jpg";
import dubai from "@/assets/campaign-dubai.jpg";
import europe from "@/assets/campaign-europe.jpg";
import family from "@/assets/campaign-family.jpg";
import students from "@/assets/campaign-students.jpg";
import wing from "@/assets/campaign-wing.jpg";
import business from "@/assets/campaign-business.jpg";

export type GalleryItem = {
  id: string;
  image: string;
  title: string;
  platform: string;
  campaign: string;
  audience: string;
  mood: string;
  virality: number;
};

export const galleryItems: GalleryItem[] = [
  { id: "1", image: goa, title: "Goa Monsoon Escape", platform: "Instagram", campaign: "Weekend Escape", audience: "Gen Z", mood: "Exciting", virality: 92 },
  { id: "2", image: dubai, title: "Dubai Luxury Weekend", platform: "LinkedIn", campaign: "Luxury Travel", audience: "Luxury Audience", mood: "Luxury", virality: 88 },
  { id: "3", image: europe, title: "Europe Escape", platform: "Instagram", campaign: "Summer Travel", audience: "Solo Travelers", mood: "Emotional", virality: 95 },
  { id: "4", image: family, title: "Family Vacation Campaign", platform: "Facebook", campaign: "Family Vacation", audience: "Families", mood: "Fun", virality: 81 },
  { id: "5", image: students, title: "Student Summer Sale", platform: "Instagram", campaign: "Student Offer", audience: "Gen Z", mood: "Exciting", virality: 89 },
  { id: "6", image: wing, title: "Sunset Skies", platform: "YouTube", campaign: "Flash Sale", audience: "Business Travelers", mood: "Minimal", virality: 76 },
  { id: "7", image: business, title: "Boardroom to Boarding", platform: "LinkedIn", campaign: "Business Travel", audience: "Business Travelers", mood: "Professional", virality: 84 },
  { id: "8", image: goa, title: "Monsoon Flash Fares", platform: "Twitter/X", campaign: "Flash Sale", audience: "Budget Travelers", mood: "Exciting", virality: 78 },
  { id: "9", image: dubai, title: "Desert Skyline Stories", platform: "Instagram", campaign: "Luxury Travel", audience: "Luxury Audience", mood: "Luxury", virality: 91 },
];

export const sampleImages = [goa, dubai, europe, family, students, wing, business];

export const captionsFor = (destination: string, mood: string) => [
  `Pack lighter. Dream bigger. ${destination || "Your next escape"} is calling. ✈️`,
  `${mood || "Unforgettable"} skies, unbeatable fares. Fly 6E to ${destination || "anywhere"}.`,
  `Some plans need wings. Discover ${destination || "the world"} with IndiGo today.`,
];

export const hashtagsFor = (platform: string) => {
  const base = ["#6E", "#IndiGo", "#FlyWith6E", "#TravelMore"];
  if (platform === "Instagram") return [...base, "#InstaTravel", "#Wanderlust", "#TravelReels"];
  if (platform === "LinkedIn") return [...base, "#BusinessTravel", "#Aviation", "#Leadership"];
  if (platform === "Twitter/X") return [...base, "#Travel", "#FlashSale"];
  return [...base, "#Holiday", "#Vacation"];
};
