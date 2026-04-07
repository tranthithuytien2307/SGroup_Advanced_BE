import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";
import multer from "multer";

export const attachmentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: "cards/attachments",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

export const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: "avatars", // Folder riêng cho avatar
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: `avatar-${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

export const uploadAvatarMulter = multer({ storage: avatarStorage });

export const boardBackgroundStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: "boards/backgrounds", // Folder riêng cho ảnh nền board
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: `board-bg-${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

export const uploadBoardBackgroundMulter = multer({
  storage: boardBackgroundStorage,
});
