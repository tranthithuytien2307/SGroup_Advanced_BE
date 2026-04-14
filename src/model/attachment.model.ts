import { AppDataSource } from "../data-source";
import { Attachment } from "../entities/attachment.entity";
import { Card } from "../entities/card.entity";

class AttachmentModel {
  private attachmentRepo = AppDataSource.getRepository(Attachment);
  private cardRepo = AppDataSource.getRepository(Card);

  async create(
    card_id: number,
    file_name: string,
    file_url: string,
    file_type: string
  ): Promise<Attachment> {
    const attachment = this.attachmentRepo.create({
      card_id,
      file_name,
      file_type,
      file_url,
    });
    return await this.attachmentRepo.save(attachment);
  }

  async getById(id: number): Promise<Attachment | null> {
    return await this.attachmentRepo.findOne({
      where: { id },
    });
  }

  async delete(id: number): Promise<void> {
    await this.attachmentRepo.delete({ id });
  }

  async clearCover(card_id: number): Promise<void> {
    const attachment = this.attachmentRepo.update(
      { card_id },
      { is_cover: false }
    );
  }

  async setCoverFromAttachment(card_id: number, attachment_id: number) {
    await this.clearCover(card_id);

    const attachment = await this.attachmentRepo.findOneBy({
      id: attachment_id,
    });
    if (!attachment) return;

    await this.attachmentRepo.update({ id: attachment_id }, { is_cover: true });

    await this.cardRepo.update(
      { id: card_id },
      {
        cover_url: attachment.file_url,
        cover_color: null,
      }
    );
  }

  async setCoverColor(card_id: number, color: string) {
    await this.clearCover(card_id);

    await this.cardRepo.update(
      { id: card_id },
      {
        cover_color: color,
        cover_url: null,
      }
    );
  }
}

export default new AttachmentModel();
