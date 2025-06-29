import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";

export default Express.Router()
  .get("/faqList", controller.faqList)
  .use(auth.verifyToken)

  .post("/addFAQ", controller.addFAQ)
  .get("/viewFAQ", controller.viewFAQ)
  .put("/editFAQ", controller.editFAQ)
  .delete("/deleteFAQ", controller.deleteFAQ);
