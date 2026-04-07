import { Request, Response } from "express";
import commentService from "../services/comment.service";
import { ServiceResponse, ResponseStatus } from "../provides/service.response";
import { handleServiceResponse } from "../utils/http-handler";
import { io } from "../index";

class CommentController {
  async createComment(req: Request, res: Response) {
    const { cardId } = req.params;
    const { content, clientId } = req.body;
    const userId = (req as any).user.id;

    const comment = await commentService.createComment(
      Number(cardId),
      userId,
      content,
    );

    const payload = {
      ...comment,
      clientId,
    };

    io.to(`card-${cardId}`).emit("comment-created", payload);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Create comment successfully",
        comment,
        201,
      ),
      res,
    );
  }

  async updateComment(req: Request, res: Response) {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.id;

    const comment = await commentService.updateComment(
      Number(commentId),
      userId,
      content,
    );
    io.emit("comment-updated", comment);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Update comment successfully",
        comment,
        200,
      ),
      res,
    );
  }

  async deleteComment(req: Request, res: Response) {
    const { commentId } = req.params;
    const userId = (req as any).user.id;
    const comment = await commentService.getCommentById(Number(commentId));

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    await commentService.deleteComment(Number(commentId), userId);

    io.to(`card-${comment.card_id}`).emit("comment-deleted", {
      commentId: Number(commentId),
      cardId: comment.card_id,
    });

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Delete comment successfully",
        null,
        200,
      ),
      res,
    );
  }

  async getCommentsByCardId(req: Request, res: Response) {
    const { cardId } = req.params;

    const comments = await commentService.getCommentsByCardId(Number(cardId));

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Get comments by card id successfully",
        comments,
        200,
      ),
      res,
    );
  }
}

export default new CommentController();
