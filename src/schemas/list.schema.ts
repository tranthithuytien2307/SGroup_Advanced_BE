import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ListSchema = {
  GetById: z
    .object({
      id: z.string().regex(/^\d+$/, "List ID must be a number").openapi({
        description: "List ID",
      }),
    })
    .openapi("GetListByIdParams"),
  Create: z
    .object({
      name: z
        .string()
        .min(3, "List name must be at least 3 characters")
        .openapi({
          description: "List name",
        }),
      board_id: z
        .number()
        .or(
          z
            .string()
            .regex(/^\d+$/, "Board ID must be a number")
            .transform(Number)
        )
        .openapi({ description: "Board ID" }),
      coverUrl: z
        .string()
        .url()
        .optional()
        .openapi({ description: "Cover URL" }),
    })
    .openapi("CreateListRequest"),
  Update: z
    .object({
      version: z
        .number()
        .int()
        .nonnegative()
        .openapi({ description: "Current list version" }),
      name: z.string().min(3).optional().openapi({ description: "List name" }),
      cover_url: z
        .string()
        .url()
        .optional()
        .openapi({ description: "Cover URL" }),
    })
    .refine((b) => b.name !== undefined || b.cover_url !== undefined, {
      message: "At least one field must be provided",
    })
    .openapi("UpdateListRequest"),
  Move: z
    .object({
      newBoardId: z
        .number()
        .or(
          z
            .string()
            .regex(/^\d+$/, "List board new must be a number")
            .transform(Number),
        )
        .openapi({
          description: "List ID",
        }),
      board_version: z
        .number()
        .int()
        .nonnegative()
        .openapi({ description: "Current source board version" }),
      target_board_version: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .openapi({
          description: "Current target board version if moving across boards",
        }),
      newIndex: z
        .number()
        .min(0)
        .openapi({ description: "New index of the list" }),
    })
    .openapi("MoveListRequest"),
  Copy: z
    .object({
      newName: z
        .string()
        .min(3, "New list name must be at least 3 characters")
        .openapi({
          description: "New list name",
        }),
    })
    .openapi("CopyListRequest"),

  Reorder: z
    .object({
      board_version: z
        .number()
        .int()
        .nonnegative()
        .openapi({ description: "Current board version" }),
      newIndex: z
        .number()
        .min(0)
        .openapi({ description: "New index of the list" }),
    })
    .openapi("ReorderListRequest"),
};

export type CreateListInput = z.infer<typeof ListSchema.Create>;
export type UpdateListInput = z.infer<typeof ListSchema.Update>;
export type MoveListInput = z.infer<typeof ListSchema.Move>;
export type CopyListInput = z.infer<typeof ListSchema.Copy>;
export type GetListByIdInput = z.infer<typeof ListSchema.GetById>;
export type ReorderListInput = z.infer<typeof ListSchema.Reorder>;
