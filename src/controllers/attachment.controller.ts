import { Request, Response } from "express";
import attachmentService from "../services/attachment.service";

class AttachmentController {
  upload = async (req: Request, res: Response) => {
    const card_id = Number(req.body.card_id);
    const file = req.file!;

    const attachment = await attachmentService.upload(card_id, file);
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
