import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertFile } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useFiles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files, isLoading, isError } = useQuery({
    queryKey: [api.files.list.path],
    queryFn: async () => {
      const res = await fetch(api.files.list.path);
      if (!res.ok) throw new Error("Failed to fetch files");
      return api.files.list.responses[200].parse(await res.json());
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: InsertFile) => {
      const res = await fetch(api.files.upload.path, {
        method: api.files.upload.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.files.upload.responses[400].parse(await res.json());
          throw new Error(error.message || "Invalid file data");
        }
        throw new Error("Failed to upload file");
      }
      return api.files.upload.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
      toast({
        title: "File Published",
        description: "Your file is now live on your site.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.files.delete.path, { id });
      const res = await fetch(url, {
        method: api.files.delete.method,
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("File not found");
        throw new Error("Failed to delete file");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
      toast({
        title: "File Deleted",
        description: "The file has been permanently removed.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message,
      });
    },
  });

  return {
    files,
    isLoading,
    isError,
    uploadFile: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    deleteFile: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
