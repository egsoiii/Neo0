import type { Handler } from "@netlify/functions";
import { storage } from "../../server/storage";

export const handler: Handler = async (event) => {
  const path = event.path.replace("/.netlify/functions/file", "");
  const segments = path.split("/").filter(Boolean);
  
  try {
    // Serve public files - no auth required for public file access
    if (segments.length === 2) {
      // /:username/:filename
      const [username, filename] = segments;
      const user = await storage.getUserByUsername(username);
      if (!user) return { statusCode: 404, body: "Not found" };
      
      const file = await storage.getFileByPath(user.id, filename);
      if (!file) return { statusCode: 404, body: "Not found" };
      
      return {
        statusCode: 200,
        headers: { "Content-Type": file.mimeType },
        body: file.content,
      };
    } else if (segments.length === 3) {
      // /:username/:folder/:filename
      const [username, folder, filename] = segments;
      const user = await storage.getUserByUsername(username);
      if (!user) return { statusCode: 404, body: "Not found" };
      
      const file = await storage.getFileByFolderAndPath(user.id, folder, filename);
      if (!file) return { statusCode: 404, body: "Not found" };
      
      return {
        statusCode: 200,
        headers: { "Content-Type": file.mimeType },
        body: file.content,
      };
    } else if (segments.length === 1) {
      // /:username - serve index.html
      const username = segments[0];
      const user = await storage.getUserByUsername(username);
      if (!user) return { statusCode: 404, body: "Not found" };
      
      const file = await storage.getFileByPath(user.id, "index.html");
      if (!file) return { statusCode: 404, body: "Not found" };
      
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: file.content,
      };
    }
    
    return { statusCode: 404, body: "Not found" };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Internal server error",
    };
  }
};
