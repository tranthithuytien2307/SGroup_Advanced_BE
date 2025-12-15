import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import templateService from "../services/template.service";
import { handleServiceResponse } from "../utils/http-handler";
import { ResponseStatus, ServiceResponse } from "../provides/service.response";

class TemplateController {
  createBoardFromTemplate = async (req: Request, res: Response) => {
    const templateId = Number(req.params.templateId);
    const ownerId = Number((req as any).user.id);
    const { boardName, visibility, workspaceId } = req.body;

    const newBoard = await templateService.createBoardFromTemplate({
      templateId,
      ownerId,
      boardName,
      visibility,
      workspaceId
    });

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Board created from template",
        newBoard,
        200
      ),
      res
    );
  };

  getAllTemplates = async (req: Request, res: Response) => {
    const templates = await templateService.getAll();

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Fetched all templates",
        templates,
        200
      ),
      res
    );
  };
}

export default new TemplateController();
