import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;

import status from "../enums/status.js";

var invoiceModel = new Schema(
  {
    userId: { type: String },
    invoiceDate: { type: Date, default: Date.now },
    couponCode: { type: String },
    amount: { type: Number },
    status: { type: String, default: status.ACTIVE },
  },
  { timestamps: true }
);

invoiceModel.plugin(mongoosePaginate);
invoiceModel.plugin(mongooseAggregatePaginate);
const model_invoice = Mongoose.model("invoice", invoiceModel);

export default model_invoice;
