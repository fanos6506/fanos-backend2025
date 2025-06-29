import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;

import status from "../enums/status.js";


var couponModel = new Schema(
  {
    couponCode: { type: String },
    couponAmount: { type: String },
    currency: {
      type: String,
      enum: ["USD", "EUR", "TRY"], // Example set of currency codes
    },
    couponAmountCreated: { type: String },
    maxUsage: { type: Number },
    couponPercentage: { type: Number},
    currentUsage: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    minimumPurchaseAmount: { type: Number, default: 0 },
    couponUseHistory: [
      {
        userId: { type: String },
        productId: { type: String },
        useAmount: { type: Number },
      },
      {
        timestamps: true,
      },
    ],
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

couponModel.plugin(mongoosePaginate);
couponModel.plugin(mongooseAggregatePaginate);
const model_coupon = Mongoose.model("coupon", couponModel);

export default model_coupon;
