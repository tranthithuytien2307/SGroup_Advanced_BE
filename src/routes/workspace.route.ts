import { WorkspaceSchema } from "./../schemas/workspace.shema";
import express from "express";
import workspaceController from "../controllers/workspace.controllers";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorizeWorkspace } from "../middleware/rbac-workspace.middleware";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorizeWorkspace(["owner", "admin", "member", "viewer"]),
  asyncHandler(workspaceController.getAllWorkspace)
);

router.get(
  "/:id",
  authMiddleware,
  validateRequest(WorkspaceSchema.GetById),
  authorizeWorkspace(["owner", "admin", "member", "viewer"]),
  asyncHandler(workspaceController.getWorkspaceById)
);

router.post(
  "/",
  authMiddleware,
  validateRequest(WorkspaceSchema.Create),
  authorizeWorkspace(["owner", "admin", "member"]),
  asyncHandler(workspaceController.createWorkspace)
);

router.put(
  "/:id",
  authMiddleware,
  validateRequest(WorkspaceSchema.Update),
  authorizeWorkspace(["owner", "admin", "member"]),
  asyncHandler(workspaceController.updateWorkspace)
);

router.delete(
  "/:id",
  authMiddleware,
  validateRequest(WorkspaceSchema.Delete),
  authorizeWorkspace(["owner"]),
  asyncHandler(workspaceController.deleteWorkspace)
);

export default router;
