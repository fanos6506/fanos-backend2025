import Joi from "joi";
import { joiPasswordExtendCore } from "joi-password";
const joiPassword = Joi.extend(joiPasswordExtendCore);
import * as _ from 'lodash';
import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import * as bcrypt from 'bcryptjs';
import responseMessage from "../../../../../assets/responseMessage.js";
import commonFunction from "../../../../helper/util.js";
import status from "../../../../enums/status.js";
import userType from "../../../../enums/userType.js";
import approveStatus from "../../../../enums/approveStatus.js";
import paymentStatus from "../../../../enums/paymentStatus.js";
import config from "config";

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

import  notificationServices  from "../../services/notification.js";
const { notificationCreate, notificationData, notificationUpdate } =
  notificationServices;

import  productServices  from "../../services/product.js";
const {
  createProduct,
  findProduct,
  findOneProduct,
  updateProduct,
  deleteProduct,
  deleteallProducts,
  countProduct,
  productList,
  productListWithPagination,
  featureProductsList,
  findAllProduct,
} = productServices;

import  paymentServices  from "../../services/payment.js";
const { createPayment, updatePayment, findPaymentDeatils } = paymentServices;

import  addressesService  from "../../services/addresses.js";
const {
  createAddresses,
  findAddresses,
  findListAddresses,
  updateAddresses,
  deleteAddresses,
  paginateAddressSearch,
} = addressesService;

import  deliveryChargeServices  from "../../services/deliverySet.js";
import orderStatus from "../../../../enums/orderStatus.js";
const { findDeliveryCharge, updateDeliveryCharge } = deliveryChargeServices;

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

import  supervisorServices  from "../../services/supervisor.js";
import mongoose from "mongoose";
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
  updateCouponById,
  addCoupon,
  getCoupon,
  deleteCoupon,
  getAllCouponList,
  getSingleCoupon,
  updateCoupon,
  couponDelete,
} = supervisorServices;

export class adminController {
  
  async applyCoupon(req, res, next) {
    const validationSchema = Joi.object({
      productId: Joi.string().required(),
      CouponCode: Joi.string().required(),
    });
  
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
  
      const userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
  
      const productResult = await findProduct({ _id: validatedBody.productId });
      if (!productResult) {
        throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
      }
  
      const couponData = await getCoupon({
        couponCode: validatedBody.CouponCode,
        status: { $ne: status.BLOCK },
      });
  
      if (!couponData) {
        throw apiError.notFound(responseMessage.COUPON_CODE_IS_NOT_VALID);
      }
  
      if (couponData.isUse) {
        throw apiError.notFound(responseMessage.COUPON_CODE_IS_ALREADY_USED);
      }
  
      // ✅ تحقق من العملة
      //if (couponData.currency !== productResult.currency) {
        //throw apiError.notFound(responseMessage.COUPON_PRODUCT_CURRENCY_MISMATCH);
      //}
  
      const couponPercentage1 = couponData.couponPercentage;
      if (couponPercentage1 < 0 || couponPercentage1 > 100) {
        throw new Error('Invalid coupon percentage');
      }
  
      const productPrice = productResult.price;
      const couponPrice = (couponPercentage1 / 100) * productPrice;

      console.log("🔍 Product Price:", productPrice);
      console.log("🔍 Coupon Percentage:", couponPercentage1);
      console.log("🔍 Calculated Coupon Price:", couponPrice);
      console.log("🔍 Stored couponAmount:", couponData.couponAmount);
  
      const threshold = 0.0001;
      //if (Math.abs(couponData.couponAmount - couponPrice) > threshold) {
        //throw new Error('Invalid coupon price');
      //}
  
      // ✅ تحقق إذا استخدم الكوبون من قبل نفس المستخدم
      if (couponData.couponUseHistory.some((use) => use.userId === req.userId)) {
        throw apiError.notFound(responseMessage.COUPON_CODE_IS_ALREADY_USED);
      }
  
      const totalPostingFees = 0;
  
      await updateCouponById(
        { _id: couponData._id },
        {
          $push: {
            couponUseHistory: {
              userId: req.userId,
              useAmount: totalPostingFees,
              productId: productResult._id,
            },
          },
          $set: {
            couponAmount: 0,
            isUse: true,
            status: status.DEACTIVE,
          },
        }
      );
  
      const obj = {
        userId: req.userId,
        CouponCode: couponData.couponCode,
        paymentStatus: approveStatus.APPROVED,
        orderType: 'ADD_PRODUCT',
        paymentMethod: 'COUPONCODE',
        totalPaymentAmount: 0,
        taxAmount: 0,
        totalAmount: totalPostingFees,
        CouponCodeUsed: couponData.couponCode,
        couponId: couponData._id,
        productId: validatedBody.productId,
      };
  
      await createPayment(obj);
      await updateProduct(
        { _id: validatedBody.productId },
        { paymentStatus: approveStatus.APPROVED }
      );
  
      return res.json(new response({}, responseMessage.PAYMENT_success));
    } catch (error) {
      console.log("❌ applyCoupon error:", error);
      return next(error);
    }
  }
  

async checkoutProduct(req, res, next) {
  var validationSchema = Joi.object({
    productId: Joi.string().required(),
  });
  try {
    var validatedBody = await validationSchema.validateAsync(req.query);
    console.log(validatedBody);
    let productRes = await findOneProduct({
      _id: validatedBody.productId,
      approveStatus: approveStatus.PENDING,
      status: status.ACTIVE,
    });
    if (!productRes) {
      throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
    }
    productRes = JSON.parse(JSON.stringify(productRes));
    productRes.postingFees = 0.0;
    productRes.tax = 0.0;
    productRes.total = productRes.postingFees + productRes.tax;
    return res.json(new response(productRes, responseMessage.PRODUCT_FOUND));
  } catch (error) {
    console.log(error);
    return next(error);
  }
}

    async checkoutOrder(req, res, next) {
    var validationSchema = Joi.object({
      productId: Joi.string().required(),
      shippingAddressId: Joi.string().required(),
      paymentMethod: Joi.string().required(),
      couponCode: Joi.string().required(),
    });
    try {
      var validatedBody = await validationSchema.validateAsync(req.query);

      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let productRes = await findOneProduct({
        _id: validatedBody.productId,
        approveStatus: approveStatus.APPROVED,
        status: status.ACTIVE,
      });
      if (!productRes) {
        throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
      }

      let shippingAddressResult = await findAddresses({
        _id: validatedBody.shippingAddressId,
      });
      if (!shippingAddressResult) {
        throw apiError.notFound(responseMessage.SHIPPING_ADDRESS_NOT_FOUND);
      }

      if (validatedBody.paymentMethod == "COUPONCODE") {
        let deliveryChargeRes = await findDeliveryCharge();
        if (!deliveryChargeRes)
          throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

        const deliveryCharge = deliveryChargeRes.deliveryCharge;
        const subTotal = productRes.price;
        const totalPayment = subTotal + deliveryCharge;

        let couponData = await getCoupon({
          couponCode: validatedBody.couponCode,
          status: { $ne: status.BLOCK },
        });
        if (!couponData)
          throw apiError.notFound(responseMessage.COUPON_CODE_IS_NOT_VALID);

        if (couponData.CouponCode == validatedBody.couponCode)
          throw apiError.notFound(responseMessage.COUPON_CODE_IS_NOT_VALID);

        let couponPrice = couponData.couponAmount;
        let remainingCouponPriceAmount = couponPrice - totalPayment;

        if (couponPrice < totalPayment)
          throw apiError.notFound(
            responseMessage.COUPON_AMOUNT_IS_LESS_THAN_TOTAL_PAYMENT_AMOUNT
          );
          if (couponData.minimumPurchaseAmount > totalPayment)
          throw apiError.notFound(
            `Minimum purchase amount should be greater than ${couponData.minimumPurchaseAmount}`
          );
          if (couponData.maxUsage <= couponData.couponUseHistory.length)
          throw apiError.notFound(`Coupon code is expired`);
        if(couponData.endDate < new Date())
        throw apiError.notFound(`Coupon code is expired`);
        if(couponData.startDate > new Date())
        throw apiError.notFound(`Coupon code is not valid`);
        const paymetData = {
          userId: req.userId,
          productId: validatedBody.productId,
          shippingAddressId: validatedBody.shippingAddressId,
          paymentMethod: validatedBody.paymentMethod,
          paymentStatus: approveStatus.APPROVED,
          orderType: "BUY_PRODUCT",
          couponId: couponData._id,
          couponCode: couponData.couponCode,
          deliveryCharge: deliveryCharge,
          subTotal: subTotal,
          couponPrice: couponPrice,
          totalPaymentAmount: totalPayment,
        };

        const orderData = {
          productId: validatedBody.productId,
          orderType: "BUY",
          userId: req.userId,
          addressId: validatedBody.shippingAddressId,
          orderStatus: orderStatus.COMPLETE,
          price: productRes.price,
          deliveryCharge: deliveryCharge,
          paymentStatus: "COMPLETE",
          buyDate: new Date(),
          totalAmount: totalPayment,
        };

        const sellData = {
          productId: validatedBody.productId,
          orderType: "SELL",
          userId: productRes.userId,
          addressId: validatedBody.shippingAddressId,
          orderStatus: orderStatus.COMPLETE,
          price: productRes.price,
          deliveryCharge: deliveryCharge,
          paymentStatus: "COMPLETE",
          buyDate: new Date(),
          totalAmount: totalPayment,
        };

        await updateCoupon(
          { couponCode: validatedBody.couponCode },
          {
            $push: {
              couponUseHistory: {
                userId: req.userId,
                useAmount: totalPayment,
                productId: validatedBody.productId,
              },
            },
            $set: { couponAmount: remainingCouponPriceAmount },
          }
        );
        await createOrder(orderData);
        await updateProduct(
          { _id: validatedBody.productId },
          { status: "SOLD" }
        );
        await createOrder(sellData);

        let paymentRes = await createPayment(paymetData);
        if (!paymentRes)
          throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

        return res.json(new response({}, responseMessage.PAYMENT_SUCCESS));
      }
    } catch (error) {
      console.log(error, "error");
      return next(error);
    }
  }

  async useProductCheckOut(req, res, next) {
    const validationSchema = Joi.object({
      productId: Joi.string().required(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);

      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let productRes = await findOneProduct({
        _id: validatedBody.productId,
        approveStatus: approveStatus.APPROVED,
        status: status.ACTIVE,
      });
      if (!productRes) {
        throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
      }

      let deliveryChargeRes = await findDeliveryCharge();
      if (!deliveryChargeRes)
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

      const deliveryCharge = deliveryChargeRes.deliveryCharge;
      const subTotal = productRes.price;
      const totalPayment = subTotal + deliveryCharge;

      let orderData = {
        userId: req.userId,
        productId: validatedBody.productId,
        paymentStatus: approveStatus.APPROVED,
        deliveryCharge: deliveryCharge,
        subTotal: subTotal,
        totalPaymentAmount: totalPayment,
      };
      return res.json(new response(orderData, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log(error, "error");
      return next(error);
    }
  }
}
export default new adminController();
