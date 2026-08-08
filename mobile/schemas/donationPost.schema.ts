import { z } from "zod";

export const donationPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  city: z.string().min(1, "City is required"),
  hospital: z.string().min(1, "Hospital/Center is required"),
  bloodTypeId: z.string().min(1, "Blood type is required"),
  donationTypeId: z.string().min(1, "Donation type is required"),
  mobile: z.string().regex(/^[0-9+]{7,15}$/, "Invalid phone number"),
  description: z.string().optional(),
});

export type DonationPostFormData = z.infer<typeof donationPostSchema>;