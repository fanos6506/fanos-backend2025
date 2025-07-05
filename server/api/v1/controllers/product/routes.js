import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";
import upload from "../../../../helper/uploadHandler.js";

export default Express.Router()
  .get("/serchProduct", auth.verifyTokenOptional, controller.serchProduct)
  .post("/listProduct", auth.verifyTokenOptional, controller.listProduct)
  .get("/viewProduct", auth.verifyTokenOptional, controller.viewProduct)
  .post("/sortingAndSearchingProduct", auth.verifyTokenOptional, controller.sortingAndSearchingProduct)
  .post("/listedProduct", auth.verifyTokenOptional, controller.listedProduct)

  .use(auth.verifyToken)

  .post("/myProductList", controller.myProductList)
  .post("/myProductListwithStatus", controller.myProductListwithStatus)

  .delete("/deleteProduct", controller.deleteProduct)
  .post("/sellerProfile", controller.sellerProfile)
  .put("/updateProductStatus", controller.updateProductStatus)
  .post("/searchProductApi", controller.searchProductApi)

  .put("/likeUnlikeProduct", controller.likeUnlikeProduct)
  .get("/myLikesProduct", controller.myLikesProduct)

  .post("/createReport", controller.createReport)
  .post("/createReportSeller", controller.createReportSeller)
  .get("/checkStatus", controller.checkStatus)
  .post("/addRecentSearch", controller.addRecentSearch)
  .get("/getRecentSearch", controller.getRecentSearch)

  .use(upload.uploadFile)
  .post("/addProduct", controller.addProduct)
  .post("/updateProduct", controller.updateProduct);
