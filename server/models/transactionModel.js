import Mongoose, { Schema, Types } from "mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status.js';


var transactionModel = new Schema(

  {
    transaction: { type: Object },
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    amount: {
      type: Number
    },
    orderId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "order"
    },
    transactionid: { type: String },
    paymentReference: { type: String },
    transactionStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUND"]
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "UNPAID"]
    },
    transactionType: { type: String },
    status: { type: String, default: status.ACTIVE },
  },
  { timestamps: true }
);

transactionModel.plugin(mongoosePaginate);
transactionModel.plugin(mongooseAggregatePaginate)
const model_transactionModel = Mongoose.model("transaction", transactionModel);

export default model_transactionModel;

