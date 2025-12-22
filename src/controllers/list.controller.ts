import { Request, Response, NextFunction } from "express";
import listService from "../services/list.service";
import { ServiceResponse, ResponseStatus } from "../provides/service.response";
import { handleServiceResponse } from "../utils/http-handler";

class ListController {
  async getListsByBoard(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (error) {
      next(error);
    }
  }

  async createList(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (error) {
      next(error);
    }
  }

  async updateList(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (error) {
      next(error);
    }
  }

  async moveList(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (error) {
      next(error);
    }
  }


  async copyList(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (error) {
      next(error);
    }
  }
}

export default new ListController();
