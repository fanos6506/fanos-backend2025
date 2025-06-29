import mongoose from "mongoose";
const schema = mongoose.Schema;
import * as mongoosePaginate from 'mongoose-paginate-v2';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from "../enums/status.js";

var saleBoyModel = new schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    emailId: { type: String },
    mobileNo: { type: String },
    adharNumber: { type: String },
    panNumber: { type: String },
    address: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    profile: { type: String },
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
saleBoyModel.plugin(mongoosePaginate);
saleBoyModel.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("saleBoy", saleBoyModel);
