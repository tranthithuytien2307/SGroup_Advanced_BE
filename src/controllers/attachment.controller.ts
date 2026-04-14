import { Request, Response } from "express";
import attachmentService from "../services/attachment.service";

class AttachmentController {
  createUploadUrl = async (req: Request, res: Response) => {
    const { card_id, file_name, content_type } = req.body;

    const uploadData = await attachmentService.createUploadUrl(
      Number(card_id),
      file_name,
      content_type,
    );

    res.status(200).json(uploadData);
  };

  upload = async (req: Request, res: Response) => {
    const { card_id, file_name, file_url, file_type } = req.body;

    const attachment = await attachmentService.upload(
      Number(card_id),
      file_name,
      file_url,
      file_type,
    );
    res.status(201).json(attachment);
  };

  delete = async (req: Request, res: Response) => {
    await attachmentService.delete(Number(req.params.id));
    res.json({ message: "Attachment deleted" });
  };

  setCoverFromAttachment = async (req: Request, res: Response) => {
    const { card_id, attachment_id } = req.body;
    await attachmentService.setCoverFromAttachment(card_id, attachment_id);
    res.json({ message: "Cover set from attachment" });
  };

  setCoverColor = async (req: Request, res: Response) => {
    const { card_id, color } = req.body;
    await attachmentService.setCoverColor(card_id, color);
    res.json({ message: "Cover color set" });
  };
}

export default new AttachmentController();
