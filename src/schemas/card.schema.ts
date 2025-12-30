import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const CardSchema = {
  GetById: z
    .object({
      card_id: z.string().regex(/^\d+$/, "Card ID must be a number").openapi({
        description: "Card ID",
      }),
    })
    .openapi("GetCardByIdParams"),

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

  SetDates: z
    .object({
      card_id: z.number().int().positive().openapi({ description: "Card ID" }),
      start_date: z
        .string()
        .datetime()
        .nullable()
        .optional()
        .openapi({ description: "Start date" }),
      deadline_date: z
        .string()
        .datetime()
        .nullable()
        .optional()
        .openapi({ description: "Due date" }),
    })
    .openapi("SetCardDatesBody"),

  CardIdParam: z
    .object({
      card_id: z
        .string()
        .regex(/^\d+$/, "Card ID must be a number")
        .openapi({ description: "Card ID" }),
    })
    .openapi("CardIdParams"),

  CompleteCard: z
    .object({
      card_id: z.number().int().positive().openapi({ description: "Card ID" }),
    })
    .openapi("CompleteCardBody"),

  CardDateStatusResponse: z
    .object({
      is_completed: z.boolean().openapi({
        description: "Card completion status",
      }),
      is_overdue: z.boolean().openapi({
        description: "Is card overdue",
      }),
      completed_early: z.boolean().openapi({
        description: "Completed before due date",
      }),
    })
    .openapi("CardDateStatusResponse"),
  Update: z
    .object({
      title: z.string().optional().openapi({ description: "Card title" }),
      description: z
        .string()
        .optional()
        .openapi({ description: "Card description" }),
      cover_color: z.string().optional().nullable().openapi({ description: "Cover color (hex)" }),
      cover_image_url: z.string().optional().nullable().openapi({ description: "Cover image URL" }),
    })
    .openapi("UpdateCardRequest"),

  AddMember: z
    .object({
      userId: z.number().openapi({ description: "User ID to add" }),
    })
    .openapi("AddMemberRequest"),

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
