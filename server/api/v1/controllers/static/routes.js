import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";

export default Express.Router()

  .post("/addStaticContent", controller.addStaticContent)
  .get("/viewStaticContent/:type", controller.viewStaticContent)
  .put("/editStaticContent", controller.editStaticContent)
  .get("/staticContentList", controller.staticContentList)
  .delete("/deletestaticContent", auth.verifyToken ,auth.isAdmin ,controller.deletestaticContent);
 