//v7 imports
import user from "./api/v1/controllers/user/routes.js";
import admin from "./api/v1/controllers/admin/routes.js";
import addresses from "./api/v1/controllers/addresses/routes.js";
import category from "./api/v1/controllers/category/routes.js";
import notification from "./api/v1/controllers/notification/routes.js";
import statics from "./api/v1/controllers/static/routes.js";
import product from "./api/v1/controllers/product/routes.js";
import superviser from "./api/v1/controllers/supervisor/routes.js";
import charts from "./api/v1/controllers/charts/routes.js";
import banner from "./api/v1/controllers/banner/routes.js";
import contact from "./api/v1/controllers/contactUs/routes.js";
import feedback from "./api/v1/controllers/feedback/routes.js";
import order from "./api/v1/controllers/order/routes.js";
import socket from "./api/v1/controllers/socket/routes.js";
import advertisement from "./api/v1/controllers/advertisement/routes.js";
import payment from "./api/v1/controllers/payment/routes.js";
import faq from "./api/v1/controllers/faq/routes.js";

/**
 * @export
 * @param {any} app
 */

export default function routes(app) {
  app.use("/api/v1/user", user);
  app.use("/api/v1/admin", admin);
  app.use("/api/v1/addresses", addresses);
  app.use("/api/v1/category", category);
  app.use("/api/v1/notification", notification);
  app.use("/api/v1/static", statics);
  app.use("/api/v1/product", product);
  app.use("/api/v1/superviser", superviser);
  app.use("/api/v1/charts", charts);
  app.use("/api/v1/banner", banner);
  app.use("/api/v1/contact", contact);
  app.use("/api/v1/feedback", feedback);
  app.use("/api/v1/order", order);
  app.use("/api/v1/socket", socket);
  app.use("/api/v1/advertisement", advertisement);
  app.use("/api/v1/payment", payment);
  app.use("/api/v1/faq", faq);

  return app;
}
