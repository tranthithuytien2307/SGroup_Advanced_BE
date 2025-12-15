import userRouter from "./user.route";
import authRouter from "./auth.route";
import { Router } from "express";
import workspace from "./workspace.route";
import board from "./board.route";
import workspaceMember from "./workspace-member.route";
import templateBoard from "./template.route";
import listRouter from "./list.route";

const router = Router();
router.use("/", userRouter);
router.use("/auth", authRouter);
router.use("/workspace", workspace);
router.use("/board", board);
router.use("/workspace-member", workspaceMember);
router.use("/templateBoard", templateBoard);
router.use("/list", listRouter);

export default router;
