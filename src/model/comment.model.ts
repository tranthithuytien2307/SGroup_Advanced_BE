import { AppDataSource } from "../data-source";
import { Comment } from "../entities/comment.entity";

class CommentModel {
  private repo = AppDataSource.getRepository(Comment);

  async create(data: Partial<Comment>) {
    const comment = this.repo.create(data);
    return await this.repo.save(comment);
  }

  async getById(id: number) {
    return await this.repo.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  async update(comment: Comment) {
    return await this.repo.save(comment);
  }

  async delete(id: number) {
    return await this.repo.delete(id);
  }

  async getByCardId(cardId: number) {
    return await this.repo.find({
      where: { card_id: cardId },
      relations: ["user"],
      order: { created_at: "ASC" },
    });
  }
}

export default new CommentModel();
