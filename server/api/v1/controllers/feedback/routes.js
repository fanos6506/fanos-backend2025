import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";

export default Express.Router()

  .post("/addFeedback", controller.addFeedback)

  .use(auth.verifyToken)
  .get("/getFeedback", controller.getFeedback)
  .get("/getSingleFeedback", controller.getSingleFeedback);
