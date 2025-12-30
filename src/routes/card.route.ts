import { Router } from "express";
import cardController from "../controllers/card.controller";
import commentController from "../controllers/comment.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";
import { CardSchema } from "../schemas/card.schema";
import { CommentSchema } from "../schemas/comment.schema";

const router = Router();
export const cardRegistry = new OpenAPIRegistry();

router.use(authMiddleware);

cardRegistry.registerPath({
  method: "post",
  path: "/api/card",
  tags: ["Card"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CardSchema.Create,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Create card"),
});

router.post(
  "/",
  authMiddleware,
  asyncHandler(cardController.createCard)
);

cardRegistry.registerPath({
  method: "put",
  path: "/api/card/:id",
  tags: ["Card"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: CardSchema.Update,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Update card"),
});

router.put(
  "/:id",
  authMiddleware,
  asyncHandler(cardController.updateCard)
);

cardRegistry.registerPath({
  method: "patch",
  path: "/api/card/:id/archive",
  tags: ["Card"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(z.null(), "Archive card"),
});

router.patch(
  "/:id/archive",
  authMiddleware,
  asyncHandler(cardController.archiveCard)
);

cardRegistry.registerPath({
  method: "patch",
  path: "/api/card/:id/unarchive",
  tags: ["Card"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(z.null(), "Unarchive card"),
});

router.patch(
  "/:id/unarchive",
  authMiddleware,
  asyncHandler(cardController.unarchiveCard)
);

cardRegistry.registerPath({
  method: "post",
  path: "/api/card/:id/reorder",
  tags: ["Card"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: CardSchema.Reorder,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Reorder card"),
});

router.post(
  "/:id/reorder",
  authMiddleware,
  asyncHandler(cardController.reorderCard)
);

cardRegistry.registerPath({
  method: "post",
  path: "/api/card/:id/move",
  tags: ["Card"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: CardSchema.Move,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Move card"),
});

router.post(
  "/:id/move",
  authMiddleware,
  asyncHandler(cardController.moveCard)
);

cardRegistry.registerPath({
  method: "post",
  path: "/api/card/:id/copy",
  tags: ["Card"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: CardSchema.Copy,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Copy card"),
});

router.post(
  "/:id/copy",
  authMiddleware,
  asyncHandler(cardController.copyCard)
);

cardRegistry.registerPath({
  method: "post",
  path: "/api/card/{id}/member",
  tags: ["Card Member"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: CardSchema.AddMember,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Add member to card"),
});

router.post(
  "/:id/member",
  authMiddleware,
  asyncHandler(cardController.addMember)
);

cardRegistry.registerPath({
  method: "delete",
  path: "/api/card/{id}/member/{userId}",
  tags: ["Card Member"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string(), userId: z.string() }),
  },
  responses: createApiResponse(z.null(), "Remove member from card"),
});

router.delete(
  "/:id/member/:userId",
  authMiddleware,
  asyncHandler(cardController.removeMember)
);

// --- Comments ---

cardRegistry.registerPath({
  method: "post",
  path: "/api/card/{cardId}/comment",
  tags: ["Card Comment"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ cardId: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: CommentSchema.Create,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Create comment"),
});

router.post(
  "/:cardId/comment",
  authMiddleware,
  asyncHandler(commentController.createComment)
);

cardRegistry.registerPath({
  method: "put",
  path: "/api/card/comment/{commentId}",
  tags: ["Card Comment"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ commentId: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: CommentSchema.Update,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Update comment"),
});

router.put(
  "/comment/:commentId",
  authMiddleware,
  asyncHandler(commentController.updateComment)
);

cardRegistry.registerPath({
  method: "delete",
  path: "/api/card/comment/{commentId}",
  tags: ["Card Comment"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ commentId: z.string() }),
  },
  responses: createApiResponse(z.null(), "Delete comment"),
});

router.delete(
  "/comment/:commentId",
  authMiddleware,
  asyncHandler(commentController.deleteComment)
);

export default router;
