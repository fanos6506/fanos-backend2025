import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from "mongoose-paginate-v2";

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;

import status from "../enums/status.js";

var subCategoryModel = new Schema(
  {
    subCategoryName: {
      type: String,
    },
    categoryId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
    subCategoryImage: {
      type: String,
    },
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE,
    },
  },
  { timestamps: true }
);

subCategoryModel.plugin(mongoosePaginate);
const model_subCategory = Mongoose.model("subCategory", subCategoryModel);

export default model_subCategory;
