import { response, Router } from "express";
import boardController from "../controllers/board.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";
import { BoardSchema } from "../schemas/board.schema";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorizeBoard } from "../middleware/rbac-board.middleware";
import { authorizeWorkspace } from "../middleware/rbac-workspace.middleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";

export const boardRegistry = new OpenAPIRegistry();
const router = Router();

boardRegistry.registerPath({
  method: "get",
  path: "/api/boards",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.null(), "Get all boards"),
});

router.get("/", authMiddleware, asyncHandler(boardController.getAll));

boardRegistry.registerPath({
  method: "get",
  path: "/api/board/:id",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.GetById },
  responses: createApiResponse(z.null(), "Get board by ID"),
});

router.get(
  "/:id",
  authMiddleware,
  validateRequest(BoardSchema.GetById, "params"),
  authorizeBoard(["admin", "member", "viewer"]),
  asyncHandler(boardController.getById)
);

boardRegistry.registerPath({
  method: "post",
  path: "/api/board",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: BoardSchema.Create } } },
  },
  responses: createApiResponse(z.null(), "Create board"),
});

router.post(
  "/",
  authMiddleware,
  validateRequest(BoardSchema.Create),
  authorizeWorkspace(["owner", "admin", "member"]),
  asyncHandler(boardController.create)
);

boardRegistry.registerPath({
  method: "put",
  path: "/api/board/:id",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: BoardSchema.Update } } },
    params: BoardSchema.GetById,
  },
  responses: createApiResponse(z.null(), "Update board"),
});

router.put(
  "/:id",
  authMiddleware,
  validateRequest(BoardSchema.Update),
  authorizeBoard(["admin", "member"]),
  asyncHandler(boardController.update)
);

boardRegistry.registerPath({
  method: "delete",
  path: "/api/board/:id",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.Delete },
  responses: createApiResponse(z.null(), "Delete board"),
});

router.delete(
  "/:id",
  authMiddleware,
  validateRequest(BoardSchema.Delete, "params"),
  authorizeBoard(["admin"]),
  asyncHandler(boardController.delete)
);

boardRegistry.registerPath({
  method: "get",
  path: "/api/board/workspace/:workspace_id",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.GetByWorkspace },
  responses: createApiResponse(z.null(), "Get boards by workspace"),
});

router.get(
  "/workspace/:workspace_id",
  authMiddleware,
  validateRequest(BoardSchema.GetByWorkspace, "params"),
  authorizeWorkspace(["owner", "admin", "member", "viewer"]),
  asyncHandler(boardController.getByWorkspaceId)
);

boardRegistry.registerPath({
  method: "patch",
  path: "/api/board/:id/owner",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: BoardSchema.ChangeOwner } },
    },
    params: BoardSchema.GetById,
  },
  responses: createApiResponse(z.null(), "Change board owner"),
});

router.patch(
  "/:id/change-owner",
  authMiddleware,
  validateRequest(BoardSchema.ChangeOwner),
  authorizeBoard(["admin"]),
  asyncHandler(boardController.changeOwner)
);

boardRegistry.registerPath({
  method: "get",
  path: "/api/board/:id/link_invite/",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.GetById },
  responses: createApiResponse(z.null(), "Get board invite link"),
});

router.get(
  "/:id/link_invite",
  authMiddleware,
  validateRequest(BoardSchema.GetById, "params"),
  authorizeBoard(["admin", "member", "viewer"]),
  asyncHandler(boardController.inviteLink)
);

boardRegistry.registerPath({
  method: "post",
  path: "/api/board/:id/invite/regenerate",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.GetById },
  responses: createApiResponse(z.null(), "Regenerate board invite link"),
});

router.post(
  "/:id/invite/regenerate",
  authMiddleware,
  validateRequest(BoardSchema.GetById, "params"),
  authorizeBoard(["admin"]),
  asyncHandler(boardController.regenerateInviteLink)
);

boardRegistry.registerPath({
  method: "post",
  path: "/api/board/:id/invite/disable",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.GetById },
  responses: createApiResponse(z.null(), "Disable board invite link"),
});

router.post(
  "/:id/invite/disable",
  authMiddleware,
  validateRequest(BoardSchema.GetById, "params"),
  authorizeBoard(["admin"]),
  asyncHandler(boardController.disableInviteLink)
);

boardRegistry.registerPath({
  method: "post",
  path: "/api/board/:id/invite/join",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.GetById },
  responses: createApiResponse(z.null(), "Enable board invite link"),
});

router.post(
  "/invite/:invite_token",
  authMiddleware,
  validateRequest(BoardSchema.JoinInvite, "params"),
  asyncHandler(boardController.joinViaInviteLink)
);

boardRegistry.registerPath({
  method: "post",
  path: "/api/board/:id/invation-email",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: BoardSchema.InviteEmail } },
    },
    params: BoardSchema.GetById,
  },
  responses: createApiResponse(z.null(), "Invite member to workspace"),
});

router.post(
  "/:id/invation-email",
  authMiddleware,
  validateRequest(BoardSchema.InviteEmail),
  asyncHandler(boardController.inviteMember)
);

boardRegistry.registerPath({
  method: "get",
  path: "/api/board/invite-email/accept",
  tags: ["WorkspaceMember"],
  responses: createApiResponse(z.null(), "Accept board invitation"),
});

router.get(
  "/invite-email/accept",
  asyncHandler(boardController.acceptInvitation)
);
export default router;
