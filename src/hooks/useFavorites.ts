import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type FavoriteType = "line" | "bus" | "stop";

export type Favorite = {
  id: string;
  user_id: string;
  item_type: FavoriteType;
  item_id: string;
  label: string;
  created_at: string;
};

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const list = useQuery({
    queryKey: ["favorites", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Favorite[];
    },
  });

  const toggle = useMutation({
    mutationFn: async (input: { type: FavoriteType; itemId: string; label: string }) => {
      if (!userId) throw new Error("Faça login para salvar favoritos.");
      const existing = (list.data ?? []).find(
        (f) => f.item_type === input.type && f.item_id === input.itemId,
      );
      if (existing) {
        const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
        if (error) throw new Error(error.message);
        return "removed" as const;
      }
      const { error } = await supabase.from("favorites").insert({
        user_id: userId,
        item_type: input.type,
        item_id: input.itemId,
        label: input.label,
      });
      if (error) throw new Error(error.message);
      return "added" as const;
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
      toast.success(result === "added" ? "Adicionado aos favoritos" : "Removido dos favoritos");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("favorites").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
      toast.success("Removido dos favoritos");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const isFavorite = (type: FavoriteType, itemId: string) =>
    (list.data ?? []).some((f) => f.item_type === type && f.item_id === itemId);

  return { favorites: list.data ?? [], isLoading: list.isLoading, toggle, remove, isFavorite };
}
