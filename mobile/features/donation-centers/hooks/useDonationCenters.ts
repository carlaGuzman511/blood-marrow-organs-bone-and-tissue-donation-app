import { useQuery } from "@tanstack/react-query";
import { getDonationCenters } from "@/features/donation-centers/services/donationCenter.service";

export function useDonationCenters() {
  return useQuery({
    queryKey: ["donation-centers"],
    queryFn: () =>
      getDonationCenters(),
  });
}