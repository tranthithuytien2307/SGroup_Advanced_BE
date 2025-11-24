import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../utils/http-handler";
import workspaceMemberController from "../controllers/workspace-member.controller";
import { WorkspaceMemberSchema } from "../schemas/workspace-member.schema";
import { authorizeWorkspace } from "../middleware/rbac-workspace.middleware";

const router = Router();

router.post(
  "/:workspaceId/invation",
  authMiddleware,
  validateRequest(WorkspaceMemberSchema.Invite),
  asyncHandler(workspaceMemberController.inviteMember),
  authorizeWorkspace(["owner", "admin"])
);

router.get(
  "/invite/accept",
  asyncHandler(workspaceMemberController.acceptInvitation),
  authorizeWorkspace(["owner", "admin", "member", "viewer"])
);

router.get(
  "/:workspaceId/members",
  authMiddleware,
  asyncHandler(workspaceMemberController.getMembers),
  authorizeWorkspace(["owner", "admin", "member", "viewer"])
);

router.put(
  "/:workspaceId/members/:userId",
  authMiddleware,
  validateRequest(WorkspaceMemberSchema.UpdateRole),
  asyncHandler(workspaceMemberController.updateRole),
  authorizeWorkspace(["owner", "admin"])
);

router.delete(
  "/:workspaceId/members/:userId",
  authMiddleware,
  asyncHandler(workspaceMemberController.removeMember),
  authorizeWorkspace(["owner", "admin"])
);

export default router;
