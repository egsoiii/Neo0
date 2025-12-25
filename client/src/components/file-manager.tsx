import { useState, useRef } from "react";
import { useFolders } from "@/hooks/use-folders";
import { useFiles } from "@/hooks/use-files";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Folder, File, Plus, Trash2, Edit2, Loader2, Upload, ChevronLeft, PencilLine } from "lucide-react";
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

interface EditFileState {
  id: number;
  filename: string;
  content: string;
}

export function FileManager() {
  const { user } = useAuth();
  const { folders, createFolder, isCreating, renameFolder, isRenaming, deleteFolder, isDeleting } = useFolders();
  const { files, editFile, isEditing, deleteFile: deleteFileAction, uploadFile, isUploading } = useFiles();
  
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isEditFileOpen, setIsEditFileOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [renameState, setRenameState] = useState<RenameState | null>(null);
  const [renameName, setRenameName] = useState("");
  const [editFileState, setEditFileState] = useState<EditFileState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFolderData = currentFolderId ? folders?.find(f => f.id === currentFolderId) : null;

  const handleCreateFile = () => {
    if (newFileName.trim() && newFileContent.trim()) {
      uploadFile({ 
        filename: newFileName, 
        content: newFileContent, 
        mimeType: "text/html",
        folderId: currentFolderId || undefined
      }, {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        uploadFile({ 
          filename: file.name, 
          content, 
          mimeType: file.type || "text/html",
          folderId: currentFolderId || undefined
        }, {
          onSuccess: () => {
            if (fileInputRef.current) fileInputRef.current.value = "";
          },
        });
      };
      reader.readAsText(file);
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

  const handleEditFile = () => {
    if (editFileState && editFileState.content.trim()) {
      editFile({ id: editFileState.id, data: { content: editFileState.content } }, {
        onSuccess: () => {
          setEditFileState(null);
          setIsEditFileOpen(false);
        },
      });
    }
  };

  const filesInCurrentFolder = currentFolderId 
    ? files?.filter(f => f.folderId === currentFolderId) || []
    : files?.filter(f => !f.folderId) || [];

  const foldersDisplay = folders || [];

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Home</h1>
          {currentFolderData && (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">{currentFolderData.name}</span>
            </div>
          )}
        </div>
        {currentFolderId && (
          <button
            onClick={() => setCurrentFolderId(null)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30"
            data-testid="button-back-folder"
          >
            Back to Home
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Dialog open={isCreateFileOpen} onOpenChange={setIsCreateFileOpen}>
          <Button 
            onClick={() => setIsCreateFileOpen(true)} 
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white"
            data-testid="button-new-file"
          >
            <Plus className="w-4 h-4 mr-1" />
            New File
          </Button>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New File</DialogTitle>
              <DialogDescription>
                {currentFolderData 
                  ? `Creating file in folder "${currentFolderData.name}"`
                  : "Enter a filename and content for your new file."
                }
              </DialogDescription>
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
                className="min-h-40"
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
          <Button 
            onClick={() => setIsCreateFolderOpen(true)} 
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white"
            data-testid="button-new-folder"
          >
            <Plus className="w-4 h-4 mr-1" />
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

        <Button 
          onClick={() => fileInputRef.current?.click()}
          size="sm"
          className="bg-red-500 hover:bg-red-600 text-white"
          disabled={isUploading}
          data-testid="button-upload"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </>
          )}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          data-testid="input-file-upload"
          accept=".html,.css,.js,.txt,.md"
        />
      </div>

      {files && folders !== undefined ? (
        filesInCurrentFolder.length === 0 && (!currentFolderId && foldersDisplay.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-base">No files or folders yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-2 w-full">
            {!currentFolderId && foldersDisplay.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Folders</h2>
                <div className="space-y-2">
                  {foldersDisplay.map((folder) => (
                    <div 
                      key={`folder-${folder.id}`} 
                      className="flex items-center justify-between gap-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors border border-amber-200/50 dark:border-amber-900/30" 
                      data-testid={`item-folder-${folder.id}`}
                    >
                      <button
                        onClick={() => setCurrentFolderId(folder.id)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80"
                      >
                        <Folder className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                        <span className="font-medium text-gray-800 dark:text-gray-200 truncate text-sm" data-testid={`text-folder-name-${folder.id}`}>{folder.name}</span>
                      </button>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setRenameState({ type: "folder", id: folder.id, currentName: folder.name });
                            setRenameName(folder.name);
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                          data-testid={`button-rename-folder-${folder.id}`}
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30" data-testid={`button-delete-folder-${folder.id}`}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{folder.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteFolder(folder.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={isDeleting}
                              >
                                {isDeleting && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filesInCurrentFolder.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Files</h2>
                <div className="space-y-2">
                  {filesInCurrentFolder.map((file) => (
                    <div 
                      key={`file-${file.id}`} 
                      className="flex items-center justify-between gap-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors border border-blue-200/50 dark:border-blue-900/30" 
                      data-testid={`item-file-${file.id}`}
                    >
                      <button
                        onClick={() => user && window.open(`/${user.username}/${file.filename}`, '_blank')}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80"
                      >
                        <File className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                        <span className="font-medium text-gray-800 dark:text-gray-200 truncate text-sm" data-testid={`text-file-name-${file.id}`}>{file.filename}</span>
                      </button>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditFileState({ id: file.id, filename: file.filename, content: file.content });
                            setIsEditFileOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                          data-testid={`button-edit-file-${file.id}`}
                          title="Edit Content"
                        >
                          <PencilLine className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            setRenameState({ type: "file", id: file.id, currentName: file.filename });
                            setRenameName(file.filename);
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                          data-testid={`button-rename-file-${file.id}`}
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30" data-testid={`button-delete-file-${file.id}`}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete File</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{file.filename}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteFileAction(file.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={isDeleting}
                              >
                                {isDeleting && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filesInCurrentFolder.length === 0 && currentFolderId && (
              <p className="text-muted-foreground text-sm py-6 text-center">No files in this folder yet.</p>
            )}
          </div>
        )
      ) : (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      <Dialog open={isEditFileOpen} onOpenChange={setIsEditFileOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit File Content</DialogTitle>
            <DialogDescription>Editing: <span className="font-semibold">{editFileState?.filename}</span></DialogDescription>
          </DialogHeader>
          {editFileState && (
            <Textarea
              value={editFileState.content}
              onChange={(e) => setEditFileState({ ...editFileState, content: e.target.value })}
              data-testid="textarea-edit-content"
              className="font-mono min-h-80 text-xs"
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFileOpen(false)}>Cancel</Button>
            <Button onClick={handleEditFile} disabled={isEditing || !editFileState?.content.trim()}>
              {isEditing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
