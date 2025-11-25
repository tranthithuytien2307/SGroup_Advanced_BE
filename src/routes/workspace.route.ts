import { WorkspaceSchema } from './../schemas/workspace.shema';
import express from "express";
import workspaceController from "../controllers/workspace.controllers";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorizeWorkspace } from '../middleware/rbac-workspace.middleware';

const router = express.Router();

router.get("/", 
  authMiddleware, 
  asyncHandler(workspaceController.getAllWorkspace),
  authorizeWorkspace(["owner", "admin", "member", "viewer"])
);

router.get(
  "/:workspace_id",
  authMiddleware,
  validateRequest(WorkspaceSchema.GetById),
  asyncHandler(workspaceController.getWorkspaceById),
  authorizeWorkspace(["owner", "admin", "member", "viewer"])
);

router.post(
  "/",
  authMiddleware,
  validateRequest(WorkspaceSchema.Create),
  asyncHandler(workspaceController.createWorkspace),
  authorizeWorkspace(["owner", "admin", "member"])
);

router.put(
  "/:workspace_id",
  authMiddleware,
  validateRequest(WorkspaceSchema.Update),
  asyncHandler(workspaceController.updateWorkspace),
  authorizeWorkspace(["owner", "admin", "member"])
);

router.delete(
  "/:workspace_id",
  authMiddleware,
  validateRequest(WorkspaceSchema.Delete),
  asyncHandler(workspaceController.deleteWorkspace),
  authorizeWorkspace(["owner", "admin"])
);

export default router;
