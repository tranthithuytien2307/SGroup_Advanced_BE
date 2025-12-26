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
};
