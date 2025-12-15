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

/**
 * -------------------------
 *   GET ALL BOARDS
 * -------------------------
 * Yêu cầu: phải là member của workspace chứa board.
 */

boardRegistry.registerPath({
  method: "get",
  path: "/api/board",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.null(), "Get all boards"),
});

router.get(
  "/",
  authMiddleware,
  authorizeWorkspace(["owner", "admin", "member", "viewer"]),
  asyncHandler(boardController.getAll)
);

/**
 * -------------------------
 *  GET BOARD BY ID
 * -------------------------
 * Quyền board: admin, member, viewer
 */

boardRegistry.registerPath({
  method: "get",
  path: "/api/board/:id",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.GetById },
  responses: createApiResponse(z.null(), "Get board by ID"),
});

router.get(
  "/:board_id",
  authMiddleware,
  authorizeBoard(["admin", "member", "viewer"]),
  validateRequest(BoardSchema.GetById, "params"),
  asyncHandler(boardController.getById)
);

/**
 * -------------------------
 *   CREATE BOARD
 * -------------------------
 * Quyền workspace: owner, admin, member
 * Viewer workspace không được tạo board
 */

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
  authorizeWorkspace(["owner", "admin", "member"]),
  validateRequest(BoardSchema.Create),
  asyncHandler(boardController.create)
);

/**
 * -------------------------
 *    UPDATE BOARD
 * -------------------------
 * Quyền board: admin, member
 */

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
  "/:board_id",
  authMiddleware,
  authorizeBoard(["admin", "member"]),
  validateRequest(BoardSchema.Update),
  asyncHandler(boardController.update)
);

/**
 * -------------------------
 *    DELETE BOARD
 * -------------------------
 * Quyền board: admin
 */

boardRegistry.registerPath({
  method: "delete",
  path: "/api/board/:id",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.Delete },
  responses: createApiResponse(z.null(), "Delete board"),
});

router.delete(
  "/:board_id",
  authMiddleware,
  validateRequest(BoardSchema.Delete, "params"),
  authorizeBoard(["admin"]),
  asyncHandler(boardController.delete)
);

/** -------------------------
 * GET BOARDS BY WORKSPACE ID
 * -------------------------
 * Quyền workspace: owner, admin, member, viewer
 */

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

/**
 * -------------------------
 *    CHANGE BOARD OWNER
 * -------------------------
 * Quyền board: admin
 */
boardRegistry.registerPath({
  method: "put",
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

router.put(
  "/:board_id/change-owner",
  authMiddleware,
  validateRequest(BoardSchema.ChangeOwner),
  authorizeBoard(["admin"]),
  asyncHandler(boardController.changeOwner)
);

/**
 * -------------------------
 *    BOARD INVITE LINK
 * -------------------------
 * Quyền board: admin, member
 */
boardRegistry.registerPath({
  method: "get",
  path: "/api/board/:id/link_invite/",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.GetById },
  responses: createApiResponse(z.null(), "Get board invite link"),
});

router.get(
  "/:board_id/link_invite",
  authMiddleware,
  validateRequest(BoardSchema.GetById, "params"),
  authorizeBoard(["admin", "member"]),
  asyncHandler(boardController.inviteLink)
);

/** -------------------------
 *   REGENERATE BOARD INVITE LINK
 * -------------------------
 * Quyền board: admin
 */
boardRegistry.registerPath({
  method: "post",
  path: "/api/board/:id/invite/regenerate",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.GetById },
  responses: createApiResponse(z.null(), "Regenerate board invite link"),
});

router.post(
  "/:board_id/invite/regenerate",
  authMiddleware,
  validateRequest(BoardSchema.GetById, "params"),
  authorizeBoard(["admin"]),
  asyncHandler(boardController.regenerateInviteLink)
);

/**
 * -------------------------
 *   DISABLE BOARD INVITE LINK
 * -------------------------
 * Quyền board: admin
 */
boardRegistry.registerPath({
  method: "post",
  path: "/api/board/:id/invite/disable",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.GetById },
  responses: createApiResponse(z.null(), "Disable board invite link"),
});

router.post(
  "/:board_id/invite/disable",
  authMiddleware,
  validateRequest(BoardSchema.GetById, "params"),
  authorizeBoard(["admin"]),
  asyncHandler(boardController.disableInviteLink)
);

/**
 * -------------------------
 *   JOIN BOARD VIA INVITE LINK
 * -------------------------
 * Mọi người (không cần là member của workspace hoặc board)
 */
boardRegistry.registerPath({
  method: "post",
  path: "/api/board/invite/:invite_token",
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

/**
 * -------------------------
 *   INVITE MEMBER TO BOARD VIA EMAIL
 * -------------------------
 * Quyền board: admin, member
 */
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
  "/:board_id/invation-email",
  authMiddleware,
  validateRequest(BoardSchema.InviteEmail),
  asyncHandler(boardController.inviteMember)
);

/**
 * -------------------------
 *   ACCEPT BOARD INVITATION VIA EMAIL
 * -------------------------
 * Mọi người (không cần là member của workspace hoặc board)
 */
boardRegistry.registerPath({
  method: "get",
  path: "/api/board/invite-email/accept",
  tags: ["WorkspaceMember"],
  responses: createApiResponse(z.null(), "Accept board invitation"),
});

router.get(
  "/invite-email/accept",
  authMiddleware,
  asyncHandler(boardController.acceptInvitation)
);

/**
 *  -------------------------
 *     ARCHIVE BOARD & UNARCHIVE BOARD
 *  -------------------------
 *  Quyền board: admin
 */
boardRegistry.registerPath({
  method: "post",
  path: "/api/board/:id/archive",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.Archive },
  responses: createApiResponse(z.null(), "Archive board"),
});

router.post(
  "/archive/:board_id",
  authMiddleware,
  authorizeBoard(["admin"]),
  validateRequest(BoardSchema.Archive, "params"),
  asyncHandler(boardController.archive)
);

boardRegistry.registerPath({
  method: "post",
  path: "/api/board/:id/unarchive",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.Unarchive },
  responses: createApiResponse(z.null(), "Unarchive board"),
});

router.post(
  "/unarchive/:board_id",
  authMiddleware,
  authorizeBoard(["admin"]),
  validateRequest(BoardSchema.Unarchive, "params"),
  asyncHandler(boardController.unarchive)
);

export default router;
