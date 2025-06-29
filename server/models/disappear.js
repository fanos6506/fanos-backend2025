import Mongoose, { Schema } from "mongoose";
import status from "../enums/status.js";

const options = {
  collection: "disappear",
  timestamps: true,
};
const appearModel = new Schema(
  {
    disappear: { type: Boolean, default: false },
    time: { type: Number, default: 0 },
    senderId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    receiverId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    status: { type: String, default: status.ACTIVE },
  },
  options
);
const model_disappear = Mongoose.model("disappear", appearModel);

export default model_disappear;
