import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import { randomUUID } from "crypto";
import { r2BucketName, r2Client, r2PublicBaseUrl } from "../utils/r2";

type CreateUploadUrlInput = {
  folder: string;
  fileName: string;
  contentType: string;
};

class ObjectStorageService {
  private sanitizeFileName(fileName: string) {
    const extension = path.extname(fileName).toLowerCase();
    const baseName = path
      .basename(fileName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    return `${baseName || "file"}${extension}`;
  }

  private encodeObjectKey(objectKey: string) {
    return objectKey.split("/").map(encodeURIComponent).join("/");
  }

  private buildObjectKey(folder: string, fileName: string) {
    const normalizedFolder = folder.replace(/^\/+|\/+$/g, "");
    const safeFileName = this.sanitizeFileName(fileName);

    return `${normalizedFolder}/${Date.now()}-${randomUUID()}-${safeFileName}`;
  }

  createFileUrl(objectKey: string) {
    return `${r2PublicBaseUrl}/${this.encodeObjectKey(objectKey)}`;
  }

  async createPresignedUploadUrl({
    folder,
    fileName,
    contentType,
  }: CreateUploadUrlInput) {
    const objectKey = this.buildObjectKey(folder, fileName);

    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 300,
    });

    return {
      uploadUrl,
      objectKey,
      fileUrl: this.createFileUrl(objectKey),
    };
  }

  extractObjectKey(fileUrl: string) {
    const normalizedBaseUrl = `${r2PublicBaseUrl}/`;

    if (fileUrl.startsWith(normalizedBaseUrl)) {
      return decodeURIComponent(fileUrl.slice(normalizedBaseUrl.length));
    }

    return null;
  }

  async deleteObjectByUrl(fileUrl?: string | null) {
    if (!fileUrl) return;

    const objectKey = this.extractObjectKey(fileUrl);
    if (!objectKey) return;

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: r2BucketName,
        Key: objectKey,
      }),
    );
  }
}

export default new ObjectStorageService();
