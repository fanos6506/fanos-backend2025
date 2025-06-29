import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";

export default Express.Router()

  .get("/getGestUserNotificationList", controller.getGestUserNotificationList)

  .use(auth.verifyToken)

  .post("/onNotification", controller.onNotification)
  .post("/listNotification", controller.listNotification)
  .get("/viewNotification/:_id", controller.viewNotification)
  .put("/readNotification", controller.readNotification)
  .put("/readSingleNotification", controller.readSingleNotification)
  .delete("/deleteNotification/:_id", controller.deleteNotification)
  .delete("/clearAllNotification", controller.clearAllNotification)
  .get("/getSingleNotification", controller.getSingleNotification)
  .post("/getNotificationListbyAdmin", controller.getNotificationListbyAdmin)
  .get("/getGestUserNotificationList", controller.getGestUserNotificationList);
