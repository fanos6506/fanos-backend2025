import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";
import upload from "../../../../helper/uploadHandler.js";

export default Express.Router()

  .get("/viewCategory", controller.viewCategory)
  .get("/listCategory", controller.listCategory)
  .get("/viewSubCategory", controller.viewSubCategory)
  .get("/listSubCategory", controller.listSubCategory)
  .get("/listCategoryAndSubCategory", controller.listCategoryAndSubCategory)

  .use(auth.verifyToken)
  .use(upload.uploadFile)
  .use(auth.isAdmin)
  .post("/createCategory", controller.createCategory)
  .put("/updateCategory", controller.updateCategory)
  .delete("/deleteCategory", controller.deleteCategory)
  .post("/createSubCategory", controller.createSubCategory)
  .put("/updateSubCategory", controller.updateSubCategory)
  .delete("/deleteSubCategory", controller.deleteSubCategory)
  .put("/blockUnblockCategory", controller.blockUnblockCategory)
  .put("/blockUnblockSubCategory", controller.blockUnblockSubCategory)
