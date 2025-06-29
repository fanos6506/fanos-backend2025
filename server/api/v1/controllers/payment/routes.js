import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";
import upload from "../../../../helper/uploadHandler.js";

export default Express.Router()
  .use(auth.verifyToken)
  .get("/checkoutProduct", controller.checkoutProduct)
  .post("/applyCoupon", controller.applyCoupon)
  .post("/checkoutOrder", controller.checkoutOrder)
  .get("/useProductCheckOut", controller.useProductCheckOut);
