import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;

import status from "../enums/status.js";

var storeModel = new Schema(
  {
    storeId: { type: String, unique: true },
    storeName: { type: String },
    ownerName: { type: String },
    storeEmail: { type: String },
    mobileNumber: { type: String },
    adharNumber: { type: String },
    storeAddress: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    storeImage: { type: String },
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

storeModel.plugin(mongoosePaginate);
storeModel.plugin(mongooseAggregatePaginate);
const model_store = Mongoose.model("store", storeModel);

export default model_store;
