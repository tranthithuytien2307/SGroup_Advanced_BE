import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const AttachmentSchema = {
  Presign: z.object({
    card_id: z.number().int().positive(),
    file_name: z.string().min(1),
    content_type: z.string().min(1),
  }),

  Upload: z.object({
    card_id: z.number().int().positive(),
    file_name: z.string().min(1),
    file_url: z.string().url(),
    file_type: z.string().min(1),
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
