import { Request, Response } from "express";
import boardService from "../services/board.service";
import { ServiceResponse, ResponseStatus } from "../provides/service.response";
import {
  AuthFailureError,
  BadRequestError,
  NotFoundError,
} from "../handler/error.response";
import { handleServiceResponse } from "../utils/http-handler";

class BoardController {
  getAll = async (_req: Request, res: Response) => {
    const boards = await boardService.getAll();
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Boards retrieved successfully",
        boards,
        200
      ),
      res
    );
  };

  getById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.board_id, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestError("Invalid Board Id");
    }
    if (!id) {
      throw new NotFoundError("Board not found");
    }
    const data = await boardService.getById(id);
    if (!data) {
      throw new NotFoundError("Board not found");
    }
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Board retrieved successfully",
        data,
        200
      ),
      res
    );
  };

  create = async (req: Request, res: Response) => {
    const { name, workspace_id, description, cover_url } = req.body;
    const userId = (req as any).user?.id;
    if (!name || !workspace_id) {
      throw new BadRequestError("Board name and workspace are required");
    }

    if (!userId) {
      throw new AuthFailureError("Unauthorized");
    }
    const data = await boardService.createBoard(
      name,
      workspace_id,
      userId,
      cover_url,
      description
    );
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Board created successfully",
        data,
        201
      ),
      res
    );
  };

  update = async (req: Request, res: Response) => {
    const id = parseInt(req.params.board_id, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestError("Invalid Board Id");
    }
    if (!id) {
      throw new NotFoundError("Board not found");
    }
    const {
      name,
      cover_url,
      description,
      theme,
    } = req.body;
    const data = await boardService.updateBoard(
      id,
      name,
      cover_url,
      description,
      theme,
    );
    if (!data) {
      throw new NotFoundError("Board not found");
    }
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Board updated successfully",
        data,
        200
      ),
      res
    );
  };

  updateVisibility = async (req: Request, res: Response) => {
    const id = parseInt(req.params.board_id, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestError("Invalid Board Id");
    }
    if (!id) {
      throw new NotFoundError("Board not found");
    }
    const { visibility } = req.body;
    const data = await boardService.updateVisibility(id, visibility);
    if (!data) {
      throw new NotFoundError("Board not found");
    }
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Board visibility updated successfully",
        data,
        200
      ),
      res
    );
  }

  archive = async (req: Request, res: Response) => {
    const id = parseInt(req.params.board_id, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestError("Invalid Board Id");
    }
    const data = await boardService.archiveBoard(id);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Board archived successfully",
        data,
        200
      ),
      res
    );
  }

  unarchive = async (req: Request, res: Response) => {
    const id = parseInt(req.params.board_id, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestError("Invalid Board Id");
    }
    const data = await boardService.unarchiveBoard(id);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Board unarchived successfully",
        data,
        200
      ),
      res
    );
  }

  delete = async (req: Request, res: Response) => {
    const id = parseInt(req.params.board_id, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestError("Invalid Board Id");
    }
    await boardService.deleteBoard(id);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Board deleted successfully",
        null,
        200
      ),
      res
    );
  };

  getByWorkspaceId = async (req: Request, res: Response) => {
    const workspaceId = parseInt(req.params.workspace_id, 10);
    if (Number.isNaN(workspaceId)) {
      throw new BadRequestError("Invalid Workspace Id");
    }
    const data = await boardService.getBoardsByWorkspaceId(workspaceId);
    if (!data || data.length === 0) {
      throw new NotFoundError("No boards found for this workspace");
    }
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Boards retrieved successfully",
        data,
        200
      ),
      res
    );
  };
}

export default new BoardController();
