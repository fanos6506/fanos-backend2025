import Mongoose, { Schema, Types } from "mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from "../enums/status.js";

var roleModel = new Schema(
  {
    role: { type: String, unique: true },
    description: { type: String },

    userManagement: { type: Boolean, default: false },
    categoryManagement: { type: Boolean, default: false },
    subCategoryManagement: { type: Boolean, default: false },
    productManagement: { type: Boolean, default: false },
    notificationManagement: { type: Boolean, default: false },
    websiteSetting: { type: Boolean, default: false },
    staticContentManagement: { type: Boolean, default: false },
    advertisementManagement: { type: Boolean, default: false },
    paymentManagement: { type: Boolean, default: false },
    commissionManagement: { type: Boolean, default: false },
    bannerManagement: { type: Boolean, default: false },

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

roleModel.plugin(mongoosePaginate);
roleModel.plugin(mongooseAggregatePaginate);
const model_role = Mongoose.model("roles", roleModel);

export default model_role;
