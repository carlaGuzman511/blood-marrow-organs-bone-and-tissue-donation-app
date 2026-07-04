import { useQuery } from "@tanstack/react-query";
import { getDonationCenters } from "@/services/donationCenterService";

export function useDonationCenters() {
  return useQuery({
    queryKey: ["donation-centers"],
    queryFn: () =>
      getDonationCenters(),
  });
}