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
        200,
      ),
      res,
    );
  };

  getAllChecklists = async (req: Request, res: Response) => {
    const data = await checklistService.getAllChecklists();
    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Sucess, "All checklists", data, 200),
      res,
    );
  };

  getChecklistDetail = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = await checklistService.getChecklistById(id);
    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Sucess, "Checklist detail", data, 200),
      res,
    );
  };

  getChecklistByCardId = async (req: Request, res: Response) => {
    const cardId = Number(req.params.cardId);

    const data = await checklistService.getChecklistByCardId(cardId);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Checklists by card id",
        data,
        200,
      ),
      res,
    );
  };

  updateChecklistTitle = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { title } = req.body;
    const data = await checklistService.updateChecklistTitle(id, title);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Checklist updated",
        data,
        200,
      ),
      res,
    );
  };

  deleteChecklist = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await checklistService.deleteChecklist(id);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Checklist deleted",
        null,
        200,
      ),
      res,
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
        200,
      ),
      res,
    );
  };

  updateItem = async (req: Request, res: Response) => {
    const { item_id, content } = req.body;

    await checklistService.updateItem(item_id, content);

    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Sucess, "Item updated", null, 200),
      res,
    );
  };

  toggleItem = async (req: Request, res: Response) => {
    const { item_id, is_completed } = req.body;

    await checklistService.toggleItem(item_id, is_completed);

    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Sucess, "Item toggled", null, 200),
      res,
    );
  };

  deleteItem = async (req: Request, res: Response) => {
    await checklistService.deleteItem(Number(req.params.id));

    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Sucess, "Item deleted", null, 200),
      res,
    );
  };

  getProgress = async (req: Request, res: Response) => {
    const progress = await checklistService.getProgress(Number(req.params.id));

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Checklist progress",
        { progress },
        200,
      ),
      res,
    );
  };
}

export default new ChecklistController();
