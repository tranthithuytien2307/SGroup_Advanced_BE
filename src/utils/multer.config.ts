import multer from "multer";
import { attachmentStorage } from "./cloudinary.storage";

export const uploadAttachment = multer({
  storage: attachmentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});
