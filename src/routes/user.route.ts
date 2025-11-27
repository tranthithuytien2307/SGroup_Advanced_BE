import { Router } from "express";
import userController from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorization } from "../middleware/rbac.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";
import upload from "../middleware/upload.middleware";
import { UserSchema } from "../schemas/user.schema";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";

export const userRegistry = new OpenAPIRegistry();
const router = Router();

// ===============================
// ADMIN & STAFF: View all users
// Permission: view_all
// ===============================
userRegistry.registerPath({
  method: "get",
  path: "/api/users",
  tags: ["User"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.null(), "Get all users"),
});

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
userRegistry.registerPath({
  method: "get",
  path: "/api/user/:id",
  tags: ["User"],
  security: [{ BearerAuth: [] }],
  request: { params: UserSchema.GetById },
  responses: createApiResponse(z.null(), "Get user by ID"),
});

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
userRegistry.registerPath({
  method: "post",
  path: "/api/user",
  tags: ["User"],
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: UserSchema.Create } } },
  },
  responses: createApiResponse(z.null(), "Create new user"),
});

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
userRegistry.registerPath({
  method: "put",
  path: "/api/user/:id",
  tags: ["User"],
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: UserSchema.Update } } },
    params: UserSchema.GetById,
  },
  responses: createApiResponse(z.null(), "Update user"),
});

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
userRegistry.registerPath({
  method: "delete",
  path: "/api/user/:id",
  tags: ["User"],
  security: [{ BearerAuth: [] }],
  request: { params: UserSchema.Delete },
  responses: createApiResponse(z.null(), "Delete user"),
});

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
userRegistry.registerPath({
  method: "put",
  path: "/api/user/profile",
  tags: ["User"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.null(), "Update user profile"),
});

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
userRegistry.registerPath({
  method: "put",
  path: "/api/user/avatar",
  tags: ["User"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.null(), "Update user avatar"),
});

router.put(
  "/user/avatar",
  authMiddleware,
  authorization("update_self"),
  upload.single("avatar"),
  asyncHandler(userController.uploadAvatar)
);

export default router;
