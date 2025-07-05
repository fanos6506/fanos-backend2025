import Express from "express";
import controller from "./controller.js";
import auth from "../../../../helper/auth.js";
import upload from "../../../../helper/uploadHandler.js";

export default Express.Router()

  .post("/signUp", controller.signup)
  .post("/verifySignUpOTP", controller.verifySignUpOTP)
  .put("/forgotPassword", controller.forgotPassword)
  .post("/login", controller.login)
  .post("/verifyOTP", controller.verifyOTP)
  .put("/resendOTP", controller.resendOTP)
  .post("/resetPassword", controller.resetPassword)
  .get("/getRecentProducts", controller.getRecentProducts)
  .get("/getPopularProducts", controller.getPopularProducts)
  .get("/getAllProducts", controller.getAllProducts)
  .get("/getBestPriceProduct", controller.getBestPriceProduct)
  .get("/getbestForYouProduct", controller.getbestForYouProduct)
  .get("/getMaintainanceStatus", controller.getMaintainanceStatus)
  .get("/getCountry", controller.getCountry)
  .get("/states/:country", controller.getStates)

  .use(auth.verifyToken)
  .put("/changePassword", controller.changePassword)
  .get("/viewMyProfile", controller.viewMyProfile)
  .put("/followUnfollowUser/:userId", controller.followUnfollowUser)
  .get("/checkMutualFollow/:targetUserId", controller.checkMutualFollow)
  .post("/followerUserList", controller.followerUserList)
  .post("/followingUserList", controller.followingUserList)
  .get("/otherfollowingUserList", controller.otherfollowingUserList)
  .get("/otherfollowerUserList", controller.otherfollowerUserList)
  .post("/addToWishlist", controller.addToWishlist)
  .post("/allWishlist", controller.allWishlist)
  .post("/wishlistDataSearchProductId", controller.wishlistDataSearchProductId)
  .delete("/removeWishlist", controller.removeWishlist)
  .delete("/deleteWishlistData", controller.deleteWishlistData)

  .use(upload.uploadFile)
  .put("/updateProfile", controller.updateProfile);
