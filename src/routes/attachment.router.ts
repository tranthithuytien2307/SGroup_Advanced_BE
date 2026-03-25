import { Router } from "express";
import attachmentController from "../controllers/attachment.controller";
import asyncHandler from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorizeCardById } from "../middleware/rbac.card.middleware";
import { uploadAttachment } from "../utils/multer.config";

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  uploadAttachment.single("file"),
  asyncHandler(attachmentController.upload)
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  asyncHandler(attachmentController.delete)
);

router.post(
  "/cover",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  asyncHandler(attachmentController.setCoverFromAttachment)
);

router.post(
  "/cover/color",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  asyncHandler(attachmentController.setCoverColor)
);

export default router;
