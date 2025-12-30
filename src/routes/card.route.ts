import { Router } from "express";
import cardController from "../controllers/card.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { authorizeListByBody } from "../middleware/rbac.list.middleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";
import { CardSchema } from "../schemas/card.schema";

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
  authorizeListByBody(["admin", "member"]),
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

export default router;
