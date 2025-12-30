import commentModel from "../model/comment.model";
import cardModel from "../model/card.model";
import {
  NotFoundError,
  ForbiddenError,
  InternalServerError,
  ErrorResponse,
} from "../handler/error.response";

class CommentService {
  async createComment(cardId: number, userId: number, content: string) {
    try {
      const card = await cardModel.getById(cardId);
      if (!card) throw new NotFoundError("Card not found");

      return await commentModel.create({
        card_id: cardId,
        user_id: userId,
        content,
      });
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to create comment");
    }
  }

  async updateComment(commentId: number, userId: number, content: string) {
    try {
      const comment = await commentModel.getById(commentId);
      if (!comment) throw new NotFoundError("Comment not found");

      if (comment.user_id !== userId) {
        throw new ForbiddenError("You can only edit your own comments");
      }

      comment.content = content;
      return await commentModel.update(comment);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to update comment");
    }
  }

  async deleteComment(commentId: number, userId: number) {
    try {
      const comment = await commentModel.getById(commentId);
      if (!comment) throw new NotFoundError("Comment not found");

      if (comment.user_id !== userId) {
        throw new ForbiddenError("You can only delete your own comments");
      }

      await commentModel.delete(commentId);
      return true;
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to delete comment");
    }
  }
}

export default new CommentService();
