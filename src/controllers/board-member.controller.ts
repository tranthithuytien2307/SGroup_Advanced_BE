import { Request, Response } from "express";
import boardMemberService from "../services/board-member.service";
import { ServiceResponse, ResponseStatus } from "../provides/service.response";
import { handleServiceResponse } from "../utils/http-handler";

class BoardMemberController {
  async getBoardMembers(req: Request, res: Response) {
    const { board_id } = req.params;

    const members = await boardMemberService.getBoardMembers(Number(board_id));

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Get board members successfully",
        members,
        200,
      ),
      res,
    );
  }
}

export default new BoardMemberController();
