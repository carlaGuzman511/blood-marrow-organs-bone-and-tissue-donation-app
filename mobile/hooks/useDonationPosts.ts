import { useQuery } from "@tanstack/react-query";
import { getDonationPosts } from "@/services/donationPost.service";

export function useDonationPosts() {
  return useQuery({
    queryKey: ["donation-posts"],
    queryFn: () =>
      getDonationPosts(),
  });
}