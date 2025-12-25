import { Request, Response, NextFunction } from "express";
import listService from "../services/list.service";
import { ServiceResponse, ResponseStatus } from "../provides/service.response";
import { handleServiceResponse } from "../utils/http-handler";

class ListController {
  async getListsByBoard(req: Request, res: Response) {
    const boardId = parseInt(req.params.board_id);
    const lists = await listService.getListsByBoard(boardId);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Get lists successfully",
        lists,
        200
      ),
      res
    );
  }

  async createList(req: Request, res: Response) {
    const { board_id, name, coverUrl } = req.body;
    const list = await listService.createList(board_id, name, coverUrl);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Create list successfully",
        list,
        201
      ),
      res
    );
  }

  async updateList(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const data = req.body;
    const list = await listService.updateList(id, data);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Update list successfully",
        list,
        200
      ),
      res
    );
  }

  async archiveList(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const list = await listService.archiveList(id);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Archive list successfully",
        list,
        200
      ),
      res
    );
  }

  async moveList(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { newBoardId, newIndex } = req.body;
    const list = await listService.moveList(id, newBoardId, newIndex);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Move list successfully",
        list,
        200
      ),
      res
    );
  }


  async copyList(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { newName } = req.body;

    const list = await listService.copyList(id, newName);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Copy list successfully",
        list,
        201
      ),
      res
    );
  }

  async reorderList(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { newIndex } = req.body;
    const lists = await listService.reorderList(id, newIndex);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Reorder list successfully",
        lists,
        200
      ),
      res
    );
  }
}

export default new ListController();
