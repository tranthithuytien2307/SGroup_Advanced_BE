import { Request, Response } from "express";
import commentService from "../services/comment.service";
import { ServiceResponse, ResponseStatus } from "../provides/service.response";
import { handleServiceResponse } from "../utils/http-handler";

class CommentController {
  async createComment(req: Request, res: Response) {
    const { cardId } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.id;

    const comment = await commentService.createComment(Number(cardId), userId, content);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Create comment successfully",
        comment,
        201
      ),
      res
    );
  }

  async updateComment(req: Request, res: Response) {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.id;

    const comment = await commentService.updateComment(Number(commentId), userId, content);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Update comment successfully",
        comment,
        200
      ),
      res
    );
  }

  async deleteComment(req: Request, res: Response) {
    const { commentId } = req.params;
    const userId = (req as any).user.id;

    await commentService.deleteComment(Number(commentId), userId);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Delete comment successfully",
        null,
        200
      ),
      res
    );
  }
}

export default new CommentController();
