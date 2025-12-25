import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // === Account Management ===
  app.patch(api.account.changePassword.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.account.changePassword.input.parse(req.body);
      const user = await storage.getUser(req.user!.id);
      if (!user) return res.sendStatus(401);

      // Verify current password
      const passwordMatches = await comparePasswords(input.currentPassword, user.password);
      if (!passwordMatches) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await hashPassword(input.newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);
      res.json({ message: "Password changed successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.account.changeUsername.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.account.changeUsername.input.parse(req.body);
      const existingUser = await storage.getUserByUsername(input.newUsername);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const updatedUser = await storage.updateUserUsername(req.user!.id, input.newUsername);
      res.json(updatedUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === Folder Management ===
  app.get(api.folders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userFolders = await storage.getFolders(req.user!.id);
    res.json(userFolders);
  });

  app.post(api.folders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.folders.create.input.parse(req.body);
      const folder = await storage.createFolder(req.user!.id, input);
      res.status(201).json(folder);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.folders.rename.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.folders.rename.input.parse(req.body);
      const folderId = parseInt(req.params.id);
      const folder = await storage.renameFolder(folderId, req.user!.id, input.name);
      res.json(folder);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.folders.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const folderId = parseInt(req.params.id);
    await storage.deleteFolder(folderId, req.user!.id);
    res.sendStatus(204);
  });

  // === File Management ===
  app.get(api.files.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userFiles = await storage.getFiles(req.user!.id);
    res.json(userFiles);
  });

  app.get(api.files.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const fileId = parseInt(req.params.id);
    const file = await storage.getFile(fileId, req.user!.id);
    if (!file) return res.sendStatus(404);
    res.json(file);
  });

  app.post(api.files.upload.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.files.upload.input.parse(req.body);
      if (input.filename.includes("/") || input.filename.includes("..")) {
        return res.status(400).json({ message: "Invalid filename" });
      }
      const file = await storage.createFile(req.user!.id, input);
      res.status(201).json(file);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.files.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const fileId = parseInt(req.params.id);
      const input = api.files.update.input.parse(req.body);
      
      if (input.filename && (input.filename.includes("/") || input.filename.includes(".."))) {
        return res.status(400).json({ message: "Invalid filename" });
      }

      const file = await storage.updateFile(fileId, req.user!.id, input);
      res.json(file);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.files.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const fileId = parseInt(req.params.id);
    await storage.deleteFile(fileId, req.user!.id);
    res.sendStatus(204);
  });

  // === Public File Serving ===
  app.get("/:username/:folder/:filename", async (req, res, next) => {
    const { username, folder, filename } = req.params;
    if (username === "api" || username === "assets") return next();

    const user = await storage.getUserByUsername(username);
    if (!user) return next();

    const file = await storage.getFileByFolderAndPath(user.id, folder, filename);
    if (!file) return next();

    res.setHeader("Content-Type", file.mimeType);
    res.send(file.content);
  });

  app.get("/:username/:filename", async (req, res, next) => {
    const { username, filename } = req.params;
    if (username === "api" || username === "assets") return next();

    const user = await storage.getUserByUsername(username);
    if (!user) return next();

    const file = await storage.getFileByPath(user.id, filename);
    if (!file) return next();

    res.setHeader("Content-Type", file.mimeType);
    res.send(file.content);
  });

  app.get("/:username", async (req, res, next) => {
    const { username } = req.params;
    if (username === "api" || username === "assets") return next();

    const user = await storage.getUserByUsername(username);
    if (!user) return next();

    const file = await storage.getFileByPath(user.id, "index.html");
    if (!file) return next();

    res.setHeader("Content-Type", "text/html");
    res.send(file.content);
  });

  return httpServer;
}
