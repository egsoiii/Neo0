import { db } from "./db";
import { users, files, folders, type User, type InsertUser, type File, type InsertFile, type UpdateFile, type Folder, type InsertFolder } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, newPassword: string): Promise<User>;
  updateUserUsername(id: number, newUsername: string): Promise<User>;

  // Folder operations
  getFolders(userId: number): Promise<Folder[]>;
  createFolder(userId: number, folder: InsertFolder): Promise<Folder>;
  deleteFolder(id: number, userId: number): Promise<void>;
  renameFolder(id: number, userId: number, name: string): Promise<Folder>;

  // File operations
  getFiles(userId: number): Promise<File[]>;
  getFile(id: number, userId: number): Promise<File | undefined>;
  getFileByPath(userId: number, filename: string): Promise<File | undefined>;
  getFileByFolderAndPath(userId: number, folderName: string, filename: string): Promise<File | undefined>;
  createFile(userId: number, file: InsertFile): Promise<File>;
  updateFile(id: number, userId: number, updates: UpdateFile): Promise<File>;
  deleteFile(id: number, userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPassword(id: number, newPassword: string): Promise<User> {
    const [user] = await db.update(users).set({ password: newPassword }).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserUsername(id: number, newUsername: string): Promise<User> {
    const [user] = await db.update(users).set({ username: newUsername }).where(eq(users.id, id)).returning();
    return user;
  }

  async getFolders(userId: number): Promise<Folder[]> {
    return await db.select().from(folders).where(eq(folders.userId, userId));
  }

  async createFolder(userId: number, insertFolder: InsertFolder): Promise<Folder> {
    const [folder] = await db.insert(folders).values({ ...insertFolder, userId }).returning();
    return folder;
  }

  async deleteFolder(id: number, userId: number): Promise<void> {
    await db.delete(folders).where(and(eq(folders.id, id), eq(folders.userId, userId)));
  }

  async renameFolder(id: number, userId: number, name: string): Promise<Folder> {
    const [folder] = await db.update(folders).set({ name }).where(and(eq(folders.id, id), eq(folders.userId, userId))).returning();
    return folder;
  }

  async getFiles(userId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.userId, userId));
  }

  async getFile(id: number, userId: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(and(eq(files.id, id), eq(files.userId, userId)));
    return file;
  }

  async getFileByPath(userId: number, filename: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(and(eq(files.userId, userId), eq(files.filename, filename), eq(files.folderId, null)));
    return file;
  }

  async getFileByFolderAndPath(userId: number, folderName: string, filename: string): Promise<File | undefined> {
    const folder = await db.select().from(folders).where(and(eq(folders.userId, userId), eq(folders.name, folderName)));
    if (!folder || folder.length === 0) return undefined;
    const [file] = await db.select().from(files).where(and(eq(files.userId, userId), eq(files.filename, filename), eq(files.folderId, folder[0].id)));
    return file;
  }

  async createFile(userId: number, insertFile: InsertFile): Promise<File> {
    const existing = await this.getFileByPath(userId, insertFile.filename);
    if (existing) {
      const [updated] = await db.update(files).set({ ...insertFile, createdAt: new Date() }).where(eq(files.id, existing.id)).returning();
      return updated;
    }
    const [file] = await db.insert(files).values({ ...insertFile, userId }).returning();
    return file;
  }

  async updateFile(id: number, userId: number, updates: UpdateFile): Promise<File> {
    const [file] = await db.update(files).set(updates).where(and(eq(files.id, id), eq(files.userId, userId))).returning();
    return file;
  }

  async deleteFile(id: number, userId: number): Promise<void> {
    await db.delete(files).where(and(eq(files.id, id), eq(files.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
