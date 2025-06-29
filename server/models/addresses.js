import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from "mongoose-paginate-v2";
import mongooseAggregatePaginateImport from "mongoose-aggregate-paginate";

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;

import addressType from "../enums/addressTypes.js";
var addressesModel = new Schema(
  {
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    name: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    addressType: {
      type: String,
      enum: [addressType.HOME, addressType.WORK, addressType.OTHER],
    },
    addressLine1: {
      type: String,
    },
    addressLine2: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    pincode: {
      type: Number,
    },
  },
  { timestamps: true }
);

addressesModel.plugin(mongoosePaginate);
addressesModel.plugin(mongooseAggregatePaginate);
const model_addresses = Mongoose.model("addresses", addressesModel);

export default model_addresses;
