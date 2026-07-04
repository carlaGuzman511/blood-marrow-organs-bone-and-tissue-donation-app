import { useQuery } from "@tanstack/react-query";
import { getBloodTypes } from "@/services/bloodTypeService";

export function useBloodTypes() {
  return useQuery({
    queryKey: ["blood-types"],
    queryFn: () =>
      getBloodTypes(),
  });
}