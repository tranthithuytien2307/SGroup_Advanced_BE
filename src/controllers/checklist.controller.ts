import { Request, Response } from "express";
import checklistService from "../services/checklist.service";
import { ServiceResponse, ResponseStatus } from "../provides/service.response";
import { handleServiceResponse } from "../utils/http-handler";

class ChecklistController {
  createChecklist = async (req: Request, res: Response) => {
    const { card_id, title } = req.body;

    const data = await checklistService.createChecklist(card_id, title);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Checklist created successfully",
        data,
        200
      ),
      res
    );
  };

  addItem = async (req: Request, res: Response) => {
    const { checklist_id, content } = req.body;

    const data = await checklistService.addItem(checklist_id, content);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Item added successfully",
        data,
        200
      ),
      res
    );
  };

  updateItem = async (req: Request, res: Response) => {
    const { item_id, content } = req.body;

    await checklistService.updateItem(item_id, content);

    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Sucess, "Item updated", null, 200),
      res
    );
  };

  toggleItem = async (req: Request, res: Response) => {
    const { item_id, is_completed } = req.body;

    await checklistService.toggleItem(item_id, is_completed);

    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Sucess, "Item toggled", null, 200),
      res
    );
  };

  deleteItem = async (req: Request, res: Response) => {
    await checklistService.deleteItem(Number(req.params.id));

    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Sucess, "Item deleted", null, 200),
      res
    );
  };

  getProgress = async (req: Request, res: Response) => {
    const progress = await checklistService.getProgress(Number(req.params.id));

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Checklist progress",
        { progress },
        200
      ),
      res
    );
  };
}

export default new ChecklistController();
