import { useQuery } from "@tanstack/react-query";
import { getDonationTypes } from "@/services/donationTypeService";

export function useDonationTypes() {
  return useQuery({
    queryKey: ["donation-types"],
    queryFn: () =>
      getDonationTypes(),
  });
}