import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;

import status from "../enums/status.js";

const options = {
  collection: "wishlist",
  timestamps: true,
};

var schemaDefinition = new Schema(
  {
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    ownerId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    productId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    status: { type: String, default: status.ACTIVE },
  },
  options,
  { timestamps: true }
);

schemaDefinition.plugin(mongoosePaginate);
schemaDefinition.plugin(mongooseAggregatePaginate);
const model_whishlist = Mongoose.model("wishlist", schemaDefinition);

export default model_whishlist;

