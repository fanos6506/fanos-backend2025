import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";
import uploadHandler from "../../../../helper/uploadHandler.js";

export default Express.Router()

  .get("/get-all-banners", controller.getAllBanners)
  .get("/getBanner", controller.getBanner)
  .get("/get-all-banners-for-admin", controller.getAllBannersForAdmin)

  .use(auth.verifyToken)

  .use(uploadHandler.uploadFile)
  .post("/addBanner", controller.addbanner)
  .put("/editBanner", controller.editBanner)
  .put("/blockAndUnblockBanner", controller.blockAndUnblockBanner)
  .delete("/deleteBanner", controller.deleteBanner);
