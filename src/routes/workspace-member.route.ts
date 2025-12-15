import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../utils/http-handler";
import workspaceMemberController from "../controllers/workspace-member.controller";
import { WorkspaceMemberSchema } from "../schemas/workspace-member.schema";
import { authorizeWorkspace } from "../middleware/rbac-workspace.middleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";

export const workspaceMemberRegistry = new OpenAPIRegistry();
const router = Router();

workspaceMemberRegistry.registerPath({
  method: "post",
  path: "/api/workspace-member/:workspaceId/invation",
  tags: ["WorkspaceMember"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: WorkspaceMemberSchema.Invite } },
    },
    params: WorkspaceMemberSchema.ParamsWorkspaceId,
  },
  responses: createApiResponse(z.null(), "Invite member to workspace"),
});

router.post(
  "/:workspaceId/invation",
  authMiddleware,
  validateRequest(WorkspaceMemberSchema.Invite),
  asyncHandler(workspaceMemberController.inviteMember),
  authorizeWorkspace(["owner", "admin"])
);

workspaceMemberRegistry.registerPath({
  method: "get",
  path: "/api/workspace-member/invite/accept",
  tags: ["WorkspaceMember"],
  responses: createApiResponse(z.null(), "Accept workspace invitation"),
});

router.get(
  "/invite/accept",
  asyncHandler(workspaceMemberController.acceptInvitation),
  authorizeWorkspace(["owner", "admin", "member", "viewer"])
);

workspaceMemberRegistry.registerPath({
  method: "get",
  path: "/api/workspace-member/:workspaceId/members",
  tags: ["WorkspaceMember"],
  security: [{ BearerAuth: [] }],
  request: { params: WorkspaceMemberSchema.ParamsWorkspaceId },
  responses: createApiResponse(z.null(), "Get workspace members"),
});

router.get(
  "/:workspaceId/members",
  authMiddleware,
  asyncHandler(workspaceMemberController.getMembers),
  authorizeWorkspace(["owner", "admin", "member", "viewer"])
);

workspaceMemberRegistry.registerPath({
  method: "put",
  path: "/api/workspace-member/:workspaceId/members/:userId",
  tags: ["WorkspaceMember"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: WorkspaceMemberSchema.UpdateRole },
      },
    },
    params: WorkspaceMemberSchema.ParamsWorkspaceUser,
  },
  responses: createApiResponse(z.null(), "Update workspace member role"),
});

router.put(
  "/:workspaceId/members/:userId",
  authMiddleware,
  validateRequest(WorkspaceMemberSchema.UpdateRole),
  asyncHandler(workspaceMemberController.updateRole),
  authorizeWorkspace(["owner", "admin"])
);

workspaceMemberRegistry.registerPath({
  method: "delete",
  path: "/api/workspace-member/:workspaceId/members/:userId",
  tags: ["WorkspaceMember"],
  security: [{ BearerAuth: [] }],
  request: { params: WorkspaceMemberSchema.ParamsWorkspaceUser },
  responses: createApiResponse(z.null(), "Remove workspace member"),
});

router.delete(
  "/:workspaceId/members/:userId",
  authMiddleware,
  asyncHandler(workspaceMemberController.removeMember),
  authorizeWorkspace(["owner", "admin"])
);

export default router;
