import Joi from "joi";
import joiPasswordImport from "joi-password";
const { joiPasswordExtendCore } = joiPasswordImport;

const joiPassword = Joi.extend(joiPasswordExtendCore);
import  _ from 'lodash';
import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import bcrypt from 'bcryptjs';
import responseMessage from "../../../../../assets/responseMessage.js";
import commonFunction from "../../../../helper/util.js";
import status from "../../../../enums/status.js";
import CouponModel from "../../../../models/coupon.js";
import userType from "../../../../enums/userType.js";

import  userServices  from "../../services/user.js";
const {
  findCount,
  findUser,
  userFindList,
  emailMobileExist,
  updateUser,
  updateUsers,
  updateUserById,
  paginateSearch,
  findAllUser,
} = userServices;

import maintainance from "../../../../models/websiteSetting.js";

import  reportService  from "../../services/report.js";
const { reportList, reportPaginate } = reportService;

import  advertisementServices  from "../../services/advertisement.js";
const {
  createAdvertisement,
  countAdvertisement,
  findAdvertisement,
  updateAdvertisement,
  advertisementList,
  advertisementListPagination,
  multiUpdateAdvertisement,
} = advertisementServices;

import  notificationServices  from "../../services/notification.js";
const { notificationCreate, notificationData, notificationUpdate } =
  notificationServices;

import  productServices  from "../../services/product.js";
const {
  createProduct,
  findProduct,
  updateProduct,
  featureProductsList,
  countProduct,
  productList,
  productListWithPagination,
  ParticularProductListWithPagination,
  findMyLikesProduct,
  listProductV2,
  deleteProduct,
  deleteProducts,
} = productServices;

import  subCategoryServices  from "../../services/subCategory.js";
const {
  createSubCategory,
  findSubCategory,
  updateSubCategory,
  subCategoryList,
  subCategoryListWithPagination,
} = subCategoryServices;

import  categoryServices  from "../../services/category.js";
const {
  createCategory,
  findCategory,
  updateCategory,
  categoryList,
  categoryListWithPagination,
  countCategory,
} = categoryServices;

import  paymentServices  from "../../services/payment.js";
import mongoose from "mongoose";
const {
  createPayment,
  updatePayment,
  findPaymentDeatils,
  paymentAggregate,
  findPayment,
  paginatePaymentSearch,
  paginatePaymentSearchWithOrderType,
} = paymentServices;

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

import bcryptPkg from "bcryptjs";
const { hashSync } = bcryptPkg;

export class adminController {
  /**
   * @swagger
   * /admin/login:
   *   post:
   *     summary: Admin Login
   *     tags:
   *       - Admin
   *     description: Login endpoint for admin users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Admin email address
   *               password:
   *                 type: string
   *                 description: Admin password
   *             required:
   *               - email
   *               - password
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                     _id:
   *                       type: string
   *                     email:
   *                       type: string
   *       401:
   *         description: Invalid credentials
   *       404:
   *         description: Admin not found
   */
  async login(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "in"] } })
        .message("Email is not valid"),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .messages({
          "password.minOfUppercase":
            "password should contain at least {#min} uppercase character",
          "password.minOfSpecialCharacters":
            "password should contain at least {#min} special character",
          "password.minOfLowercase":
            "password should contain at least {#min} lowercase character",
          "password.minOfNumeric":
            "password should contain at least {#min} numeric character",
          "password.noWhiteSpaces": "password should not contain white spaces",
          "password.min": "password length must be password",
        }),
      deviceToken: Joi.string().allow("").optional(),
      deviceType: Joi.string().allow("").optional(),
    });
    try {
      let token;
      const { email, password, deviceToken, deviceType, userTypes } =
        await validationSchema.validateAsync(req.body);
      var userResult = await findUser({
        $and: [
          { status: { $ne: status.DELETE } },
          { email: email },
          { userType: { $ne: userType.USER } },
        ],
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }

      if (
        !userResult.password ||
        !bcrypt.compareSync(password, userResult.password)
      ) {
        throw apiError.invalid(responseMessage.INCORRECT_LOGIN);
      }

      token = await commonFunction.getToken({
        _id: userResult._id,
        email: userResult.email,
        userType: userResult.userType,
      });

      let obj = {
        _id: userResult._id,
        email: userResult.email || userResult.mobileNumber,
        name: userResult.name,
        token: token,
        userType: userResult.userType,
      };
      return res.json(new response(obj, responseMessage.LOGGED_IN));
    } catch (error) {
      return next(error);
    }
  }

  async updateEmail(req, res, next) {
    var validationSchema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "in"] } })
        .message("Email is not valid"),
    });
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      const validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let userExist = await emailMobileExist(
        validatedBody.email,
        userResult._id
      );
      if (userExist) {
        if (userExist.email == validatedBody.email) {
          throw apiError.notFound(responseMessage.EMAIL_EXIST);
        }
      }
      const result = await updateUser({ _id: userResult._id }, validatedBody);
      return res.json(new response(result, responseMessage.USER_UPDATED));
    } catch (error) {
      return next(error);
    }
  }

  async forgotPassword(req, res, next) {
    var validationSchema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "in"] } })
        .message("Email is not valid"),
    });
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      var validatedBody = await validationSchema.validateAsync(req.body);
      const { email } = validatedBody;
      var userResult = await findUser({
        $and: [
          { status: { $ne: status.DELETE } },
          { email: email },
          { userType: userType.ADMIN },
        ],
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var otp = commonFunction.getOTPFourDigit();
      var otpTime = new Date().getTime() + 60000;
      if (userResult.email == email) {
        commonFunction.sendEmailOtp(email, otp);
      }
      var updateResult = await updateUser(
        { _id: userResult._id },
        { otp: otp, otpTime: otpTime }
      );

      return res.json(
        new response(
          { status: true, otp: otp },
          responseMessage.OTP_SEND_SUCCESS
        )
      );
    } catch (error) {
      return next(error);
    }
  }
  async verifyOTP(req, res, next) {
    var validationSchema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "in"] } })
        .message("Email is not valid"),
      otp: Joi.string().required(),
    });
    try {
      var validatedBody = await validationSchema.validateAsync(req.body);

      var userResult = await findUser({
        email: validatedBody.email,
        status: { $ne: status.DELETE },
        userType: userType.ADMIN,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      if (new Date().getTime() > userResult.otpTime) {
        throw apiError.badRequest(responseMessage.OTP_EXPIRED);
      }

      if (userResult.otp !== validatedBody.otp) {
        throw apiError.unauthorized(responseMessage.INVALID_OTP);
      } else {
        const updateResult = await updateUser(
          { _id: userResult._id },
          { otpVerification: true }
        );
      }

      let token = await commonFunction.getToken({
        _id: userResult._id,
        email: userResult.email,
        userType: userResult.userType,
      });

      let obj = {
        token: token,
        status: true,
      };
      return res.json(new response(obj, responseMessage.OTP_VERIFY));
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }

  async resendOtp(req, res, next) {
    var validationSchema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "in"] } })
        .message("Email is not valid"),
    });
    try {
      var validatedBody = await validationSchema.validateAsync(req.body);

      var userResult = await findUser({
        email: validatedBody.email,
        status: { $ne: status.DELETE },
        userType: userType.ADMIN,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      if (userResult.otpVerified) {
        throw apiError.badRequest(responseMessage.OTP_ALREADY_VERIFIED);
      }

      let otp = await commonFunction.getOTPFourDigit();
      let otpTime = new Date().getTime() + 60000;

      const updateResult = await updateUser(
        { _id: userResult._id },
        { otp: otp, otpTime: otpTime }
      );
      await commonFunction.sendEmailOtp(userResult.email, otp);

      return res.json(
        new response({ status: true, otp: otp }, responseMessage.OTP_RESEND)
      );
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }

  async resetPassword(req, res, next) {
    const validationSchema = Joi.object({
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .messages({
          "password.minOfUppercase":
            "password should contain at least {#min} uppercase character",
          "password.minOfSpecialCharacters":
            "password should contain at least {#min} special character",
          "password.minOfLowercase":
            "password should contain at least {#min} lowercase character",
          "password.minOfNumeric":
            "password should contain at least {#min} numeric character",
          "password.noWhiteSpaces": "password should not contain white spaces",
          "password.min": "password length must be password",
        }),
      confirmPassword: Joi.string().required(),
    });
    try {
      const { password, confirmPassword } =
        await validationSchema.validateAsync(req.body);

      var userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        if (password == confirmPassword) {
          let update = await updateUser(
            { _id: userResult._id },
            { password: bcrypt.hashSync(password) }
          );
          return res.json(new response(update, responseMessage.PASSWORD_RESET));
        } else {
          throw apiError.notFound(responseMessage.PASSWORD_NOT_MATCHED);
        }
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async changePassword(req, res, next) {
    const validationSchema = Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .messages({
          "password.minOfUppercase":
            "password should contain at least {#min} uppercase character",
          "password.minOfSpecialCharacters":
            "password should contain at least {#min} special character",
          "password.minOfLowercase":
            "password should contain at least {#min} lowercase character",
          "password.minOfNumeric":
            "password should contain at least {#min} numeric character",
          "password.noWhiteSpaces": "password should not contain white spaces",
          "password.min": "password length must be password",
        }),
      confirmPassword: Joi.ref("newPassword"),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.body);

      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (validatedBody.oldPassword == validatedBody.newPassword) {
        throw apiError.badRequest(responseMessage.PWD_DIFFERENT);
      }
      if (!bcrypt.compareSync(validatedBody.oldPassword, userResult.password)) {
        throw apiError.badRequest(responseMessage.PASSWORD_NOT_MATCHED);
      }
      let updated = await updateUserById(userResult._id, {
        password: bcrypt.hashSync(validatedBody.newPassword),
      });
      return res.json(
        new response({ status: true }, responseMessage.PASSWORD_CHANGED)
      );
    } catch (error) {
      return next(error);
    }
  }

    async listUser(req, res, next) {
    const validationSchema = Joi.object({
      status1: Joi.string().allow("").optional(),
      userType1: Joi.string().allow("").optional(),
      search: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
      country: Joi.string().allow("").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);

      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: ["ADMIN", "MODERATOR"] },
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      console;
      let dataResults = await paginateSearch(validatedBody);
      console.log(dataResults, 54555);
      if (dataResults.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  async dashboard(req, res, next) {
    try {
      let [
        adminResult,
        activeUser,
        blockUser,
        totalUser,
        totalItems,
        totalCategories,
        totalAdvertisement,
      ] = await Promise.all([
        findUser({ _id: req.userId, status: { $ne: status.DELETE } }),
        findCount({ status: status.ACTIVE, userType: { $ne: "ADMIN" } }),
        findCount({ status: status.BLOCK, userType: { $ne: "ADMIN" } }),
        findCount({
          status: { $ne: status.DELETE },
          userType: { $ne: "ADMIN" },
        }),
        countProduct({ status: { $ne: status.DELETE } }),
        countCategory({ status: { $ne: status.DELETE } }),
        countAdvertisement({ status: { $ne: status.DELETE } }),
      ]);
      if (!adminResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      let obj = {
        activeUser: activeUser,
        blockUser: blockUser,
        totalRegisterUser: totalUser,
        totalItems: totalItems,
        totalCategories: totalCategories,
        totalAdvertisements: totalAdvertisement,
        // totalPromotions: totalPromotions,
        // totalExchange: totalExchange
      };
      return res.json(new response(obj, responseMessage.ALL_DATA_GET_SUCCESS));
    } catch (error) {
      console.error("❌ [dashboard] Error:", error.message, error.stack);
      return next(error);
    }
  }

  async getPaymentDatabyUserId(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);

      let userResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      const pipline = [
        {
          $match: {
            _id:new mongoose.Types.ObjectId(validatedBody._id),
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productData",
          },
        },
        {
          $unwind: {
            path: "$productData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            productId: 1,
            paymentMethod: 1,
            totalPaymentAmount: 1,
            totalAmount: 1,
            paymentStatus: 1,
            taxAmount: 1,
            createdAt: 1,
            "productData.productImage": 1,
          },
        },
      ];
      let dataResults = await paymentAggregate(pipline);
      if (!dataResults) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }

      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log(error, 300);
      return next(error);
    }
  }

  async getPaymentDeatilsDatabyAdmin(req, res, next) {
    const validationSchema = Joi.object({
      search: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);

      let userResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let dataResults = await paginatePaymentSearch(validatedBody);
      if (dataResults.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log(error, 300);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/getPaymentDeatilsOfProductPurchaseAndAddProduct:
   *   get:
   *     summary: getPaymentDeatilsOfProductPurchaseAndAddProduct
   *     tags:
   *       - ADMIN
   *     description: getPaymentDeatilsOfProductPurchaseAndAddProduct
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: admin token
   *         in: header
   *         required: true
   *       - name: orderType
   *         description: approve Status
   *         enum: ["ALL" ,"AddedProduct","PurchasedProduct"]
   *         in: query
   *         required: false
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Data found successfully.
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async getPaymentDeatilsOfProductPurchaseAndAddProduct(req, res, next) {
    const validationSchema = Joi.object({
      orderType: Joi.string().required(),
      search: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);

      let userResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      if (validatedBody.orderType == "AddedProduct") {
        validatedBody.orderType = "ADD_PRODUCT";
      } else if (validatedBody.orderType == "PurchasedProduct") {
        validatedBody.orderType = "BUY_PRODUCT";
      } else if (validatedBody.orderType == "ALL") {
        validatedBody.orderType = "";
      }
      console.log(validatedBody.orderType, 300);
      let dataResults = await paginatePaymentSearchWithOrderType(validatedBody);
      if (dataResults.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log(error, 300);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/viewUserProfile:
   *   get:
   *     summary: viewUserProfile
   *     tags:
   *       - ADMIN
   *     description: viewUserProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message.
   */
  async viewUserProfile(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      let userResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      const userInfo = await findUser({
        _id: validatedBody._id,
        status: { $ne: status.DELETE },
      });
      if (!userInfo) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(userInfo, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/viewAdminProfile:
   *   get:
   *     summary: viewAdminProfile
   *     tags:
   *       - ADMIN
   *     description: viewAdminProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message.
   */
  async viewAdminProfile(req, res, next) {
    try {
      let adminResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      return res.json(new response(adminResult, responseMessage.USER_DETAILS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/viewUserlist:
   *   get:
   *     summary: viewUserlist
   *     tags:
   *       - ADMIN
   *     description: List of all USER on plateform by ADMIN Call this listuser API
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         type: integer
   *         required: false
   *       - name: userType
   *         description: userType
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewUserlist(req, res, next) {
    var validationSchema = Joi.object({
      search: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      userType: Joi.string().optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: "ADMIN" },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let dataResults = await paginateSearch(validatedBody);
      if (dataResults.docs.length == 0) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log("====error==>>", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/blockUnblockUser:
   *   put:
   *     summary: blockUnblockUser
   *     tags:
   *       - ADMIN
   *     description: blockUnblockUser When ADMIN want to block User or Unblock USER on Plateform
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: blockUnblockUser
   *         description: blockUnblockUser
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/blockUnblockUser'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async blockUnblockUser(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: "ADMIN" },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var userInfo = await findUser({
        _id: validatedBody._id,
        userType: { $ne: "ADMIN" },
        status: { $ne: status.DELETE },
      });
      if (!userInfo) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      if (userInfo.status == status.ACTIVE) {
        let blockRes = await updateUser(
          { _id: userInfo._id },
          { status: status.BLOCK }
        );
        await commonFunction.sendEmailOnBlock(userInfo.email);
        const title = "Account Blocked";
        const body =
          "Your account has been blocked by the administrator. If you believe this is an error or have any questions, please contact our support team for assistance.";
        await notificationCreate({
          userId: userInfo._id,
          title: title,
          body: body,
          currentTime: new Date().toISOString(),
          currentDay: daysOfWeek[new Date().getDay()],
        });

        if (userInfo.deviceToken && userInfo.deviceType != "") {
          await commonFunction.pushNotification(
            userInfo.deviceToken,
            title,
            body
          );
        }
        return res.json(new response({}, responseMessage.BLOCK_BY_ADMIN));
      } else {
        let activeRes = await updateUser(
          { _id: userInfo._id },
          { status: status.ACTIVE }
        );
        await commonFunction.sendEmailOnUnblock(activeRes.email);
        const title = "Account Unblocked";
        const body =
          "Good news! Your account has been successfully unblocked by the administrator. You can now access your account as usual. If you have any questions or concerns, please don't hesitate to contact our support team for assistance.";
        await notificationCreate({
          userId: userInfo._id,
          title: title,
          body: body,
          currentTime: new Date().toISOString(),
          currentDay: daysOfWeek[new Date().getDay()],
        });

        if (userInfo.deviceToken && userInfo.deviceType != "") {
          await commonFunction.pushNotification(
            userInfo.deviceToken,
            title,
            body
          );
        }
        return res.json(new response({}, responseMessage.UNBLOCK_BY_ADMIN));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/deleteUser:
   *   delete:
   *     summary: deleteUser
   *     tags:
   *       - ADMIN
   *     description: deleteUser When Admin want to delete Any USER from plateform
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: deleteUser
   *         description: deleteUser
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/deleteUser'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async deleteUser(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: "ADMIN" },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var userInfo = await findUser({
        _id: validatedBody._id,
        userType: { $ne: "ADMIN" },
        status: { $ne: status.DELETE },
      });
      if (!userInfo) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      let deleteRes = await updateUser(
        { _id: userInfo._id },
        { status: status.DELETE }
      );
      return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  async deleteAllUsers(req, res, next) {
    try {
      // Assuming the current user is an admin and has the authority to perform this operation
      let userResult = await findAllUser({
        _id: req.userId,
        userType: { $in: ["ADMIN"] },
      });
  
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
  
      // Check if the request is legitimate and safe to proceed
      //const confirmation = req.body.confirmation;
      //if (confirmation !== 'DELETE_ALL_USERS') {
        //throw apiError.badRequest('Invalid confirmation for deleting all users');
      //}
  
      // Perform the deletion of all users
      const deleteRes = await updateUsers(
        { userType: { $ne: "ADMIN" }, status: { $ne: status.DELETE } },
        { status: status.DELETE }
      );
  
      return res.json(new response(deleteRes, responseMessage.DELETE_ALL_USERS_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }
  
  
  
  /**
   * @swagger
   * /admin/deleteProduct:
   *   delete:
   *     tags:
   *       - ADMIN
   *     description: deleteProduct
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async deleteProduct(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);
      let productCheck = await findProduct({
        _id: validatedBody._id,
        status: { $ne: status.DELETE },
      });
      if (!productCheck) {
        throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
      }

      let updateRes = await deleteProduct({ _id: productCheck._id });
      return res.json(new response(updateRes, responseMessage.PRODUCT_DELETED));
    } catch (error) {
      return next(error);
    }
  }


  async deleteProducts(req, res, next) {
    const validationSchema = Joi.object({
      productIds: Joi.array().items(Joi.string()).required(),
    });
  
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);
      
      // Assuming you have a function findProductsByIds to check the existence of products
      let productsCheck = await findProductsByIds(validatedBody.productIds);
      
      if (productsCheck.length !== validatedBody.productIds.length) {
        // Some products were not found
        throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
      }
  
      let updateRes = await deleteProductsByIds(validatedBody.productIds);
      return res.json(new response(updateRes, responseMessage.PRODUCTS_DELETED));
    } catch (error) {
      return next(error);
    }
  }
   /**
   * @swagger
   * /admin/deleteProducts:
   *   delete:
   *     tags:
   *       - ADMIN
   *     description: deleteProducts
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async deleteProducts(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      //let validatedBody = await validationSchema.validateAsync(req.query);
      //let productCheck = await findProduct({
        //_id: validatedBody._id,
        //userId: req.userId,
        //status: { $ne: status.DELETE },
      //});
      //if (!productCheck) {
       // throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
      //}

      let updateRes = await deleteProducts({});
      return res.json(new response(updateRes, responseMessage.PRODUCT_DELETED));
    } catch (error) {
      return next(error);
    }
  }
  /**
   * @swagger
   * /admin/websiteMaintainance:
   *   put:
   *     summary: Website Maintainance
   *     tags:
   *       - ADMIN
   *     description: Website Maintainance
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: siteMaintainanceMode
   *         description: siteMaintainanceMode
   *         in: formData
   *         enum: ["ENABLE", "DISABLE"]
   *         required: false
   *       - name: maintainanceModeText
   *         description: maintainanceModeText
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async websiteMaintainance(req, res, next) {
    var validationSchema = Joi.object({
      siteMaintainanceMode: Joi.string().required(),
      maintainanceModeText: Joi.string().optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let adminTokenRes = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!adminTokenRes)
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);

      let settingId = await maintainance.find();
      if (!settingId) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

      let result = await maintainance.updateOne(
        { _id: settingId[0]._id },
        validatedBody
      );
      const userResult = await userFindList({
        userType: userType.USER,
        status: status.ACTIVE,
      });
      if (validatedBody.siteMaintainanceMode == "ENABLE") {
        userResult.forEach(async (element) => {
          const title = "Maintenance Mode Notification";
          const body = `We apologize for the inconvenience, but our application is currently undergoing scheduled maintenance to ensure a better and more reliable experience for you.`;
          await notificationCreate({
            userId: element._id,
            title: title,
            body: body,
            currentTime: new Date().toISOString(),
            currentDay: daysOfWeek[new Date().getDay()],
          });

          if (element.deviceToken && element.deviceType != "") {
            await commonFunction.pushNotification(
              element.deviceToken,
              title,
              body
            );
          }
        });
      }

      if (validatedBody.siteMaintainanceMode == "DISABLE") {
        userResult.forEach(async (element) => {
          const title = "Maintenance Completed Notification";
          const body = `We are pleased to inform you that the scheduled maintenance of our application has been successfully completed ahead of schedule. Our application is now back online and fully operational. `;
          await notificationCreate({
            userId: element._id,
            title: title,
            body: body,
            currentTime: new Date().toISOString(),
            currentDay: daysOfWeek[new Date().getDay()],
          });

          if (element.deviceToken && element.deviceType != "") {
            await commonFunction.pushNotification(
              element.deviceToken,
              title,
              body
            );
          }
        });
      }
      return res.json(
        new response(
          { status: true },
          responseMessage.MAINTAINANCE_MODE_UPDATED
        )
      );
    } catch (error) {
      console.log("error websiteMaintainance==>>", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/updateProductApproveStatus:
   *   put:
   *     tags:
   *       - ADMIN PRODUCT MANAGEMENT
   *     description: update Product Approve Status
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: productId
   *         in: header
   *         required: true
   *         type: string
   *         description: ID of the product to update
   *       - name: approveStatus
   *         in: header
   *         required: true
   *         type: string
   *         enum: ["PENDING", "APPROVED", "REJECTED"]
   *         description: New status for the product
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async updateProductApproveStatus(req, res, next) {
    try {
      console.log("Headers received:", req.headers);
      console.log("User ID from token:", req.userId);

      // التحقق من وجود الرؤوس المطلوبة
      if (!req.headers.productid || !req.headers.approvestatus) {
        console.log("Missing required headers");
        return res.status(400).json({
          status: false,
          message: "productId و approveStatus مطلوبان في رؤوس الطلب"
        });
      }

      // التحقق من صحة القيم
      const validationSchema = Joi.object({
        productId: Joi.string().required(),
        approveStatus: Joi.string().valid("PENDING", "APPROVED", "REJECTED").required()
      });

      console.log("Validating data:", {
        productId: req.headers.productid,
        approveStatus: req.headers.approvestatus.toUpperCase()
      });

      const validatedBody = await validationSchema.validateAsync({
        productId: req.headers.productid,
        approveStatus: req.headers.approvestatus.toUpperCase()
      });

      console.log("Validated data:", validatedBody);

      // التحقق من المستخدم
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });

      console.log("Found user:", userResult ? userResult._id : null);

      if (!userResult) {
        return res.status(404).json({
          status: false,
          message: responseMessage.USER_NOT_FOUND
        });
      }

      // التحقق من المنتج
      let findProductRes = await findProduct({
        _id: validatedBody.productId
      });

      console.log("Found product:", findProductRes ? findProductRes._id : null);

      if (!findProductRes) {
        return res.status(404).json({
          status: false,
          message: responseMessage.PRODUCT_NOT_FOUND
        });
      }

      // التحقق من صاحب المنتج
      let userInfo = await findUser({
        _id: findProductRes.userId
      });

      console.log("Found product owner:", userInfo ? userInfo._id : null);

      if (!userInfo) {
        return res.status(404).json({
          status: false,
          message: responseMessage.USER_NOT_FOUND
        });
      }

      // تحديث حالة المنتج
      try {
        if (validatedBody.approveStatus === "APPROVED") {
          console.log("Updating product status to APPROVED");
          let updateRes = await updateProduct(
            { _id: findProductRes._id },
            { approveStatus: "APPROVED" }
          );
          console.log("Update result:", updateRes);

          // إرسال الإشعارات والبريد الإلكتروني
          try {
            await commonFunction.sendEmailToUserAfterProductApprove(
              userInfo.email,
              userInfo.name,
              findProductRes.productName
            );
          } catch (emailError) {
            console.error("Error sending approval email:", emailError);
          }

          const title = "Product Approved";
          const body = "Congratulations! Your product has been approved by the platform administrator.";
          
          try {
            await notificationCreate({
              userId: userInfo._id,
              title: title,
              body: body,
              currentTime: new Date().toISOString(),
              currentDay: daysOfWeek[new Date().getDay()]
            });

            if (userInfo.deviceToken && userInfo.deviceType !== "") {
              await commonFunction.pushNotification(
                userInfo.deviceToken,
                title,
                body
              );
            }
          } catch (notificationError) {
            console.error("Error sending notification:", notificationError);
          }

          return res.json(new response(updateRes, responseMessage.PRODUCT_UPDATED));
        } 
        else if (validatedBody.approveStatus === "REJECTED") {
          console.log("Updating product status to REJECTED");
          let updateRes = await updateProduct(
            { _id: findProductRes._id },
            { approveStatus: "REJECTED" }
          );
          console.log("Update result:", updateRes);

          try {
            await commonFunction.sendEmailToUserAfterProductReject(
              userInfo.email,
              userInfo.name,
              findProductRes.productName
            );
          } catch (emailError) {
            console.error("Error sending rejection email:", emailError);
          }

          const title = "Product Rejected";
          const body = "We regret to inform you that your product submission has been rejected.";
          
          try {
            await notificationCreate({
              userId: userInfo._id,
              title: title,
              body: body,
              currentTime: new Date().toISOString(),
              currentDay: daysOfWeek[new Date().getDay()]
            });

            if (userInfo.deviceToken && userInfo.deviceType !== "") {
              await commonFunction.pushNotification(
                userInfo.deviceToken,
                title,
                body
              );
            }
          } catch (notificationError) {
            console.error("Error sending notification:", notificationError);
          }

          return res.json(new response(updateRes, responseMessage.PRODUCT_UPDATED));
        }
      } catch (updateError) {
        console.error("Error updating product:", updateError);
        throw updateError;
      }

    } catch (error) {
      console.error("Error in updateProductApproveStatus:", error);
      console.error("Error stack:", error.stack);
      
      if (error.isJoi) {
        return res.status(400).json({
          status: false,
          message: error.details[0].message
        });
      }

      return res.status(500).json({
        status: false,
        message: "حدث خطأ في الخادم",
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /admin/sendNotificationToUser:
   *   post:
   *     tags:
   *       - ADMIN NOTIFICATION MANAGEMENT
   *     description: send Notification To User
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: SendNotificationToUser
   *         description: sendNotification
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/sendNotification'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async sendNotificationToUser(req, res, next) {
    var validationSchema = Joi.object({
      userId: Joi.string().required(),
      title: Joi.string().required(),
      description: Joi.string().required(),
    });
    try {
      var validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }

      let findUserRes = await findUser({
        _id: validatedBody.userId,
      });
      if (!findUserRes) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let notificationData = {
        userId: findUserRes._id,
        title: validatedBody.title,
        body: validatedBody.description,
        status: status.ACTIVE,
        sendBy: "ADMIN",
      };
      let notificationRes = await notificationCreate(notificationData);
      return res.json(new response({}, responseMessage.NOTIFICATION_SENT));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/sendNotificationToAllUser:
   *   post:
   *     tags:
   *       - ADMIN NOTIFICATION MANAGEMENT
   *     description: send Notification To User
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: sendNotificationToAllUser
   *         description: sendNotification
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/sendNotification'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async sendNotificationToAllUser(req, res, next) {
    var validationSchema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
    });
    try {
      var validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }

      // let findUserRes = await findAllUser();
      const findUserRes = await findAllUser({
        userType: userType.USER,
        status: status.ACTIVE,
      });
      const email = findUserRes.map((item) => item.email);
      console.log(findUserRes, 101);
      if (!findUserRes || findUserRes.length === 0) {
        throw new Error(responseMessage.USER_NOT_FOUND);
      }

      // create notification for all user which in findUserRes array
      let notificationData = findUserRes.map(async (user) => {
        let data = {
          userId: user._id,
          title: validatedBody.title,
          body: validatedBody.description,
          status: status.ACTIVE,
          sendBy: "ADMIN",
        };
        await notificationCreate(data);
      });
      await commonFunction.sendAllUsersMailNotification(
        email,
        validatedBody.title,
        validatedBody.description
      );
      return res.json(new response({}, responseMessage.NOTIFICATION_SENT));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/getReportList:
   *   post:
   *     tags:
   *       - ADMIN REPORT MANAGEMENT
   *     description: getReportList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: admin token
   *         in: header
   *         required: true
   *       - name: search
   *         description: search
   *         in: formData
   *         required: false
   *       - name: type
   *         description: type
   *         in: formData
   *         enum: ["Duplicate ad","Inappropriate Content","Misleading Information","Offensive Language","Scam OR Fraud","Other (Please Specify)"]
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: formData
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: formData
   *         required: false
   *       - name: page
   *         description: page
   *         in: formData
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: formData
   *         type: integer
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getReportList(req, res, next) {
    const validationSchema = Joi.object({
      search: Joi.string().allow("").optional(),
      type: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.body);

      let adminResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!adminResult) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

      let reportsList = await reportPaginate(validatedBody);
      return res.json(new response(reportsList, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log("error============>", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/getReportListByUserId:
   *   get:
   *     tags:
   *       - ADMIN REPORT MANAGEMENT
   *     description: getReportListByUserId
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: admin token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getReportListByUserId(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);

      let reportsList = await reportList({ _id: validatedBody._id });
      if (reportsList.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(reportsList, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log("error============>", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/deleteColelctionofCoupon:
   *   get:
   *     tags:
   *       - ABCD
   *     description: check user plan status
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async deleteColelctionofCoupon(req, res, next) {
    try {
      await CouponModel.deleteMany({})
        .then((result) => {
          res.json("deleted");
        })
        .catch((err) => {
          res.json("Error");
        });
    } catch (error) {
      return next(error);
    }
  }
}
export default new adminController();
