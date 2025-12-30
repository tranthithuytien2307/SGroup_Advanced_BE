import { Router } from "express";
import cardController from "../controllers/card.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { authorizeListByBody } from "../middleware/rbac.list.middleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";
import { CardSchema } from "../schemas/card.schema";
import { authorizeCardById } from "../middleware/rbac.card.middleware";
import { validateRequest } from "../utils/http-handler";

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
  method: "post",
  path: "/api/card/date",
  tags: ["Card"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CardSchema.SetDates,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Set card dates"),
});

router.post(
  "/date",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  validateRequest(CardSchema.SetDates, "body"),
  asyncHandler(cardController.setDates)
);

cardRegistry.registerPath({
  method: "post",
  path: "/api/card/complete",
  tags: ["Card"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CardSchema.CompleteCard,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Mark card as completed"),
});

router.post(
  "/complete",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  asyncHandler(cardController.markCompleted)
);

cardRegistry.registerPath({
  method: "get",
  path: "/api/card/{card_id}/status",
  tags: ["Card"],
  security: [{ BearerAuth: [] }],
  request: {
    params: CardSchema.CardIdParam,
  },
  responses: createApiResponse(
    CardSchema.CardDateStatusResponse,
    "Get card date status"
  ),
});

router.get(
  "/:card_id/status",
  authMiddleware,
  authorizeCardById(["admin", "member", "viewer"]),
  validateRequest(CardSchema.CardIdParam, "params"),
  asyncHandler(cardController.getStatus)
);
export default router;
