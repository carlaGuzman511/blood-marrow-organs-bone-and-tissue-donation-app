import { useQuery } from "@tanstack/react-query";
import { getBloodTypes } from "@/services/bloodType.service";

export function useBloodTypes() {
  return useQuery({
    queryKey: ["blood-types"],
    queryFn: () =>
      getBloodTypes(),
  });
}