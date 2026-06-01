"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ActionItem {
  id: string;
  phase: number;
  step: number;
  description: string;
  completedAt: string | null;
}

export function useActionItems() {
  const queryClient = useQueryClient();

  const query = useQuery<ActionItem[]>({
    queryKey: ["action-items"],
    queryFn: async () => {
      const res = await fetch("/api/action-items");
      if (!res.ok) throw new Error("Error al cargar tareas");
      const data = await res.json() as { items: ActionItem[] };
      return data.items;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await fetch("/api/action-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed }),
      });
      if (!res.ok) throw new Error("Error al actualizar tarea");
      return res.json();
    },
    onMutate: async ({ id, completed }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ["action-items"] });

      // Snapshot para rollback
      const previous = queryClient.getQueryData<ActionItem[]>(["action-items"]);

      // Actualización optimista
      queryClient.setQueryData<ActionItem[]>(["action-items"], (old) =>
        old?.map((item) =>
          item.id === id
            ? { ...item, completedAt: completed ? new Date().toISOString() : null }
            : item
        ) ?? []
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Rollback en error
      if (context?.previous) {
        queryClient.setQueryData(["action-items"], context.previous);
      }
      toast.error("Error al actualizar la tarea");
    },
    onSuccess: (_data, { completed }) => {
      if (completed) toast.success("¡Tarea completada! 🎯");
      queryClient.invalidateQueries({ queryKey: ["action-items"] });
    },
  });

  const progress = (() => {
    const items = query.data ?? [];
    if (items.length === 0) return 0;
    const done = items.filter((i) => i.completedAt !== null).length;
    return Math.round((done / items.length) * 100);
  })();

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    progress,
    toggleTask: (id: string, currentlyCompleted: boolean) =>
      toggleMutation.mutate({ id, completed: !currentlyCompleted }),
  };
}
