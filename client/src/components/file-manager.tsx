import { useState } from "react";
import { useFolders } from "@/hooks/use-folders";
import { useFiles } from "@/hooks/use-files";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, File, Plus, Trash2, Edit2, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RenameState {
  type: "file" | "folder";
  id: number;
  currentName: string;
}

export function FileManager() {
  const { folders, isLoading: isFoldersLoading, createFolder, isCreating, renameFolder, isRenaming, deleteFolder, isDeleting } = useFolders();
  const { files, isLoading: isFilesLoading, editFile, isEditing, deleteFile: deleteFileAction } = useFiles();
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameState, setRenameState] = useState<RenameState | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [renameName, setRenameName] = useState("");

  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder({ name: newFolderName }, {
        onSuccess: () => {
          setNewFolderName("");
          setIsCreateFolderOpen(false);
        },
      });
    }
  };

  const handleRename = () => {
    if (renameName.trim() && renameState) {
      if (renameState.type === "folder") {
        renameFolder({ id: renameState.id, name: renameName }, {
          onSuccess: () => {
            setRenameState(null);
            setRenameName("");
          },
        });
      } else {
        editFile({ id: renameState.id, data: { filename: renameName } }, {
          onSuccess: () => {
            setRenameState(null);
            setRenameName("");
          },
        });
      }
    }
  };

  const isLoading = isFoldersLoading || isFilesLoading;
  const filesInRoot = files?.filter(f => !f.folderId) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">File Manager</h2>
        <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
          <Button onClick={() => setIsCreateFolderOpen(true)} className="gap-2" data-testid="button-create-folder">
            <Plus className="w-4 h-4" />
            New Folder
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>Enter a name for your new folder.</DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              data-testid="input-folder-name"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
              }}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateFolder} disabled={isCreating || !newFolderName.trim()}>
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Files and Folders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (folders?.length === 0 && filesInRoot.length === 0) ? (
            <p className="text-muted-foreground py-8 text-center">No files or folders yet. Create one to get started!</p>
          ) : (
            <div className="space-y-1">
              {folders?.map((folder) => (
                <div key={`folder-${folder.id}`}>
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50 group" data-testid={`item-folder-${folder.id}`}>
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="p-1 hover:bg-secondary"
                      data-testid={`button-expand-folder-${folder.id}`}
                    >
                      {expandedFolders.has(folder.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <Folder className="w-4 h-4 text-amber-500" />
                    <span className="flex-1 text-sm" data-testid={`text-folder-name-${folder.id}`}>{folder.name}</span>
                    <button
                      onClick={() => {
                        setRenameState({ type: "folder", id: folder.id, currentName: folder.name });
                        setRenameName(folder.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary transition-opacity"
                      data-testid={`button-rename-folder-${folder.id}`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                          data-testid={`button-delete-folder-${folder.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{folder.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteFolder(folder.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                          >
                            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              {filesInRoot.map((file) => (
                <div key={`file-${file.id}`} className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50 group ml-6" data-testid={`item-file-${file.id}`}>
                  <File className="w-4 h-4 text-blue-500" />
                  <span className="flex-1 text-sm" data-testid={`text-file-name-${file.id}`}>{file.filename}</span>
                  <button
                    onClick={() => {
                      setRenameState({ type: "file", id: file.id, currentName: file.filename });
                      setRenameName(file.filename);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary transition-opacity"
                    data-testid={`button-rename-file-${file.id}`}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                        data-testid={`button-delete-file-${file.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete File</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{file.filename}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteFileAction(file.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={renameState !== null} onOpenChange={(open) => !open && setRenameState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Rename {renameState?.type === "folder" ? "Folder" : "File"}
            </DialogTitle>
            <DialogDescription>
              Enter a new name for "{renameState?.currentName}".
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            data-testid="input-rename-name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setRenameState(null);
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameState(null)}>Cancel</Button>
            <Button onClick={handleRename} disabled={(isRenaming || isEditing) || !renameName.trim()}>
              {(isRenaming || isEditing) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
