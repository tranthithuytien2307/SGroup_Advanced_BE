import attachmentModel from "../model/attachment.model";
import { BadRequestError } from "../handler/error.response";

class AttachmentService {
  async upload(card_id: number, file: Express.Multer.File) {
    if (!file) throw new BadRequestError("File is required");

    return attachmentModel.create(
      card_id,
      file.originalname,
      file.path,
      file.mimetype
    );
  }

  async delete(id: number) {
    await attachmentModel.delete(id);
  }

  async setCoverFromAttachment(card_id: number, attachment_id: number) {
    await attachmentModel.setCoverFromAttachment(card_id, attachment_id);
  }

  async setCoverColor(card_id: number, color: string) {
    await attachmentModel.setCoverColor(card_id, color);
  }
}

export default new AttachmentService();
