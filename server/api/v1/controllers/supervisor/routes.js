import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";
import upload from "../../../../helper/uploadHandler.js";

export default Express.Router()

  .use(auth.verifyToken)
  .post("/createCoupon", controller.createCoupon)
  .get("/getAllCouponList", controller.getAllCouponList)
  .get("/getSingleCouponData", controller.getSingleCouponData)
  .delete("/deleteCoupon", controller.deleteCoupon)
  .delete("/deleteAllCoupons", controller.deleteAllCoupons)
  .put("/blockCouponStatus", controller.blockCouponStatus)
  .put("/blockAndUnblockCoupon", controller.blockAndUnblockCoupon)
  .put("/updateCoupon", controller.updateCoupon);
