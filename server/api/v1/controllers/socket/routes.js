import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";
import upload from "../../../../helper/uploadHandler.js";

export default Express.Router()

  .use(upload.uploadFile)
  .post("/oneToOneChatApi", controller.oneToOneChatApi)

  .use(auth.verifyToken)
  .get("/readChat/:chatId", controller.readChat)
  .post("/chatHistory", controller.chatHistory)
  .delete("/clearChat", controller.clearChat)
  .delete("/deleteMessage", controller.deleteMessage)
  .get("/listUser", controller.listUser);
