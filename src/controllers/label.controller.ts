import { Request, Response } from "express";
import labelService from "../services/label.service";
import { ServiceResponse, ResponseStatus } from "../provides/service.response";
import { handleServiceResponse } from "../utils/http-handler";

class LabelController {
  createLabel = async (req: Request, res: Response) => {
    const { board_id, name, color } = req.body;
    const data = await labelService.createLabel(board_id, name ?? null, color);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Label created successfully",
        data,
        200
      ),
      res
    );
  };

  getLabelByBoardId = async (req: Request, res: Response) => {
    const board_id = parseInt(req.params.board_id, 10);
    const data = await labelService.getLabelByBoardId(board_id);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Label retrieved successfully",
        data,
        200
      ),
      res
    );
  };

  attachLabelsToCard = async (req: Request, res: Response) => {
    const { card_id, label_ids } = req.body;

    const data = await labelService.attachLabelsToCard(card_id, label_ids);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Labels attached to card successfully",
        data,
        200
      ),
      res
    );
  };

  detachLabelsFromCard = async (req: Request, res: Response) => {
    const { card_id, label_ids } = req.body;

    await labelService.detachLabelsFromCard(card_id, label_ids);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Labels detached successfully",
        null,
        200
      ),
      res
    );
  };
}

export default new LabelController();
