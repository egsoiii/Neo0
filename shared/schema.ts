import { z } from "zod";

// Validation schemas
export const insertUserSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
});

export const insertFolderSchema = z.object({
  name: z.string().min(1),
  parentFolderId: z.string().optional(),
});

export const insertFileSchema = z.object({
  filename: z.string().min(1),
  content: z.string(),
  mimeType: z.string(),
  folderId: z.string().optional(),
});

export const updateFileSchema = z.object({
  filename: z.string().optional(),
  content: z.string().optional(),
  mimeType: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const changeUsernameSchema = z.object({
  newUsername: z.string().min(3).max(20),
});

// Type definitions for MongoDB documents
export type User = {
  _id: string;
  username: string;
  password: string;
};

export type InsertUser = z.infer<typeof insertUserSchema>;

export type Folder = {
  _id: string;
  userId: string;
  name: string;
  parentFolderId?: string;
  createdAt: Date;
};

export type InsertFolder = z.infer<typeof insertFolderSchema>;

export type File = {
  _id: string;
  userId: string;
  folderId?: string;
  filename: string;
  content: string;
  mimeType: string;
  createdAt: Date;
};

export type InsertFile = z.infer<typeof insertFileSchema>;
export type UpdateFile = z.infer<typeof updateFileSchema>;
export type FileResponse = Omit<File, "content">;
