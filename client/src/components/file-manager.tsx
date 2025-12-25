import { useState } from "react";
import { useFolders } from "@/hooks/use-folders";
import { useFiles } from "@/hooks/use-files";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Folder, File, Plus, Trash2, Edit2, Loader2, FolderOpen } from "lucide-react";
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
  const { user } = useAuth();
  const { folders, isLoading: isFoldersLoading, createFolder, isCreating, renameFolder, isRenaming, deleteFolder, isDeleting } = useFolders();
  const { files, isLoading: isFilesLoading, editFile, isEditing, deleteFile: deleteFileAction, uploadFile, isUploading } = useFiles();
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [renameState, setRenameState] = useState<RenameState | null>(null);
  const [renameName, setRenameName] = useState("");

  const handleCreateFile = () => {
    if (newFileName.trim() && newFileContent.trim()) {
      uploadFile({ filename: newFileName, content: newFileContent, mimeType: "text/html" }, {
        onSuccess: () => {
          setNewFileName("");
          setNewFileContent("");
          setIsCreateFileOpen(false);
        },
      });
    }
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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-8">Home</h1>
        
        <div className="flex flex-wrap gap-4 mb-12">
          <Dialog open={isCreateFileOpen} onOpenChange={setIsCreateFileOpen}>
            <Button onClick={() => setIsCreateFileOpen(true)} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-6 text-lg font-semibold" data-testid="button-new-file">
              <Plus className="w-5 h-5 mr-2" />
              New File
            </Button>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
                <DialogDescription>Enter a filename and content for your new file.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Filename (e.g., index.html)"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  data-testid="input-new-filename"
                />
                <Textarea
                  placeholder="File content"
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  data-testid="textarea-file-content"
                  className="min-h-32"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateFileOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateFile} disabled={isUploading || !newFileName.trim() || !newFileContent.trim()}>
                  {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <Button onClick={() => setIsCreateFolderOpen(true)} className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-6 text-lg font-semibold" data-testid="button-new-folder">
              <FolderOpen className="w-5 h-5 mr-2" />
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

          <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-6 text-lg font-semibold" data-testid="button-upload">
            <Plus className="w-5 h-5 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (folders?.length === 0 && filesInRoot.length === 0) ? (
        <p className="text-muted-foreground py-12 text-center text-lg">No files or folders yet. Create one to get started!</p>
      ) : (
        <div className="space-y-3">
          {folders?.map((folder) => (
            <div key={`folder-${folder.id}`} className="flex items-center justify-between gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors group" data-testid={`item-folder-${folder.id}`}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Folder className="w-8 h-8 text-amber-500 flex-shrink-0" />
                <span className="font-semibold text-gray-700 text-lg truncate" data-testid={`text-folder-name-${folder.id}`}>{folder.name}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setRenameState({ type: "folder", id: folder.id, currentName: folder.name });
                    setRenameName(folder.name);
                  }}
                  className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 text-sm"
                  data-testid={`button-rename-folder-${folder.id}`}
                >
                  <Edit2 className="w-4 h-4" />
                  Rename
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 text-sm" data-testid={`button-delete-folder-${folder.id}`}>
                      <Trash2 className="w-4 h-4" />
                      Delete
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
            <div key={`file-${file.id}`} className="flex items-center justify-between gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors group" data-testid={`item-file-${file.id}`}>
              <div 
                className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer hover:opacity-75"
                onClick={() => user && window.open(`/${user.username}/${file.filename}`, '_blank')}
              >
                <File className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <span className="font-semibold text-gray-700 text-lg truncate" data-testid={`text-file-name-${file.id}`}>{file.filename}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setRenameState({ type: "file", id: file.id, currentName: file.filename });
                    setRenameName(file.filename);
                  }}
                  className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 text-sm"
                  data-testid={`button-rename-file-${file.id}`}
                >
                  <Edit2 className="w-4 h-4" />
                  Rename
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 text-sm" data-testid={`button-delete-file-${file.id}`}>
                      <Trash2 className="w-4 h-4" />
                      Delete
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
            </div>
          ))}
        </div>
      )}

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
