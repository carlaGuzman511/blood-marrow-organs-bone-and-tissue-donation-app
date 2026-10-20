import { useQuery } from "@tanstack/react-query";
import { getDonors } from "@/features/donors/hooks/user.service";

export function useDonors() {
  return useQuery({
    queryKey: ["donors"],
    queryFn: () =>
      getDonors(),
  });
}
