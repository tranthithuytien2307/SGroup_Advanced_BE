import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const CommentSchema = {
  Create: z
    .object({
      content: z.string().min(1, "Content is required").openapi({ description: "Comment content" }),
    })
    .openapi("CreateCommentRequest"),
  
  Update: z
    .object({
      content: z.string().min(1, "Content is required").openapi({ description: "Comment content" }),
    })
    .openapi("UpdateCommentRequest"),
};
