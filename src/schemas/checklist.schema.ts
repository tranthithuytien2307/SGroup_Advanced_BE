import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ChecklistSchema = {
  ChecklistIdParam: z
    .object({
      id: z
        .string()
        .regex(/^\d+$/, "Checklist ID must be a number")
        .openapi({ description: "Checklist ID" }),
    })
    .openapi("ChecklistIdParams"),

  ItemIdParam: z
    .object({
      id: z
        .string()
        .regex(/^\d+$/, "Item ID must be a number")
        .openapi({ description: "Checklist Item ID" }),
    })
    .openapi("ChecklistItemIdParams"),

  CreateChecklist: z
    .object({
      card_id: z.number().int().positive().openapi({ description: "Card ID" }),

      title: z
        .string()
        .min(1, "Title is required")
        .openapi({ description: "Checklist title" }),
    })
    .openapi("CreateChecklistBody"),

  AddItem: z
    .object({
      checklist_id: z
        .number()
        .int()
        .positive()
        .openapi({ description: "Checklist ID" }),

      content: z
        .string()
        .min(1, "Content is required")
        .openapi({ description: "Item content" }),
    })
    .openapi("AddChecklistItemBody"),

  UpdateItem: z
    .object({
      item_id: z
        .number()
        .int()
        .positive()
        .openapi({ description: "Checklist Item ID" }),

      content: z
        .string()
        .min(1, "Content is required")
        .openapi({ description: "Updated item content" }),
    })
    .openapi("UpdateChecklistItemBody"),

  ToggleItem: z
    .object({
      item_id: z
        .number()
        .int()
        .positive()
        .openapi({ description: "Checklist Item ID" }),

      is_completed: z.boolean().openapi({ description: "Completion status" }),
    })
    .openapi("ToggleChecklistItemBody"),
};
