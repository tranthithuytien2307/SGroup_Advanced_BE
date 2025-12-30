import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const LabelSchema = {
  GetById: z
    .object({
      board_id: z.string().regex(/^\d+$/, "Board ID must be a number").openapi({
        description: "Board ID",
      }),
    })
    .openapi("GetBoardByIdParams"),

  CreateLabel: z.object({
    name: z
      .string()
      .optional()
      .nullable()
      .openapi({ description: "Label name" }),
    color: z.string().optional().openapi({ description: "Label color" }),
    board_id: z.number().openapi({ description: "Board Id" }),
  }),

  AttachOrDetachLabelToCard: z
    .object({
      card_id: z.number().int().positive().openapi({ description: "Card ID" }),

      label_ids: z
        .array(z.number().int().positive())
        .min(1, "label_ids must contain at least one label id")
        .openapi({ description: "Array of label IDs" }),
    })
    .openapi("AttachLabelToCardBody"),
};
