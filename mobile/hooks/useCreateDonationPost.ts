import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDonationPost } from "@/services/donationPost.service";

export function useCreateDonationPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDonationPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation-posts"] });
    },
  });
}