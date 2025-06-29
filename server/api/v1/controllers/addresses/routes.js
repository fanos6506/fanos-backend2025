import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";

export default Express.Router()

  .use(auth.verifyToken)
  .get("/getAddresses", controller.getAddresses)
  .post("/createAddress", controller.createAddress)
  .put("/updateAddress", controller.updateAddress)
  .delete("/deleteAddress", controller.deleteAddress)
  .get("/getAddressList", controller.getAddressList);
