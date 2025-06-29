import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";

export default Express.Router()

  .use(auth.verifyToken)
  .post("/addOrder", controller.addOrder)
  .put("/acceptOrderRequest", controller.acceptOrderRequest)
  .put("/rejectOrderRequest", controller.rejectOrderRequest)
  .delete("/deleteOrder", controller.deleteOrder)
  .get("/orderList", controller.orderList)
  .post("/orderHistory", controller.orderHistory)
  .put("/updateDeliveryCharge", controller.updateDeliveryCharge)
  .put("/getOrderTotal", controller.getOrderTotal);
