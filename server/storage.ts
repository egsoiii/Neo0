import { db } from "./db";
import { users, files, type User, type InsertUser, type File, type InsertFile } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // File operations
  getFiles(userId: number): Promise<File[]>;
  getFile(userId: number, filename: string): Promise<File | undefined>;
  createFile(userId: number, file: InsertFile): Promise<File>;
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

  async getFiles(userId: number): Promise<File[]> {
    // Only select metadata, not full content for list
    return await db.select().from(files).where(eq(files.userId, userId));
  }

  async getFile(userId: number, filename: string): Promise<File | undefined> {
    const [file] = await db.select()
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.filename, filename)
        )
      );
    return file;
  }

  async createFile(userId: number, insertFile: InsertFile): Promise<File> {
    // Check if file exists and update it, or insert new
    const existing = await this.getFile(userId, insertFile.filename);
    
    if (existing) {
      const [updated] = await db.update(files)
        .set({ ...insertFile, createdAt: new Date() })
        .where(eq(files.id, existing.id))
        .returning();
      return updated;
    }

    const [file] = await db.insert(files)
      .values({ ...insertFile, userId })
      .returning();
    return file;
  }

  async deleteFile(id: number, userId: number): Promise<void> {
    await db.delete(files).where(
      and(
        eq(files.id, id),
        eq(files.userId, userId)
      )
    );
  }
}

export const storage = new DatabaseStorage();
