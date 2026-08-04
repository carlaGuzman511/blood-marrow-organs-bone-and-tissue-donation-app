import { z } from "zod";

export const donationPostSchema = z.object({
  city: z.string().min(1, "City is required"),
  hospital: z.string().min(1, "Hospital/Center is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  mobile: z.string().regex(/^[0-9+]{7,15}$/, "Invalid phone number"),
  note: z.string().optional(),
});

export type DonationPostFormData = z.infer<typeof donationPostSchema>;