import type { Handler } from "@netlify/functions";
import { storage } from "../../server/storage";
import { hashPassword, comparePasswords, createToken, verifyToken } from "../../server/jwt";
import { api } from "../../shared/routes";
import { z } from "zod";

const getAuth = (event: any): { id: string; username: string } | null => {
  const auth = event.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyToken(auth.slice(7));
};

const sendJson = (status: number, body: any) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path.replace("/.netlify/functions/api", "");
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    // === Auth Routes ===
    if (method === "POST" && path === "/register") {
      const { username, password } = body;
      if (!username || !password) return sendJson(400, { message: "Username and password required" });
      
      const existing = await storage.getUserByUsername(username);
      if (existing) return sendJson(400, { message: "Username already exists" });
      
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({ username, password: hashedPassword });
      const token = createToken(user);
      
      return sendJson(201, { ...user, token });
    }

    if (method === "POST" && path === "/login") {
      const { username, password } = body;
      if (!username || !password) return sendJson(400, { message: "Username and password required" });
      
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return sendJson(401, { message: "Invalid credentials" });
      }
      
      const token = createToken(user);
      return sendJson(200, { ...user, token });
    }

    if (method === "POST" && path === "/logout") {
      return sendJson(200, { message: "Logged out" });
    }

    if (method === "GET" && path === "/user") {
      const auth = getAuth(event);
      if (!auth) return sendJson(401, { message: "Unauthorized" });
      const user = await storage.getUser(auth.id);
      if (!user) return sendJson(401, { message: "User not found" });
      return sendJson(200, user);
    }

    // === Folder Routes ===
    if (method === "GET" && path === "/folders") {
      const auth = getAuth(event);
      if (!auth) return sendJson(401, { message: "Unauthorized" });
      const folders = await storage.getFolders(auth.id);
      return sendJson(200, folders);
    }

    if (method === "POST" && path === "/folders") {
      const auth = getAuth(event);
      if (!auth) return sendJson(401, { message: "Unauthorized" });
      const { name, parentFolderId } = body;
      if (!name) return sendJson(400, { message: "Folder name required" });
      const folder = await storage.createFolder(auth.id, { name, parentFolderId });
      return sendJson(201, folder);
    }

    if (method === "PATCH" && path.startsWith("/folders/")) {
      const auth = getAuth(event);
      if (!auth) return sendJson(401, { message: "Unauthorized" });
      const id = parseInt(path.split("/")[2]);
      const { name } = body;
      if (!name) return sendJson(400, { message: "Folder name required" });
      const folder = await storage.renameFolder(id, auth.id, name);
      return sendJson(200, folder);
    }

    if (method === "DELETE" && path.startsWith("/folders/")) {
      const auth = getAuth(event);
      if (!auth) return sendJson(401, { message: "Unauthorized" });
      const id = parseInt(path.split("/")[2]);
      await storage.deleteFolder(id, auth.id);
      return { statusCode: 204, body: "" };
    }

    // === File Routes ===
    if (method === "GET" && path === "/files") {
      const auth = getAuth(event);
      if (!auth) return sendJson(401, { message: "Unauthorized" });
      const files = await storage.getFiles(auth.id);
      return sendJson(200, files);
    }

    if (method === "GET" && path.startsWith("/files/")) {
      const auth = getAuth(event);
      if (!auth) return sendJson(401, { message: "Unauthorized" });
      const id = parseInt(path.split("/")[2]);
      const file = await storage.getFile(id, auth.id);
      if (!file) return sendJson(404, { message: "File not found" });
      return sendJson(200, file);
    }

    if (method === "POST" && path === "/files") {
      const auth = getAuth(event);
      if (!auth) return sendJson(401, { message: "Unauthorized" });
      const { filename, content, mimeType, folderId } = body;
      if (!filename || !content) return sendJson(400, { message: "Filename and content required" });
      if (filename.includes("/") || filename.includes("..")) return sendJson(400, { message: "Invalid filename" });
      const file = await storage.createFile(auth.id, { filename, content, mimeType, folderId });
      return sendJson(201, file);
    }

    if (method === "PUT" && path.startsWith("/files/")) {
      const auth = getAuth(event);
      if (!auth) return sendJson(401, { message: "Unauthorized" });
      const id = parseInt(path.split("/")[2]);
      const { filename, content } = body;
      if (filename && (filename.includes("/") || filename.includes(".."))) {
        return sendJson(400, { message: "Invalid filename" });
      }
      const file = await storage.updateFile(id, auth.id, { filename, content });
      return sendJson(200, file);
    }

    if (method === "DELETE" && path.startsWith("/files/")) {
      const auth = getAuth(event);
      if (!auth) return sendJson(401, { message: "Unauthorized" });
      const id = parseInt(path.split("/")[2]);
      await storage.deleteFile(id, auth.id);
      return { statusCode: 204, body: "" };
    }

    // === Account Routes ===
    if (method === "PATCH" && path === "/user/password") {
      const auth = getAuth(event);
      if (!auth) return sendJson(401, { message: "Unauthorized" });
      const { currentPassword, newPassword } = body;
      const user = await storage.getUser(auth.id);
      if (!user || !(await comparePasswords(currentPassword, user.password))) {
        return sendJson(400, { message: "Current password is incorrect" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(auth.id, hashedPassword);
      return sendJson(200, { message: "Password changed" });
    }

    if (method === "PATCH" && path === "/user/username") {
      const auth = getAuth(event);
      if (!auth) return sendJson(401, { message: "Unauthorized" });
      const { newUsername } = body;
      const existing = await storage.getUserByUsername(newUsername);
      if (existing) return sendJson(400, { message: "Username already taken" });
      const user = await storage.updateUserUsername(auth.id, newUsername);
      return sendJson(200, user);
    }

    return sendJson(404, { message: "Not found" });
  } catch (err) {
    console.error(err);
    return sendJson(500, { message: "Internal server error" });
  }
};
