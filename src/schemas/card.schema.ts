import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const CardSchema = {
  Create: z
    .object({
      list_id: z
        .number()
        .or(
          z
            .string()
            .regex(/^\d+$/, "List ID must be a number")
            .transform(Number)
        )
        .openapi({ description: "List ID" }),
      title: z
        .string()
        .min(1, "Title is required")
        .openapi({ description: "Card title" }),
    })
    .openapi("CreateCardRequest"),

  Update: z
    .object({
      title: z.string().optional().openapi({ description: "Card title" }),
      description: z
        .string()
        .optional()
        .openapi({ description: "Card description" }),
    })
    .openapi("UpdateCardRequest"),

  Reorder: z
    .object({
      newIndex: z
        .number()
        .min(0, "Index must be non-negative")
        .openapi({ description: "New position index" }),
    })
    .openapi("ReorderCardRequest"),

  Move: z
    .object({
      toBoardId: z.number().openapi({ description: "Target Board ID" }),
      toListId: z.number().openapi({ description: "Target List ID" }),
      newIndex: z
        .number()
        .min(0)
        .openapi({ description: "New position index in target list" }),
      newTitle: z
        .string()
        .optional()
        .openapi({ description: "New title for the card (optional)" }),
    })
    .openapi("MoveCardRequest"),

  Copy: z
    .object({
      toBoardId: z.number().openapi({ description: "Target Board ID" }),
      toListId: z.number().openapi({ description: "Target List ID" }),
      newIndex: z
        .number()
        .min(0)
        .openapi({ description: "New position index in target list" }),
      newTitle: z
        .string()
        .optional()
        .openapi({ description: "New title for the copied card (optional)" }),
    })
    .openapi("CopyCardRequest"),
};
