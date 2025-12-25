import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { type InsertFile, type UpdateFile } from "@shared/schema";

export function useFiles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery({
    queryKey: [api.files.list.path],
    queryFn: async () => {
      const res = await fetch(api.files.list.path);
      if (res.status === 401) return [];
      if (!res.ok) throw new Error("Failed to fetch files");
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: InsertFile) => {
      const res = await fetch(api.files.upload.path, {
        method: api.files.upload.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
      toast({ title: "File created", description: "Your file has been published." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateFile }) => {
      const res = await fetch(api.files.update.path.replace(":id", String(id)), {
        method: api.files.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Edit failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
      toast({ title: "File updated", description: "Changes saved." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(api.files.delete.path.replace(":id", String(id)), {
        method: api.files.delete.method,
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
      toast({ title: "File deleted" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  return {
    files,
    isLoading,
    uploadFile: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    editFile: editMutation.mutate,
    isEditing: editMutation.isPending,
    deleteFile: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
