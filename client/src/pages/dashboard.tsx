import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFiles } from "@/hooks/use-files";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFileSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, FileCode, Plus, Trash2, ExternalLink, Code2 } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
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

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { files, isLoading: isFilesLoading, uploadFile, deleteFile, isUploading, isDeleting } = useFiles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [, setLocation] = useLocation();

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">
              Hello, <span className="text-primary">{user.username}</span>
            </h1>
            <p className="text-muted-foreground text-lg">Manage your site files and content.</p>
          </div>
          
          <div className="flex gap-4">
             <Button 
               variant="outline" 
               className="gap-2 h-11"
               onClick={() => window.open(`/${user.username}/index.html`, '_blank')}
             >
               <ExternalLink className="w-4 h-4" />
               View Site
             </Button>
            <CreateFileButton 
              isOpen={isDialogOpen} 
              onOpenChange={setIsDialogOpen} 
              onUpload={(data) => {
                uploadFile(data, { onSuccess: () => setIsDialogOpen(false) });
              }}
              isUploading={isUploading}
            />
          </div>
        </div>

        {isFilesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-secondary/30 animate-pulse" />
            ))}
          </div>
        ) : files?.length === 0 ? (
          <EmptyState onAction={() => setIsDialogOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {files?.map((file) => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  username={user.username}
                  onDelete={() => deleteFile(file.id)}
                  isDeleting={isDeleting}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}

function FileCard({ file, username, onDelete, isDeleting }: { file: any, username: string, onDelete: () => void, isDeleting: boolean }) {
  const isHtml = file.filename.endsWith('.html');
  const isCss = file.filename.endsWith('.css');
  const isJs = file.filename.endsWith('.js');
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-all border border-border/60 hover:border-primary/30 group">
        <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
          <div className="p-2.5 rounded-lg bg-secondary/50 text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {isHtml && <FileCode className="w-6 h-6" />}
            {isCss && <Code2 className="w-6 h-6" />}
            {isJs && <Code2 className="w-6 h-6" />}
            {!isHtml && !isCss && !isJs && <FileCode className="w-6 h-6" />}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
               <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive hover:bg-destructive/10">
                 <Trash2 className="w-4 h-4" />
               </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {file.filename}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your file.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent>
          <h3 className="font-bold text-lg mb-1 truncate" title={file.filename}>{file.filename}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Created {format(new Date(file.createdAt), 'MMM d, yyyy')}
          </p>
          <Button 
            variant="secondary" 
            className="w-full text-xs font-semibold h-9"
            onClick={() => window.open(`/${username}/${file.filename}`, '_blank')}
          >
            Open File <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/10">
      <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
        <FileCode className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">No files yet</h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        Your site is currently empty. Upload an index.html file to get started.
      </p>
      <Button onClick={onAction} size="lg" className="gap-2">
        <Plus className="w-5 h-5" />
        Create First File
      </Button>
    </div>
  );
}

function CreateFileButton({ isOpen, onOpenChange, onUpload, isUploading }: { 
  isOpen: boolean, 
  onOpenChange: (open: boolean) => void,
  onUpload: (data: z.infer<typeof insertFileSchema>) => void,
  isUploading: boolean
}) {
  const form = useForm<z.infer<typeof insertFileSchema>>({
    resolver: zodResolver(insertFileSchema),
    defaultValues: {
      filename: "",
      content: "",
      mimeType: "text/html",
    },
  });

  const onSubmit = (data: z.infer<typeof insertFileSchema>) => {
    // Basic mime type detection based on extension
    let mimeType = "text/plain";
    if (data.filename.endsWith(".html")) mimeType = "text/html";
    else if (data.filename.endsWith(".css")) mimeType = "text/css";
    else if (data.filename.endsWith(".js")) mimeType = "application/javascript";
    
    onUpload({ ...data, mimeType });
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 retro-shadow retro-shadow-hover transition-all">
          <Plus className="w-5 h-5" />
          New File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
          <DialogDescription>
            Add a new file to your site. Use .html, .css, or .js extensions.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <FormField
              control={form.control}
              name="filename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filename</FormLabel>
                  <FormControl>
                    <Input placeholder="index.html" {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Code</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="<html><body><h1>Hello World</h1></body></html>" 
                      className="font-mono min-h-[300px] text-sm leading-relaxed" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isUploading} className="w-full sm:w-auto">
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Publish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
