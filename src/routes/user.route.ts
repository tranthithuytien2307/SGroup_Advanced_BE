import { Router } from "express";
import userController from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorization } from "../middleware/rbac.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";
import { UserSchema } from "../schemas/user.schema";
import upload from "../middleware/upload.middleware";

const router = Router();

// ===============================
// ADMIN & STAFF: View all users
// Permission: view_all
// ===============================
router.get(
  "/users",
  authMiddleware,
  authorization("view_all"),
  asyncHandler(userController.getUsers)
);

// ===============================
//  ANY USER: View user by ID
// - ADMIN, STAFF: view all users (view_all)
// - USER: view self only (view_self)
// ===============================
router.get(
  "/user/:id",
  authMiddleware,
  authorization("view_self"),
  authorization("view_all"),
  validateRequest(UserSchema.GetById),
  asyncHandler(userController.getUser)
);

// ===============================
// ADMIN: Create new user
// Permission: create_user
// ===============================
router.post(
  "/user",
  authMiddleware,
  authorization("create_user"),
  validateRequest(UserSchema.Create),
  asyncHandler(userController.createUser)
);

// ===============================
// ADMIN & STAFF: Update user
// - ADMIN: update_user
// - STAFF: update_user
// - USER: update_self
// ===============================
router.put(
  "/user/:id",
  authMiddleware,
  authorization("update_self"),
  authorization("update_user"),
  validateRequest(UserSchema.Update),
  asyncHandler(userController.updateUser)
);

// ===============================
// ADMIN: Delete user
// Permission: delete_user
// ===============================
router.delete(
  "/user/:id",
  authMiddleware,
  authorization("delete_user"),
  validateRequest(UserSchema.Delete),
  asyncHandler(userController.deleteUser)
);

// ===============================
// USER: Update own profile
// Permission: update_self
// ===============================
router.put(
  "/user/profile",
  authMiddleware,
  authorization("update_self"),
  asyncHandler(userController.updateProfile)
);

// ===============================
// USER: Update avatar
// Permission: update_self
// ===============================
router.put(
  "/user/avatar",
  authMiddleware,
  authorization("update_self"),
  upload.single("avatar"),
  asyncHandler(userController.uploadAvatar)
);

export default router;
