import attachmentModel from "../model/attachment.model";
import { BadRequestError } from "../handler/error.response";
import objectStorageService from "./object-storage.service";

class AttachmentService {
  async createUploadUrl(
    card_id: number,
    file_name: string,
    content_type: string,
  ) {
    return objectStorageService.createPresignedUploadUrl({
      folder: `cards/${card_id}/attachments`,
      fileName: file_name,
      contentType: content_type,
    });
  }

  async upload(
    card_id: number,
    file_name: string,
    file_url: string,
    file_type: string,
  ) {
    if (!file_name || !file_url || !file_type) {
      throw new BadRequestError("File metadata is required");
    }

    return attachmentModel.create(
      card_id,
      file_name,
      file_url,
      file_type,
    );
  }

  async delete(id: number) {
    const attachment = await attachmentModel.getById(id);

    if (attachment) {
      await objectStorageService.deleteObjectByUrl(attachment.file_url);
    }

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
