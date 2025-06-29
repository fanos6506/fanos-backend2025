import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;

import approveStatus from "../enums/approveStatus.js";

var paymentModel = new Schema(
  {
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    paymentStatus: {
      type: String,
      enum: [
        approveStatus.APPROVED,
        approveStatus.PENDING,
        approveStatus.REJECTED,
      ],
      default: approveStatus.PENDING,
    },
    orderType: {
      type: String,
      enum: ["ADD_PRODUCT", "BUY_PRODUCT"],
    },
    paymentMethod: {
      type: String,
      enum: ["IBAN", "MASTERCARD", "COUPONCODE"],
    },
    totalPaymentAmount: {
      type: Number,
    },
    taxAmount: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    couponCodeUsed: {
      type: String,
    },
    couponCode: {
      type: String,
    },
    deliveryCharge: {
      type: Number,
    },
    couponPrice: {
      type: Number,
    },
    subTotal: {
      type: Number,
    },
    couponId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "coupon",
    },
    productId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    shippingAddressId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "addresses",
    },
    couponDiscountAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);

paymentModel.plugin(mongoosePaginate);
paymentModel.plugin(mongooseAggregatePaginate);
const model_payment = Mongoose.model("payment", paymentModel);

export default model_payment;
