import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";
import upload from "../../../../helper/uploadHandler.js";

export default Express.Router()
  .get("/serchProduct", controller.serchProduct)
  .post("/listProduct", controller.listProduct)
  .get("/viewProduct", controller.viewProduct)
  .post("/sortingAndSearchingProduct", controller.sortingAndSearchingProduct)

  .use(auth.verifyToken)

  .post("/myProductList", controller.myProductList)
  .post("/myProductListwithStatus", controller.myProductListwithStatus)

  .delete("/deleteProduct", controller.deleteProduct)
  .post("/sellerProfile", controller.sellerProfile)
  .post("/listedProduct", controller.listedProduct)
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
