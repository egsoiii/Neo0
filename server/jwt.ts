import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { User } from "@shared/schema";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Simple JWT implementation for serverless
export function createToken(user: User): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ id: user.id, username: user.username, iat: Date.now() })).toString("base64url");
  const signature = createSignature(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { id: number; username: string } | null {
  try {
    const [header, payload, signature] = token.split(".");
    const expectedSignature = createSignature(`${header}.${payload}`);
    if (signature !== expectedSignature) return null;
    
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    return { id: decoded.id, username: decoded.username };
  } catch {
    return null;
  }
}

function createSignature(data: string): string {
  const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
  const crypto = require("crypto");
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}
