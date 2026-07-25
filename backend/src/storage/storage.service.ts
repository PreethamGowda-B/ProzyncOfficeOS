import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class StorageService {
  private readonly uploadDir = path.join(process.cwd(), "uploads");

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async generatePresignedUploadUrl(fileName: string, fileType: string) {
    const uniqueName = `${Date.now()}-${fileName}`;
    const key = `uploads/${uniqueName}`;
    
    // Returns local API upload URL for seamless out-of-the-box dev experience
    const uploadUrl = `http://localhost:4000/api/storage/local-upload?key=${uniqueName}`;
    return { uploadUrl, key };
  }

  async getPresignedDownloadUrl(key: string) {
    // Return local direct link
    const uniqueName = key.replace("uploads/", "");
    return `http://localhost:4000/api/storage/files/${uniqueName}`;
  }

  async saveFileLocally(uniqueName: string, buffer: Buffer) {
    const filePath = path.join(this.uploadDir, uniqueName);
    await fs.promises.writeFile(filePath, buffer);
    return { success: true, path: filePath };
  }

  getLocalFilePath(uniqueName: string): string {
    return path.join(this.uploadDir, uniqueName);
  }
}
