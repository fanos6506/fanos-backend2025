import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;
import status from "../enums/status.js";

var dettingDeliveryModel = new Schema(
  {
    deliveryCharge: { type: Number },
    status: { type: String, default: status.ACTIVE },
  },
  { timestamps: true }
);

dettingDeliveryModel.plugin(mongoosePaginate);
dettingDeliveryModel.plugin(mongooseAggregatePaginate);
const model_deliverySetting = Mongoose.model("deliveryCharge", dettingDeliveryModel);

export default model_deliverySetting;

(async () => {
  let result = await Mongoose.model(
    "deliveryCharge",
    dettingDeliveryModel
  ).find({});
  if (result.length != 0) {
    console.log("Default delivery Charges Set.");
  } else {
    var object1 = {
      deliveryCharge: 40,
    };
    let deliveryChargeResult = await Mongoose.model(
      "deliveryCharge",
      dettingDeliveryModel
    ).create(object1);
    if (deliveryChargeResult) {
      console.log("DEFAULT Delivery Charge Created.", deliveryChargeResult);
    }
  }
}).call();
