import { Router } from "express";
import attachmentController from "../controllers/attachment.controller";
import asyncHandler from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorizeCardById } from "../middleware/rbac.card.middleware";
import { validateRequest } from "../utils/http-handler";
import { AttachmentSchema } from "../schemas/attachment.schema";

const router = Router();

router.post(
  "/presign",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  validateRequest(AttachmentSchema.Presign, "body"),
  asyncHandler(attachmentController.createUploadUrl)
);

router.post(
  "/upload",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  validateRequest(AttachmentSchema.Upload, "body"),
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
