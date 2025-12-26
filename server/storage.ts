import { UserModel, FolderModel, FileModel } from "./db";
import type { User, InsertUser, File, InsertFile, UpdateFile, Folder, InsertFolder } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: string, newPassword: string): Promise<User>;
  updateUserUsername(id: string, newUsername: string): Promise<User>;

  // Folder operations
  getFolders(userId: string): Promise<Folder[]>;
  createFolder(userId: string, folder: InsertFolder): Promise<Folder>;
  deleteFolder(id: string, userId: string): Promise<void>;
  renameFolder(id: string, userId: string, name: string): Promise<Folder>;

  // File operations
  getFiles(userId: string): Promise<File[]>;
  getFile(id: string, userId: string): Promise<File | undefined>;
  getFileByPath(userId: string, filename: string): Promise<File | undefined>;
  getFileByFolderAndPath(userId: string, folderName: string, filename: string): Promise<File | undefined>;
  createFile(userId: string, file: InsertFile): Promise<File>;
  updateFile(id: string, userId: string, updates: UpdateFile): Promise<File>;
  deleteFile(id: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user ? { _id: user._id.toString(), username: user.username, password: user.password } : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username });
    return user ? { _id: user._id.toString(), username: user.username, password: user.password } : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create(insertUser);
    return { _id: user._id.toString(), username: user.username, password: user.password };
  }

  async updateUserPassword(id: string, newPassword: string): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(id, { password: newPassword }, { new: true });
    if (!user) throw new Error("User not found");
    return { _id: user._id.toString(), username: user.username, password: user.password };
  }

  async updateUserUsername(id: string, newUsername: string): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(id, { username: newUsername }, { new: true });
    if (!user) throw new Error("User not found");
    return { _id: user._id.toString(), username: user.username, password: user.password };
  }

  async getFolders(userId: string): Promise<Folder[]> {
    const folders = await FolderModel.find({ userId });
    return folders.map(f => ({
      _id: f._id.toString(),
      userId: f.userId,
      name: f.name,
      parentFolderId: f.parentFolderId,
      createdAt: f.createdAt,
    }));
  }

  async createFolder(userId: string, insertFolder: InsertFolder): Promise<Folder> {
    const folder = await FolderModel.create({ userId, ...insertFolder });
    return {
      _id: folder._id.toString(),
      userId: folder.userId,
      name: folder.name,
      parentFolderId: folder.parentFolderId,
      createdAt: folder.createdAt,
    };
  }

  async deleteFolder(id: string, userId: string): Promise<void> {
    await FolderModel.deleteOne({ _id: id, userId });
  }

  async renameFolder(id: string, userId: string, name: string): Promise<Folder> {
    const folder = await FolderModel.findByIdAndUpdate({ _id: id, userId }, { name }, { new: true });
    if (!folder) throw new Error("Folder not found");
    return {
      _id: folder._id.toString(),
      userId: folder.userId,
      name: folder.name,
      parentFolderId: folder.parentFolderId,
      createdAt: folder.createdAt,
    };
  }

  async getFiles(userId: string): Promise<File[]> {
    const files = await FileModel.find({ userId });
    return files.map(f => ({
      _id: f._id.toString(),
      userId: f.userId,
      folderId: f.folderId,
      filename: f.filename,
      content: f.content,
      mimeType: f.mimeType,
      createdAt: f.createdAt,
    }));
  }

  async getFile(id: string, userId: string): Promise<File | undefined> {
    const file = await FileModel.findOne({ _id: id, userId });
    return file ? {
      _id: file._id.toString(),
      userId: file.userId,
      folderId: file.folderId,
      filename: file.filename,
      content: file.content,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
    } : undefined;
  }

  async getFileByPath(userId: string, filename: string): Promise<File | undefined> {
    const file = await FileModel.findOne({ userId, filename, folderId: { $eq: null } });
    return file ? {
      _id: file._id.toString(),
      userId: file.userId,
      folderId: file.folderId,
      filename: file.filename,
      content: file.content,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
    } : undefined;
  }

  async getFileByFolderAndPath(userId: string, folderName: string, filename: string): Promise<File | undefined> {
    const folder = await FolderModel.findOne({ userId, name: folderName });
    if (!folder) return undefined;
    const file = await FileModel.findOne({ userId, filename, folderId: folder._id.toString() });
    return file ? {
      _id: file._id.toString(),
      userId: file.userId,
      folderId: file.folderId,
      filename: file.filename,
      content: file.content,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
    } : undefined;
  }

  async createFile(userId: string, insertFile: InsertFile): Promise<File> {
    const existing = await FileModel.findOne({ userId, filename: insertFile.filename });
    if (existing) {
      const updated = await FileModel.findByIdAndUpdate(
        existing._id,
        { content: insertFile.content, mimeType: insertFile.mimeType, createdAt: new Date() },
        { new: true }
      );
      if (!updated) throw new Error("File not found");
      return {
        _id: updated._id.toString(),
        userId: updated.userId,
        folderId: updated.folderId,
        filename: updated.filename,
        content: updated.content,
        mimeType: updated.mimeType,
        createdAt: updated.createdAt,
      };
    }
    const file = await FileModel.create({ userId, ...insertFile });
    return {
      _id: file._id.toString(),
      userId: file.userId,
      folderId: file.folderId,
      filename: file.filename,
      content: file.content,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
    };
  }

  async updateFile(id: string, userId: string, updates: UpdateFile): Promise<File> {
    const file = await FileModel.findByIdAndUpdate({ _id: id, userId }, updates, { new: true });
    if (!file) throw new Error("File not found");
    return {
      _id: file._id.toString(),
      userId: file.userId,
      folderId: file.folderId,
      filename: file.filename,
      content: file.content,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
    };
  }

  async deleteFile(id: string, userId: string): Promise<void> {
    await FileModel.deleteOne({ _id: id, userId });
  }
}

export const storage = new DatabaseStorage();
