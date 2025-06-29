import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";

export default Express.Router()

  .use(auth.verifyToken)
  .use(auth.isAdmin)
  .get("/itemsAdded", controller.itemsAdded)
  .get("/userLog", controller.userLog);
  
