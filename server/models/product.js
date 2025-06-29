import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;

import status from "../enums/status.js";
import approveStatus from "../enums/approveStatus.js";

var productModel = new Schema(
  {
    productName: {
      type: String,
    },
    productGenerateId: {
      type: String,
    },
    productImage: [String],
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    city: {
      type: String,
    },
    featureProduct: { type: Boolean, default: false },

    categoryId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
    subCategoryId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "subCategory",
    },
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    likesUser: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    price: {
      type: Number,
    },
    currency: {
      type: String,
    },
    weight: {
      type: String,
    },
    approveStatus: {
      type: String,
      enum: [
        approveStatus.APPROVED,
        approveStatus.PENDING,
        approveStatus.REJECTED,
      ],
      default: approveStatus.PENDING,
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
    status: {
      type: String,
      default: status.ACTIVE,
    },
    lat: {
      type: Number,
      default: 0,
    },
    long: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
    },
  },
  { timestamps: true }
);

productModel.plugin(mongoosePaginate);
productModel.plugin(mongooseAggregatePaginate);
const model_product = Mongoose.model("product", productModel);

export default model_product;
