import { Router } from "express";
import userController from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";
import { UserSchema } from "../schemas/user.schema";
import upload from "../middleware/upload.middleware";

const router = Router();

router.get(
  "/users",
  authMiddleware,
  authorize("view_all"),
  asyncHandler(userController.getUsers)
);

router.get(
  "/user/:id",
  authMiddleware,
  authorize("view_self"),
  validateRequest(UserSchema.GetById),
  asyncHandler(userController.getUser)
);

router.post(
  "/user",
  authMiddleware,
  authorize("create_user"),
  validateRequest(UserSchema.Create),
  asyncHandler(userController.createUser)
);

router.put(
  "/user/:id",
  authMiddleware,
  authorize("update_user"),
  validateRequest(UserSchema.Update),
  asyncHandler(userController.updateUser)
);

router.delete(
  "/user/:id",
  authMiddleware,
  authorize("delete_user"),
  validateRequest(UserSchema.Delete),
  asyncHandler(userController.deleteUser)
);

router.patch("/user/profile", authMiddleware, userController.updateProfile);

router.patch(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  userController.uploadAvatar
);

export default router;
