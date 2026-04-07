import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const BoardMemberSchema = {
  GetByBoardId: z
    .object({
      board_id: z.string().regex(/^\d+$/, "Board ID must be a number").openapi({
        description: "Board ID",
      }),
    })
    .openapi("GetBoardMembersParams"),
};
