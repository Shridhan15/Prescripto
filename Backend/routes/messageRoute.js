import express from "express";
import { getChatMessages, getUserRecentMessages, sendMessage, sseController } from "../controllers/messageController.js";
import authUser from "../middleware/authUser.js";


const messageRouter = express.Router();

messageRouter.get("/sse/:userId", authUser, sseController);
messageRouter.get("/sse", sseController);
messageRouter.post("/send", authUser, sendMessage);
messageRouter.post("/chat", authUser, getChatMessages);
messageRouter.post("/recent", authUser, getUserRecentMessages);

export default messageRouter;
