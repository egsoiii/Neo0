import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // === File Management API ===
  
  // List files
  app.get(api.files.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const files = await storage.getFiles(req.user!.id);
    res.json(files);
  });

  // Upload/Create file
  app.post(api.files.upload.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const input = api.files.upload.input.parse(req.body);
      
      // Basic security checks
      if (input.filename.includes("/") || input.filename.includes("..")) {
        return res.status(400).json({ message: "Invalid filename" });
      }
      
      const file = await storage.createFile(req.user!.id, input);
      res.status(201).json(file);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Delete file
  app.delete(api.files.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    await storage.deleteFile(id, req.user!.id);
    res.sendStatus(204);
  });

  // === Public File Serving ===
  // Serve user files at /:username/:filename
  app.get("/:username/:filename", async (req, res, next) => {
    const { username, filename } = req.params;
    
    // Skip API routes and static assets
    if (username === "api" || username === "assets") return next();

    const user = await storage.getUserByUsername(username);
    if (!user) return next();

    const file = await storage.getFile(user.id, filename);
    if (!file) {
      // Try index.html if just username? No, express route is /:username/:filename
      // User might request /alice/ which maps to filename="" - maybe handle that?
      return next(); 
    }

    res.setHeader("Content-Type", file.mimeType);
    res.send(file.content);
  });

  // Handle root directory for user? 
  // e.g. /alice -> /alice/index.html
  app.get("/:username", async (req, res, next) => {
    const { username } = req.params;
    if (username === "api" || username === "assets") return next();

    const user = await storage.getUserByUsername(username);
    if (!user) return next();

    const file = await storage.getFile(user.id, "index.html");
    if (!file) return next(); // Fallback to 404/app

    res.setHeader("Content-Type", "text/html");
    res.send(file.content);
  });

  // Seed data - Removed to prevent startup crash and let users sign up naturally
  // if (await storage.getUserByUsername("alice") === undefined) { ... }

  return httpServer;
}
