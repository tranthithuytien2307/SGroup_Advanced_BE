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
  path: "/api/workspace/archived",
  tags: ["Workspace"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.array(z.any()), "Get archived workspaces"),
});

router.get(
  "/archived",
  authMiddleware,
  asyncHandler(workspaceController.getArchivedWorkspaces),
);

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
  asyncHandler(workspaceController.getAllWorkspace),
);

workspaceRegistry.registerPath({
  method: "get",
  path: "/api/workspace/byUser",
  tags: ["Workspace"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.null(), "Get all workspaces"),
});

router.get(
  "/byUser",
  authMiddleware,
  asyncHandler(workspaceController.getAllWorkspaceByUser),
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
  "/:workspace_id",
  authMiddleware,
  validateRequest(WorkspaceSchema.GetById, "params"),
  authorizeWorkspace(["owner", "admin", "member", "viewer"]),
  asyncHandler(workspaceController.getWorkspaceById),
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
  asyncHandler(workspaceController.createWorkspace),
);

workspaceRegistry.registerPath({
  method: "get",
  path: "/api/workspace/:workspace_id/boards/archived",
  tags: ["Workspace"],
  security: [{ BearerAuth: [] }],
  request: {
    params: WorkspaceSchema.GetById,
  },
  responses: createApiResponse(z.array(z.any()), "Get archived boards"),
});

router.get(
  "/:workspace_id/boards/archived",
  authMiddleware,
  validateRequest(WorkspaceSchema.GetById, "params"),
  authorizeWorkspace(["owner", "admin", "member"]),
  asyncHandler(workspaceController.getArchivedBoards),
);

workspaceRegistry.registerPath({
  method: "patch",
  path: "/api/workspace/:workspace_id/archive",
  tags: ["Workspace"],
  security: [{ BearerAuth: [] }],
  request: {
    params: WorkspaceSchema.GetById,
  },
  responses: createApiResponse(z.any(), "Archive workspace"),
});

router.patch(
  "/:workspace_id/archive",
  authMiddleware,
  validateRequest(WorkspaceSchema.GetById, "params"),
  authorizeWorkspace(["owner", "admin"]),
  asyncHandler(workspaceController.archiveWorkspace),
);

workspaceRegistry.registerPath({
  method: "patch",
  path: "/api/workspace/:workspace_id/unarchive",
  tags: ["Workspace"],
  security: [{ BearerAuth: [] }],
  request: {
    params: WorkspaceSchema.GetById,
  },
  responses: createApiResponse(z.any(), "Unarchive workspace"),
});

router.patch(
  "/:workspace_id/unarchive",
  authMiddleware,
  validateRequest(WorkspaceSchema.GetById, "params"),
  authorizeWorkspace(["owner", "admin"]),
  asyncHandler(workspaceController.unarchiveWorkspace),
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
  "/:workspace_id",
  authMiddleware,
  validateRequest(WorkspaceSchema.Update),
  authorizeWorkspace(["owner", "admin", "member"]),
  asyncHandler(workspaceController.updateWorkspace),
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
  "/:workspace_id",
  authMiddleware,
  validateRequest(WorkspaceSchema.Delete, "params"),
  authorizeWorkspace(["owner"]),
  asyncHandler(workspaceController.deleteWorkspace),
);

export default router;
