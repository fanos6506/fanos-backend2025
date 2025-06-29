import jwt from "jsonwebtoken";
import config from "config";
import userModel from "../models/user.js";
import apiError from "./apiError.js";
import responseMessage from "../../assets/responseMessage.js";
import mongoose from "mongoose";

const auth = {
  // ✅ Verify token for REST APIs
  verifyToken: async (req, res, next) => {
    

    try {
      const token = req.headers.token;
      if (!token) {
        return res.status(401).json({ responseMessage: responseMessage.NO_TOKEN });
      }

      const decoded = jwt.verify(token, config.get("jwtsecret"));
      

      const user = await userModel.findOne({ _id: new mongoose.Types.ObjectId(decoded._id) });
      if (!user) {
        return res.status(404).json({ responseMessage: "User not found." });
      }

      if (user.status === "BLOCKED") {
        return res.status(403).json({ responseMessage: "You are blocked by admin." });
      }

      if (user.status === "DELETE") {
        return res.status(402).json({ responseMessage: "Your account was deleted." });
      }

      req.userId = user._id;
      req.userDetails = user;
      
      return next();

    } catch (err) {
      console.error("🔥 [verifyToken] Error:", err);
      if (err.name === "TokenExpiredError") {
        return res.status(440).json({ responseMessage: "Session expired. Please login again." });
      }
      return res.status(401).json({ responseMessage: "Unauthorized." });
    }
  },

  // ✅ Check if user is admin
  isAdmin: async (req, res, next) => {
    

    if (!req.userId) {
      return res.status(401).json({
        responseCode: 401,
        responseMessage: responseMessage.USER_NOT_FOUND,
      });
    }

    try {
      const admin = await userModel.findOne({
        _id: req.userId,
        userType: "ADMIN",
      });

      if (!admin) {
        return res.status(401).json({
          responseCode: 401,
          responseMessage: "User is not admin.",
        });
      }

      
      return next();
    } catch (error) {
      console.error("❌ [isAdmin] DB error:", error);
      return next(error);
    }
  },

  // ✅ Token verification for WebSocket
  verifyTokenBySocket: (token) => {
    console.log("🔌 [verifyTokenBySocket] Token verification for socket started...");

    return new Promise(async (resolve, reject) => {
      if (!token) {
        console.log("❌ [verifyTokenBySocket] No token provided.");
        return reject(apiError.badRequest(responseMessage.NO_TOKEN));
      }

      try {
        const decoded = jwt.verify(token, config.get("jwtsecret"));
        console.log("✅ [verifyTokenBySocket] Token decoded:", decoded);

        const user = await userModel.findOne({ _id: new mongoose.Types.ObjectId(decoded._id) });

        if (!user) {
          console.log("❌ [verifyTokenBySocket] User not found.");
          return reject(apiError.notFound(responseMessage.USER_NOT_FOUND));
        }

        if (user.status === "BLOCKED") {
          console.log("🚫 [verifyTokenBySocket] User is blocked by admin.");
          return reject(apiError.forbidden(responseMessage.BLOCK_BY_ADMIN));
        }

        if (user.status === "DELETE") {
          console.log("❌ [verifyTokenBySocket] User deleted by admin.");
          return reject(apiError.unauthorized(responseMessage.DELETE_BY_ADMIN));
        }

        console.log("✅ [verifyTokenBySocket] Socket user authorized.");
        resolve(user._id);

      } catch (err) {
        console.log("❌ [verifyTokenBySocket] Invalid token:", err.message);
        return reject(apiError.unauthorized());
      }
    });
  }
};

export default auth;
