import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from "mongoose-paginate-v2";

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;

import status from "../enums/status.js";

const notificationSchema = new Schema(
  {
    userId: {
      type: Mongoose.Schema.ObjectId,
      ref: "user",
    },
    deviceToken: {
      type: String,
    },
    title: {
      type: String,
    },
    body: {
      type: String,
    },
    sendBy: {
      type: String,
      default: "",
    },
    currentTime: {
      type: Date,
    },
    currentDay: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      default: status.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);
notificationSchema.plugin(mongoosePaginate);
const model_notification = Mongoose.model("notification", notificationSchema);

export default model_notification;
