import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;
import status from "../enums/status.js";


var orderModel = new Schema(
  {
    productId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    quantity: { type: Number },
    orderType: {
      type: String,
      enum: ["BUY", "SELL"],
    },
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    addressId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "addresses",
    },
    price: { type: Number },
    deliveryCharge: { type: Number, default: 0 },
    orderStatus: {
      type: String,
      enum: ["COMPLETE", "PENDING"],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETE", "FAILED"],
      default: "PENDING",
    },
    buyDate: { type: Date },
    sellDate: { type: Date },
    totalAmount: { type: Number },
    status: { type: String, default: status.ACTIVE },
  },
  { timestamps: true }
);

orderModel.plugin(mongoosePaginate);
orderModel.plugin(mongooseAggregatePaginate);
orderModel.index({ location: "2dsphere" });
const model_orderModel = Mongoose.model("order", orderModel);

export default model_orderModel;
