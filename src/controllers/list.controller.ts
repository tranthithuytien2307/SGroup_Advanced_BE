import { Request, Response, NextFunction } from "express";
import listService from "../services/list.service";
import { ServiceResponse, ResponseStatus } from "../provides/service.response";
import { handleServiceResponse } from "../utils/http-handler";
import boardRealtimeService from "../services/board-realtime.service";

class ListController {
  async getListsByBoard(req: Request, res: Response) {
    const boardId = parseInt(req.params.board_id);
    const lists = await listService.getListsByBoard(boardId);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Get lists successfully",
        lists,
        200,
      ),
      res,
    );
  }

  async createList(req: Request, res: Response) {
    const { board_id, name, coverUrl } = req.body;
    const list = await listService.createList(board_id, name, coverUrl);
    await boardRealtimeService.emitBoardState(Number(board_id), "list_created");
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Create list successfully",
        list,
        201,
      ),
      res,
    );
  }

  async updateList(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const data = req.body;
    const list = await listService.updateList(id, data);
    if (list?.board_id) {
      await boardRealtimeService.emitBoardState(list.board_id, "list_updated");
    }
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Update list successfully",
        list,
        200,
      ),
      res,
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
        200,
      ),
      res,
    );
  }

  unarchiveList = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const list = await listService.unarchiveList(id);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Unarchive list successfully",
        list,
        200,
      ),
      res,
    );
  };

  async moveList(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { newBoardId, newIndex, board_version, target_board_version } = req.body;
    const result = await listService.moveList(id, Number(newBoardId), newIndex, {
      boardVersion: board_version,
      targetBoardVersion: target_board_version,
    });
    await boardRealtimeService.emitManyBoardStates(
      result.boardIds,
      "list_reordered",
    );
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Move list successfully",
        result.list,
        200,
      ),
      res,
    );
  }

  async deleteList(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      throw new Error("Invalid List Id");
    }
    await listService.deleteList(id);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Delete list successfully",
        null,
        200,
      ),
      res,
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
        201,
      ),
      res,
    );
  }

  async reorderList(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { newIndex, board_version } = req.body;
    const lists = await listService.reorderList(id, newIndex, board_version);
    const boardId = lists[0]?.board_id;
    if (boardId) {
      await boardRealtimeService.emitBoardState(boardId, "list_reordered");
    }
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Reorder list successfully",
        lists,
        200,
      ),
      res,
    );
  }
}

export default new ListController();
