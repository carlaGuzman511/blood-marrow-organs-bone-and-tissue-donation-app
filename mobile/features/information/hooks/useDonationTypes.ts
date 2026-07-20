import { useQuery } from "@tanstack/react-query";
import { getDonationTypes } from "@/features/information/services/donationType.service";

export function useDonationTypes() {
  return useQuery({
    queryKey: ["donation-types"],
    queryFn: () =>
      getDonationTypes(),
  });
}