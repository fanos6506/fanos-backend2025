import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from "mongoose-paginate-v2";

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;

import status from "../enums/status.js";
var schemaDefinition = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "product" },
    sellerId: { type: Types.ObjectId, ref: "user" },
    userId: { type: Types.ObjectId, ref: "user" },
    reasonType: {
      type: String,
      enum: [
        "Duplicate ad",
        "Inappropriate Content",
        "Misleading Information",
        "Offensive Language",
        "Scam OR Fraud",
        "Other (Please Specify)",
      ],
    },
    description: { type: String },
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE,
    },
  },
  { timestamps: true }
);
schemaDefinition.plugin(mongoosePaginate);
const model_report = Mongoose.model("report", schemaDefinition);

export default model_report;
