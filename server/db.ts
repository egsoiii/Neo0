import mongoose from "mongoose";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Use MongoDB connection string.",
  );
}

export async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL!);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }
}

// Define schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const folderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  parentFolderId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const fileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  folderId: { type: String, default: null },
  filename: { type: String, required: true },
  content: { type: String, required: true },
  mimeType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create models
export const UserModel = mongoose.model("User", userSchema);
export const FolderModel = mongoose.model("Folder", folderSchema);
export const FileModel = mongoose.model("File", fileSchema);
