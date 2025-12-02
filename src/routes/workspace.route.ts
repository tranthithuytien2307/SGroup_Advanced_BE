import express from "express";
import workspaceController from "../controllers/workspace.controllers";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";
import { WorkspaceSchema } from "../schemas/workspace.shema";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorizeWorkspace } from "../middleware/rbac-workspace.middleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";

export const workspaceRegistry = new OpenAPIRegistry();
const router = express.Router();

workspaceRegistry.registerPath({
  method: "get",
  path: "/api/workspace",
  tags: ["Workspace"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.null(), "Get all workspaces"),
});

router.get(
  "/",
  authMiddleware,
  asyncHandler(workspaceController.getAllWorkspace)
);

workspaceRegistry.registerPath({
  method: "get",
  path: "/api/workspace/:id",
  tags: ["Workspace"],
  security: [{ BearerAuth: [] }],
  request: { params: WorkspaceSchema.GetById },
  responses: createApiResponse(z.null(), "Get workspace by ID"),
});

router.get(
  "/:id",
  authMiddleware,
  validateRequest(WorkspaceSchema.GetById),
  authorizeWorkspace(["owner", "admin", "member", "viewer"]),
  asyncHandler(workspaceController.getWorkspaceById)
);

workspaceRegistry.registerPath({
  method: "post",
  path: "/api/workspace",
  tags: ["Workspace"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: WorkspaceSchema.Create } },
    },
  },
  responses: createApiResponse(z.null(), "Create workspace"),
});

router.post(
  "/",
  authMiddleware,
  validateRequest(WorkspaceSchema.Create, "body"),
  asyncHandler(workspaceController.createWorkspace)
);

workspaceRegistry.registerPath({
  method: "put",
  path: "/api/workspace/:id",
  tags: ["Workspace"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: WorkspaceSchema.Update } },
    },
    params: WorkspaceSchema.GetById,
  },
  responses: createApiResponse(z.null(), "Update workspace"),
});

router.put(
  "/:id",
  authMiddleware,
  validateRequest(WorkspaceSchema.Update),
  authorizeWorkspace(["owner", "admin", "member"]),
  asyncHandler(workspaceController.updateWorkspace)
);

workspaceRegistry.registerPath({
  method: "delete",
  path: "/api/workspace/:id",
  tags: ["Workspace"],
  security: [{ BearerAuth: [] }],
  request: { params: WorkspaceSchema.Delete },
  responses: createApiResponse(z.null(), "Delete workspace"),
});

router.delete(
  "/:id",
  authMiddleware,
  validateRequest(WorkspaceSchema.Delete),
  authorizeWorkspace(["owner"]),
  asyncHandler(workspaceController.deleteWorkspace)
);

export default router;
