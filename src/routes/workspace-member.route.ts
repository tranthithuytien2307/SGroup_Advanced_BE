import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../utils/http-handler";
import workspaceMemberController from "../controllers/workspace-member.controller";
import { WorkspaceMemberSchema } from "../schemas/workspace-member.schema";

const router = Router();

router.post(
  "/:workspaceId/members",
  authMiddleware,
  validateRequest(WorkspaceMemberSchema.AddMember),
  asyncHandler(workspaceMemberController.addMember)
);

router.get(
  "/:workspaceId/members",
  authMiddleware,
  asyncHandler(workspaceMemberController.getMembers)
);

router.put(
  "/:workspaceId/members/:userId",
  authMiddleware,
  validateRequest(WorkspaceMemberSchema.UpdateRole),
  asyncHandler(workspaceMemberController.updateRole)
);

router.delete(
  "/:workspaceId/members/:userId",
  authMiddleware,
  asyncHandler(workspaceMemberController.removeMember)
);

export default router;
