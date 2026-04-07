import userRouter from "./user.route";
import authRouter from "./auth.route";
import { Router } from "express";
import workspace from "./workspace.route";
import board from "./board.route";
import workspaceMember from "./workspace-member.route";
import templateBoard from "./template.route";
import listRouter from "./list.route";
import cardRouter from "./card.route";
import labelRouter from "./label.route";
import checklistRouter from "./checklist.route";
import attachmentRouter from "./attachment.router";
import boardMemberRouter from "./board-member.route";

const router = Router();
router.use("/", userRouter);
router.use("/auth", authRouter);
router.use("/workspace", workspace);
router.use("/board", board);
router.use("/workspace-member", workspaceMember);
router.use("/templateBoard", templateBoard);
router.use("/list", listRouter);
router.use("/card", cardRouter);
router.use("/label", labelRouter);
router.use("/checklist", checklistRouter);
router.use("/attachment", attachmentRouter);
router.use("/board-member", boardMemberRouter);

export default router;
