import { z } from "zod";

export const TemplateSchema = {
  CreateFromTemplateParams: z
    .object({
      templateId: z
        .string()
        .regex(/^\d+$/, "templateId must be a number")
        .openapi({
          description: "Template ID",
          example: "12",
        }),
    })
    .openapi("CreateBoardFromTemplateParams"),

  CreateFromTemplateBody: z
    .object({
      boardName: z
        .string()
        .min(1, "Board name cannot be empty")
        .optional()
        .openapi({
          description: "Optional name for the new board cloned from template",
          example: "My New Kanban Board",
        }),

      visibility: z
        .enum(["private", "workspace", "public"])
        .optional()
        .openapi({
          description: "Visibility level of the new board",
          example: "workspace",
        }),
      workspaceId: z.number().int().positive().openapi({
        description: "ID of the workspace where the new board will be created",
        example: 6,
      }),
    })
    .openapi("CreateBoardFromTemplateBody"),

  GetAllTemplates: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().nullable(),
        cover: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
    )
    .openapi("GetAllTemplatesResponse"),
};

export type CreateFromTemplateParams = z.infer<
  typeof TemplateSchema.CreateFromTemplateParams
>;
export type CreateFromTemplateBody = z.infer<
  typeof TemplateSchema.CreateFromTemplateBody
>;
export type GetAllTemplates = z.infer<typeof TemplateSchema.GetAllTemplates>;
