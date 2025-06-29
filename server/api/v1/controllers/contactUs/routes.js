import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";

export default Express.Router()

  .get("/viewcontactus", controller.viewcontactus)
  .get("/listContactUs", controller.listContactUs)

  .use(auth.verifyToken)
  .post("/createContactUs", controller.createContactUs);
