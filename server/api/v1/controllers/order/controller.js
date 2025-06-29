import Joi from "joi";
import { joiPasswordExtendCore } from "joi-password";
const joiPassword = Joi.extend(joiPasswordExtendCore);
import * as _ from 'lodash';
import config from "config";
import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import responseMessage from "../../../../../assets/responseMessage.js";
import commonFunction from "../../../../helper/util.js";
import userType from "../../../../enums/userType.js";
import status from "../../../../enums/status.js";
import oredrStatus from "../../../../enums/orderStatus.js";
import orderType from "../../../../enums/orderType.js";

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
  paginateSearchsupervisor,
} = userServices;

import  orderServices  from "../../services/order.js";
const {
  createOrder,
  findOrder,
  findOneOrder,
  findAllOrder,
  findAllOrder1,
  findOrderWithProductDetalis,
  findCountOrder,
  updateOrder,
  updateOrderById,
  findOrderWithProductDetails1,
  paginateOrderSearch,
  paginateOrderServiceSearch,
  paginateOrderProductSearch,
  paginateOrderSearchByUser,
  paginateOrderSearchAdmin,
} = orderServices;

import  productServices  from "../../services/product.js";
const {
  createProduct,
  findProduct,
  updateProduct,
  countProduct,
  productList,
  productListWithPagination,
  ParticularProductListWithPagination,
  findMyLikesProduct,
  listProductV2,
  deleteProduct,
  deleteallProducts,
  paginateProductSearch,
} = productServices;

import  deliveryChargeServices  from "../../services/deliverySet.js";
import orderStatus from "../../../../enums/orderStatus.js";
const { findDeliveryCharge, updateDeliveryCharge } = deliveryChargeServices;

import  notificationServices from "../../services/notification.js";
const { notificationCreate, notificationData, notificationUpdate } =
  notificationServices;

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
  findCoupon,
} = supervisorServices;

import  addressesService  from "../../services/addresses.js";
const {
  createAddresses,
  findAddresses,
  findListAddresses,
  updateAddresses,
  deleteAddresses,
  paginateAddressSearch,
} = addressesService;

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

import  paymentServices  from "../../services/payment.js";
const { createPayment, updatePayment, findPaymentDeatils } = paymentServices;

export class orderController {
  /**
   * @swagger
   * /order/addOrder:
   *   post:
   *     summary: addOrder
   *     tags:
   *       - ORDER
   *     description: addOrder
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: productId
   *         description: productId
   *         in: formData
   *         required: true
   *       - name: addressId
   *         description: addressId
   *         in: formData
   *         required: true
   *       - name: orderType
   *         description: orderType
   *         in: formData
   *         enum: ["BUY", "SELL"]
   *         required: true
   *     responses:
   *       200:
   *         description: Add Order Successfully.
   */
  async addOrder(req, res, next) {
    var validationSchema = Joi.object({
      productId: Joi.string().required(),
      addressId: Joi.string().required(),
      orderType: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      var userTokenRes = await findUser({ _id: req.userId });
      if (!userTokenRes)
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);

      if (validatedBody.orderType == orderType.BUY) {
        const today = new Date();
        var orderHistory = await findProduct({ _id: validatedBody.productId });
        if (!orderHistory)
          throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

        let obj = {
          userId: userTokenRes._id,
          productId: validatedBody.productId,
          addressId: validatedBody.addressId,
          orderType: validatedBody.orderType,
          price: orderHistory.price,
          deliveryCharge: 0,
          buyDate: today.getDate(),
        };
        await notificationCreate({
          userId: userTokenRes._id,
          title: "Product BUY",
          imageUrl: orderHistory.productImage[0],
          body: `your ${orderHistory.productName} buy order created successfully.`,
          currentTime: new Date().toISOString(),
          currentDay: daysOfWeek[new Date().getDay()],
        });
        let buyOrder = await createOrder(obj);
        return res.json(new response(buyOrder, responseMessage.ORDER_BUY));
      } else {
        const today = new Date();
        var orderHistory = await findProduct({
          _id: validatedBody.productId,
          userId: req.userId,
        });
        if (!orderHistory)
          throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

        let obj = {
          userId: userTokenRes._id,
          productId: validatedBody.productId,
          addressId: validatedBody.addressId,
          orderType: validatedBody.orderType,
          price: orderHistory.price,
          deliveryCharge: 0,
          sellDate: today.getDate(),
        };
        const title = "Product SELL";
        const body = `your ${orderHistory.productName} Sell order created successfully.`;
        await notificationCreate({
          userId: userTokenRes._id,
          title: title,
          imageUrl: orderHistory.productImage[0],
          body: body,
        });
        if (userTokenRes.deviceToken){
          await commonFunction.pushNotification(userResult.deviceToken , title , body);
        }
        let sellOrder = await createOrder(obj);
        return res.json(new response(sellOrder, responseMessage.ORDER_SELL));
      }
    } catch (error) {
      console.log("error  addOrder==>>", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /order/orderHistory:
   *   post:
   *     tags:
   *       - ORDER
   *     description: orderHistory
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: orderType
   *         description: orderType
   *         in: formData
   *         enum: ["BUY", "SELL"]
   *         required: false
   *     responses:
   *       200:
   *         description: Data found successfully.
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async orderHistory(req, res, next) {
    var validationSchema = Joi.object({
      orderType: Joi.string().optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let orderQuery = { userId: req.userId };
      if (validatedBody.orderType) {
        orderQuery.orderType = validatedBody.orderType;
      }

      if (validatedBody.orderType == orderType.BUY) {
        let orderCheck = await findOrderWithProductDetalis(req.userId, "BUY");
        console.log("orderCheck BUY ==>>", orderCheck);
        if (!orderCheck) {
          throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
        }
        return res.json(new response(orderCheck, responseMessage.ORDER_DATA));
      } else {
        let orderCheck = await findOrderWithProductDetalis(req.userId, "SELL");
        console.log("orderCheck SELL ==>>", orderCheck);
        if (!orderCheck) {
          throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
        }
        return res.json(new response(orderCheck, responseMessage.ORDER_DATA));
      }
    } catch (error) {
      console.log(error, 300);
      return next(error);
    }
  }

  /**
   * @swagger
   * /order/updateDeliveryCharge:
   *   put:
   *     summary: updateDeliveryCharge
   *     tags:
   *       - ORDER
   *     description: updateDeliveryCharge
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: formData
   *         required: true
   *       - name: deliveryCharge
   *         description: deliveryCharge
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async updateDeliveryCharge(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
      deliveryCharge: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let userTokenRes = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!userTokenRes)
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);

      let deliveryChargeRes = await findDeliveryCharge({
        _id: validatedBody._id,
      });
      if (!deliveryChargeRes)
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

      var result = await updateDeliveryCharge(
        { _id: validatedBody._id },
        validatedBody
      );
      return res.json(
        new response(result, responseMessage.UPDATE_DELIVERYCHARGE)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /order/getOrderTotal:
   *   put:
   *     tags:
   *       - ORDER
   *     description: Get Order Total Details
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: orderId
   *         description: orderId
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Data found successfully.
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async getOrderTotal(req, res, next) {
    var validationSchema = Joi.object({
      orderId: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let orderCheck = await findOrder({
        _id: validatedBody.orderId,
        status: { $ne: status.DELETE },
      });
      if (!orderCheck) {
        throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
      }

      let deliveryChargeRes = await findDeliveryCharge();
      if (!deliveryChargeRes)
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

      const deliveryCharge = deliveryChargeRes.deliveryCharge;
      const subTotal = orderCheck.price;
      const totalPayment = subTotal + deliveryCharge;

      let updateData = await updateOrder(
        { _id: orderCheck._id },
        {
          $set: {
            oredrStatus: oredrStatus.COMPLETED,
            totalAmount: totalPayment,
          },
        }
      );
      return res.json(new response(updateData, responseMessage.ORDER_FOUND));
    } catch (error) {
      console.log(error, 300);
      return next(error);
    }
  }

  /**
   * @swagger
   * /order/acceptOrderRequest:
   *   put:
   *     tags:
   *       - ORDER
   *     description: acceptOrderRequest for ADMIN
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
  async acceptOrderRequest(req, res, next) {
    try {
      const { _id } = req.query;
      let adminRes = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!adminRes) throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      // console.log(_id, 201)
      let orderDetails = await findOrder({
        _id: _id,
        oredrStatus: oredrStatus.PENDING,
      });
      if (!orderDetails)
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      //   console.log(orderDetails, 401)

      let acceptRes = await updateOrder(
        { _id: orderDetails._id },
        { $set: { oredrStatus: oredrStatus.APPROVE } }
      );
      return res.json(new response(acceptRes, responseMessage.ORDER_APPROVE));
    } catch (error) {
      console.log(error, 144);
      return next(error);
    }
  }

  /**
   * @swagger
   * /order/rejectOrderRequest:
   *   put:
   *     tags:
   *       - ORDER
   *     description: rejectOrderRequest for ADMIN
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
   *       - name: reason
   *         description: reason
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async rejectOrderRequest(req, res, next) {
    try {
      const { _id, reason } = req.query;

      let adminRes = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!adminRes) throw apiError.notFound(responseMessage.USER_NOT_FOUND);

      let advDetails = await findOrder({
        _id: _id,
        oredrStatus: oredrStatus.PENDING,
      });
      if (!advDetails) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

      let rejectRes = await updateOrder(
        { _id: advDetails._id },
        { oredrStatus: oredrStatus.CANCEL, reason: reason }
      );
      return res.json(new response(rejectRes, responseMessage.ORDER_CANCEL));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /order/deleteOrder:
   *   delete:
   *     summary: deleteOrder
   *     tags:
   *       - ORDER
   *     description: deleteOrder When Admin want to delete Any Order from plateform
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: orderId
   *         description: orderId
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async deleteOrder(req, res, next) {
    console.log(212);
    var validationSchema = Joi.object({
      orderId: Joi.string().required(),
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

      var orderInfo = await findOrder({ _id: validatedBody.orderId });
      if (!orderInfo) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }

      let deleteRes = await deleteOrder({ _id: validatedBody.orderId });
      return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /order/orderList:
   *   get:
   *     tags:
   *       - ORDER
   *     description: orderList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: search
   *         description: search
   *         in: formData
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
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Data found successfully.
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async orderList(req, res, next) {
    const validationSchema = {
      search: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.string().optional(),
      limit: Joi.string().optional(),
    };
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let orderCheck = await findAllOrder({ status: { $ne: status.DELETE } });
      if (orderCheck) {
        let resultOrder = await paginateProductSearch(req.body);
        if (!resultOrder) {
          throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
        } else {
          return res.json(
            new response(resultOrder, responseMessage.DATA_FOUND)
          );
        }
      }
    } catch (error) {
      console.log(error, 300);
      return next(error);
    }
  }
}

export default new orderController();
