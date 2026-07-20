import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/features/donors/hooks/user.service";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () =>
      getUsers(),
  });
}