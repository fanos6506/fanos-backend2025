import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";
import uploadHandler from "../../../../helper/uploadHandler.js";

export default Express.Router()

  .get("/get-all-advertisement", controller.getAllAdvertisement)
  .get(
    "/get-all-advertisement-for-admin",
    controller.getAllAdvertisementForAdmin
  )

  .use(auth.verifyToken)
  .put(
    "/blockAndUnblockAdvertisementStatus",
    controller.blockAndUnblockAdvertisementStatus
  )
  .delete("/deleteAdvertisement", controller.deleteAdvertisement)

  .use(uploadHandler.uploadFile)
  .post("/addadvertisement", controller.addadvertisement)
  .put("/updateAdvertisementData", controller.updateAdvertisementData);
