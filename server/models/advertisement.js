import mongoose from "mongoose";
const schema = mongoose.Schema;
import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;

import status from "../enums/status.js";

const options = {
  collection: "advertisement",
  timestamps: true,
};

const schemaDefination = new schema(
  {
    img: { type: String },
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE,
    },
  },
  options
);

// تركيب الإضافات
schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);

// إنشاء الموديل
const advertisementModel = mongoose.model("advertisement", schemaDefination);

// تصديره بطريقة ESM فقط
export default advertisementModel;
