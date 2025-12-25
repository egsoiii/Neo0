import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { type InsertFolder } from "@shared/schema";

export function useFolders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: folders, isLoading } = useQuery({
    queryKey: [api.folders.list.path],
    queryFn: async () => {
      const res = await fetch(api.folders.list.path);
      if (res.status === 401) return [];
      if (!res.ok) throw new Error("Failed to fetch folders");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertFolder) => {
      const res = await fetch(api.folders.create.path, {
        method: api.folders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Create failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.folders.list.path] });
      toast({ title: "Folder created" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await fetch(api.folders.rename.path.replace(":id", String(id)), {
        method: api.folders.rename.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Rename failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.folders.list.path] });
      toast({ title: "Folder renamed" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(api.folders.delete.path.replace(":id", String(id)), {
        method: api.folders.delete.method,
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.folders.list.path] });
      toast({ title: "Folder deleted" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  return {
    folders,
    isLoading,
    createFolder: createMutation.mutate,
    isCreating: createMutation.isPending,
    renameFolder: renameMutation.mutate,
    isRenaming: renameMutation.isPending,
    deleteFolder: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
