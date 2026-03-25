import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const AttachmentSchema = {
  Upload: z.object({
    card_id: z.number().int().positive(),
  }),

  SetCoverFromAttachment: z.object({
    card_id: z.number().int().positive(),
    attachment_id: z.number().int().positive(),
  }),

  SetCoverColor: z.object({
    card_id: z.number().int().positive(),
    color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i),
  }),
};
