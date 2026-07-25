import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response, Request } from "express";
import { StorageService } from "./storage.service";
import * as fs from "fs";

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get("presigned-upload")
  getPresignedUpload(
    @Query("fileName") fileName: string,
    @Query("fileType") fileType: string,
  ) {
    return this.storageService.generatePresignedUploadUrl(fileName, fileType);
  }

  // Receives raw binary data or multi-part uploads from simulated pre-signed upload URL
  @Post("local-upload")
  @UseInterceptors(FileInterceptor("file"))
  async localUpload(
    @Query("key") key: string,
    @Req() req: Request,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      await this.storageService.saveFileLocally(key, file.buffer);
    } else {
      // Handle raw body upload (e.g. PUT/POST binary payload)
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      await this.storageService.saveFileLocally(key, buffer);
    }
    return { success: true };
  }

  // Serves uploaded files locally for browser viewing
  @Get("files/:filename")
  serveFile(@Param("filename") filename: string, @Res() res: Response) {
    const filePath = this.storageService.getLocalFilePath(filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }
    return res.sendFile(filePath);
  }
}
