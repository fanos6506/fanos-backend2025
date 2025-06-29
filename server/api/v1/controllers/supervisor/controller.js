import Joi from "joi";
import { joiPasswordExtendCore } from "joi-password";

const joiPassword = Joi.extend(joiPasswordExtendCore);

import Mongoose from "mongoose";
import * as _ from 'lodash';
import config from "config";
import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import * as bcrypt from 'bcryptjs';
import responseMessage from "../../../../../assets/responseMessage.js";
import userModel from "../../../../models/user.js";
import commonFunction from "../../../../helper/util.js";
import jwt from 'jsonwebtoken';
import status from "../../../../enums/status.js";
import * as bcryptjs from 'bcryptjs';
import userType from "../../../../enums/userType.js";
import auth from "../../../../helper/auth.js";
import commaonFunction from "../../../../helper/util.js";
import  userServices  from "../../services/user.js";

const {
  userCheck,
  findUserWithFollowUser,
  checkUserExists,
  emailMobileExist,
  checkSocialLogin,
  findCount,
  createUser,
  findUser,
  findUserData,
  deleteUser,
  userFindList,
  updateUser,
  updateUserById,
  insertManyUser,
  paginateSearch,
  listSearchUsers,
  findUserDatax,
  paginateSearchListByUser,
  listVendorUser,
  paginateSearchModerator,
} = userServices;

import  advertisementServices  from "../../services/advertisement.js";
const {
  createAdvertisement,
  findAdvertisement,
  updateAdvertisement,
  advertisementList,
  advertisementListPagination,
  multiUpdateAdvertisement,
} = advertisementServices;
import  supervisorServices  from "../../services/supervisor.js";

const {
  createStore,
  removeStore,
  findStore,
  findListStore,
  countStore,
  paginateStoreSearch,
  updateStore,
  paginateSearchForStore,
  generateRandomNumber,
  addCoupon,
  getCoupon,
  getAllCouponList,
  getSingleCoupon,
  updateCoupon,
  paginateCoupenSearch,
  couponDelete,
  couponDeleteMany,
  createInvoice,
  getInvoice,
  findInvoice,
  getAllInvoiceList,
} = supervisorServices;

export class supervisorController {
  //*********************** COUPON DETAILS START *********************************************** */

  /**
   * @swagger
   * /superviser/createCoupon:
   *   post:
   *     summary: Create Coupon
   *     tags:
   *       - COUPON
   *     description: Create Coupon
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: createCoupon
   *         description: createCoupon
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/createCoupon'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async createCoupon(req, res, next) {
    const validationSchema = Joi.object({
      couponAmount: Joi.number().required(),
      currency: Joi.string().optional(),
      maxUsage: Joi.number().optional(),
      numberOfCoupons: Joi.number().optional(), // New field for the number of coupons
      couponPercentage: Joi.number().optional(),
    });
  
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const adminResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
        userType: userType.ADMIN,
      });
  
      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
  
      const coupons = [];
  
      for (let i = 0; i < validatedBody.numberOfCoupons; i++) {
        const couponCode = await commaonFunction.generateCouponCode();
        const coupon = {
          couponCode,
          couponAmount: validatedBody.couponAmount,
          currency: validatedBody.currency,
          maxUsage: validatedBody.maxUsage,
          couponPercentage: validatedBody.couponPercentage,
        };
        coupons.push(coupon);
      }
  
      // Check if any of the generated coupon codes already exist
      // const existingCoupons = await getCoupon({ couponCode: { $in: coupons.map(c => c.couponCode) } });
      // if (existingCoupons.length > 0) {
      //   throw apiError.notFound(responseMessage.COUPON_CODE_ALREADY_EXIST);
      // }
  
      // Assuming addCoupon function is appropriately implemented
      const result = await addCoupon(coupons);
      return res.json(new response(result, responseMessage.COUPONS_CREATED));
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
  
  
  
  

  /**
   * @swagger
   * /superviser/updateCoupon:
   *   put:
   *     summary: update Coupon
   *     tags:
   *       - COUPON
   *     description: update Coupon
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: createCoupon
   *         description: createCoupon
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/updateCoupon'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async updateCoupon(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
      maxUsage: Joi.number().optional(),
      currency: Joi.string().optional(),
      numberOfCoupons: Joi.number().optional(),
      couponPercentage: Joi.number().optional(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let adminResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
        userType: userType.ADMIN,
      });

      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const couponCheck = await getCoupon({
        _id: validatedBody._id,
      });
      if (!couponCheck) {
        throw apiError.notFound(responseMessage.COUPONS_NOT_FOUND);
      }
      const result = await updateCoupon({ _id: validatedBody._id }, validatedBody);
      return res.json(new response(result, responseMessage.COUPONS_CREATED));
    } catch (error) {
      console.log(error, "error");
      return next(error);
    }
  }

  /**
   * @swagger
   * /superviser/getAllCouponList:
   *   get:
   *     summary: Get Coupon List
   *     tags:
   *       - COUPON
   *     description: Get Coupon List
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: status1
   *         description: status1
   *         in: query
   *         required: false
   *         enum: [ALL,ACTIVE,BLOCKED]
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
  async getAllCouponList(req, res, next) {
    const validationSchema = Joi.object({
      status1: Joi.string().allow("").optional(),
      currency: Joi.string().allow("").optional(),
      numberOfCoupons: Joi.number().allow("").optional(),
      search: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      limit: Joi.number().allow("").optional(),
      page: Joi.number().allow("").optional(),
      maxUsage: Joi.number().allow("").optional(),
      couponPercentage: Joi.number().allow("").optional(),
    });
    const validatedBody = await validationSchema.validateAsync(req.query);

    try {
      let adminResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      if (validatedBody.status1 == "ALL") {
        validatedBody.status1 = "";
      }
      let dataResults = await paginateCoupenSearch(validatedBody);
      if (dataResults.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(dataResults, responseMessage.COUPON_LIST));
    } catch (error) {
      console.log(error, "error");
      return next(error);
    }
  }

  /**
   * @swagger
   * /superviser/getSingleCouponData:
   *   get:
   *     summary: Get Single Coupon
   *     tags:
   *       - COUPON
   *     description: Get Single Coupon
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: coupon id
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async getSingleCouponData(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);

      let adminResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!adminResult)
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);

      let findCouponData = await getCoupon({ _id: validatedBody._id });
      if (!findCouponData)
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

      return res.json(
        new response(
          { status: true, data: findCouponData },
          responseMessage.COUPON_LIST
        )
      );
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
/**
   * @swagger
   * /superviser/deleteCoupons:
   *   delete:
   *     summary: delete Coupons
   *     tags:
   *       - COUPON
   *     description: delete Coupons
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: couponId
   *         description: couponId
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async deleteCoupon(req, res, next) {
    const validationSchema = Joi.object({
      couponId: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let adminResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
        userType: userType.ADMIN,
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let dataResults = await couponDelete({ _id: validatedBody.couponId });
      return res.json(
        new response({ status: true }, responseMessage.COUPON_DELETED)
      );
    } catch (error) {
      console.log(error, "error");
      return next(error);
    }
  }


  async deleteAllCoupons(req, res, next) {
    try {
      let adminResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
        userType: userType.ADMIN,
      });
  
      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
  
      // Assuming couponDelete function is responsible for deleting coupons
      let dataResults = await couponDeleteMany({}); // Provide an empty query to delete all
  
      return res.json(
        new response({ status: true }, responseMessage.COUPONS_DELETED)
      );
    } catch (error) {
      console.log(error, "error");
      return next(error);
    }
  }
  
  /**
   * @swagger
   * /superviser/deleteCoupon:
   *   delete:
   *     summary: delete Coupon
   *     tags:
   *       - COUPON
   *     description: delete Coupon
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: couponId
   *         description: couponId
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async deleteCoupon(req, res, next) {
    const validationSchema = Joi.object({
      couponId: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let adminResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
        userType: userType.ADMIN,
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let dataResults = await couponDelete({ _id: validatedBody.couponId });
      return res.json(
        new response({ status: true }, responseMessage.COUPON_DELETED)
      );
    } catch (error) {
      console.log(error, "error");
      return next(error);
    }
  }


  /**
   * @swagger
   * /superviser/blockAndUnblockCoupon:
   *   put:
   *     summary: blockAndUnblockCoupon
   *     tags:
   *       - COUPON
   *     description: blockAndUnblockCoupon When ADMIN want to block
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: blockAndUnblockCoupon
   *         description: blockAndUnblockCoupon
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/blockUnblockUser'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async blockAndUnblockCoupon(req, res, next) {
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
      var couponData = await getCoupon({
        _id: validatedBody._id,
      });

      if (!couponData) {
        throw apiError.notFound(responseMessage.COUPONS_NOT_FOUND);
      }
      if (couponData.status == status.ACTIVE) {
        let blockRes = await updateCoupon(
          { _id: couponData._id },
          { status: status.BLOCK }
        );
        return res.json(new response(blockRes, responseMessage.BLOCK_BY_ADMIN));
      } else {
        let activeRes = await updateCoupon(
          { _id: couponData._id },
          { status: status.ACTIVE }
        );
        return res.json(
          new response(activeRes, responseMessage.UNBLOCK_BY_ADMIN)
        );
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /superviser/blockCouponStatus:
   *   put:
   *     summary: Block Coupon Status
   *     tags:
   *       - Supervisor
   *     description: Block Coupon Status
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: admin token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: store id
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async blockCouponStatus(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let adminResult = await findUser({
        _id: req.userId,
        userType: { $in: userType.ADMIN },
      });
      if (!adminResult)
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);

      let findCouponData = await getCoupon({ _id: validatedBody._id });
      if (!findCouponData)
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

      let updateCouponData = await updateCoupon(
        { _id: validatedBody._id },
        { $set: { status: status.BLOCK } }
      );
      return res.json(
        new response({ status: true }, responseMessage.COUPON_BLOCKED)
      );
    } catch (error) {
      console.log(error, 618);
      return next(error);
    }
  }
}

export default new supervisorController();


