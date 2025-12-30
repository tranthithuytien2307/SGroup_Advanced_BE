import { Request, Response } from "express";
import cardService from "../services/card.service";
import { ServiceResponse, ResponseStatus } from "../provides/service.response";
import { handleServiceResponse } from "../utils/http-handler";

class CardController {
  async createCard(req: Request, res: Response) {
    const { list_id, title } = req.body;

    const card = await cardService.createCard(list_id, title);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Create card successfully",
        card,
        201
      ),
      res
    );
  }

  async updateCard(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const data = req.body;

    const card = await cardService.updateCard(id, data);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Update card successfully",
        card,
        200
      ),
      res
    );
  }

  async archiveCard(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    const card = await cardService.archiveCard(id);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Archive card successfully",
        card,
        200
      ),
      res
    );
  }

  async unarchiveCard(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    const card = await cardService.unarchiveCard(id);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Unarchive card successfully",
        card,
        200
      ),
      res
    );
  }

  async reorderCard(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { newIndex } = req.body;

    const cards = await cardService.reorderCard(id, newIndex);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Reorder card successfully",
        cards,
        200
      ),
      res
    );
  }

  async moveCard(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { toBoardId, toListId, newIndex } = req.body;

    const cards = await cardService.moveCard(id, toBoardId, toListId, newIndex);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Move card successfully",
        cards,
        200
      ),
      res
    );
  }

  async copyCard(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { toBoardId, toListId, newIndex, newTitle } = req.body;

    const card = await cardService.copyCard(
      id,
      toBoardId,
      toListId,
      newIndex,
      newTitle
    );

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Copy card successfully",
        card,
        201
      ),
      res
    );
  }

  setDates = async (req: Request, res: Response) => {
    const { card_id, start_date, deadline_date } = req.body;

    const data = await cardService.setDates(
      card_id,
      start_date ? new Date(start_date) : null,
      deadline_date ? new Date(deadline_date) : null
    );
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Card dates updated successfully",
        data,
        200
      ),
      res
    );
  };
  async addMember(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { userId } = req.body;

    const card = await cardService.addMember(id, userId);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Add member successfully",
        card,
        200
      ),
      res
    );
  }

  markCompleted = async (req: Request, res: Response) => {
    const { card_id } = req.body;

    const data = await cardService.markCompleted(card_id);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Card marked as completed",
        data,
        200
      ),
      res
    );
  };

  async removeMember(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);

    const card = await cardService.removeMember(id, userId);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Remove member successfully",
        card,
        200
      ),
      res
    );
  }

  getStatus = async (req: Request, res: Response) => {
    const card_id = Number(req.params.card_id);

    const data = await cardService.getDateStatus(card_id);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Card date status retrieved",
        data,
        200
      ),
      res
    );
  };
}

export default new CardController();
