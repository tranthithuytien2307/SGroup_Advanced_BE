import { Request, Response } from "express";
import workspaceService from "../services/workspace.service";
import { handleServiceResponse } from "../utils/http-handler";
import { ResponseStatus, ServiceResponse } from "../provides/service.response";
import { AuthFailureError, BadRequestError, NotFoundError } from "../handler/error.response";
class WorkspaceController {
  getAllWorkspace = async (_req: Request, res: Response) => {
    const data = await workspaceService.getAll();
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Workspaces retrieved successfully",
        data,
        200
      ),
      res
    );
  };

  getWorkspaceById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.workspace_id, 10);
    if (Number.isNaN(id)) {
      throw new NotFoundError("Invalid workspace id");
    }
    const data = await workspaceService.getById(id);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Workspace retrieved successfully",
        data,
        200
      ),
      res
    );
  };

  createWorkspace = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const userId = Number((req as any).user.id);

    if (!name) {
      throw new BadRequestError("Workspace name is required");
    }

    if (!userId) {
      throw new AuthFailureError("Unauthorized");
    }

    const data = await workspaceService.createWorkspace(name, description, userId);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Workspace created successfully",
        data,
        201
      ),
      res
    );
  };

  updateWorkspace = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      throw new NotFoundError("Invalid workspace id");
    }

    const { name, description, is_active } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestError("Unauthorized");
    }

    const data = await workspaceService.updateWorkspace(
      id,
      name,
      description,
      is_active,
      userId
    );
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Workspace updated successfully",
        data,
        200
      ),
      res
    );
  };

  deleteWorkspace = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      throw new NotFoundError("Invalid workspace id");
    }
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new BadRequestError("Unauthorized");
    }
    const data = await workspaceService.deleteWorkspace(id, userId);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Workspace deleted successfully",
        data,
        200
      ),
      res
    );
  };
}

export default new WorkspaceController();
