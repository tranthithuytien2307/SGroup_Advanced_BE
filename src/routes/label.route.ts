import { Router } from "express";
import labelController from "../controllers/label.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import asyncHandler from "../middleware/asyncHandler";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";
import { authorizeBoard } from "../middleware/rbac-board.middleware";
import { validateRequest } from "../utils/http-handler";
import { LabelSchema } from "../schemas/label.schema";
import { authorizeCardById } from "../middleware/rbac.card.middleware";

const router = Router();
export const labelRegistry = new OpenAPIRegistry();

labelRegistry.registerPath({
  method: "post",
  path: "/api/label",
  tags: ["Label"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LabelSchema.CreateLabel,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Create label"),
});

router.post(
  "/",
  authMiddleware,
  authorizeBoard(["admin", "member"]),
  validateRequest(LabelSchema.CreateLabel, "body"),
  asyncHandler(labelController.createLabel)
);

labelRegistry.registerPath({
  method: "get",
  path: "/api/label/board/:board_id",
  tags: ["Label"],
  security: [{ BearerAuth: [] }],
  request: { params: LabelSchema.GetById },
  responses: createApiResponse(z.null(), "Get labels by board Id"),
});

router.get(
  "/board/:board_id",
  authMiddleware,
  authorizeBoard(["admin", "member", "viewer"]),
  validateRequest(LabelSchema.GetById, "params"),
  asyncHandler(labelController.getLabelByBoardId)
);

labelRegistry.registerPath({
  method: "post",
  path: "/api/label/attach",
  tags: ["Label"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LabelSchema.AttachOrDetachLabelToCard,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Attach labels to card"),
});

router.post(
  "/attach",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  validateRequest(LabelSchema.AttachOrDetachLabelToCard, "body"),
  asyncHandler(labelController.attachLabelsToCard)
);

labelRegistry.registerPath({
  method: "post",
  path: "/api/label/detach",
  tags: ["Label"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LabelSchema.AttachOrDetachLabelToCard,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Attach labels to card"),
});

router.post(
  "/detach",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  validateRequest(LabelSchema.AttachOrDetachLabelToCard, "body"),
  asyncHandler(labelController.detachLabelsFromCard)
);

export default router;
