import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from "mongoose-paginate-v2";

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;

import status from "../enums/status.js";

var BannerSchema = new Schema(
  {
    img: { type: String },
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE,
    },
  },
  { timestamps: true }
);

BannerSchema.plugin(mongoosePaginate);
const model_banner = Mongoose.model("Banner", BannerSchema);

export default model_banner;

Mongoose.model("Banner", BannerSchema)
  .find()
  .then((res) => {
    if (res.length === 0) {
      var obj = [
        {
          img: "https://res.cloudinary.com/dwzsaevaw/image/upload/v1677236985/refer_and_earn_efs86i.png",
        },
        {
          img: "https://res.cloudinary.com/dwzsaevaw/image/upload/v1677236984/Trading_BOT_vdlpwm.png",
        },
        {
          img: "https://res.cloudinary.com/dwzsaevaw/image/upload/v1677236984/Parental_Control_bvtx3w.png",
        },
        {
          img: "https://res.cloudinary.com/dwzsaevaw/image/upload/v1677236985/Insurance_cov5m0.png",
        },
        {
          img: "https://res.cloudinary.com/dwzsaevaw/image/upload/v1677236984/Discount_Bonus_oh2az8.png",
        },
        {
          img: "https://res.cloudinary.com/dwzsaevaw/image/upload/v1677236979/Ed-tech_gstxwe.png",
        },
      ];

      (async () => {
        for (const ele of obj) {
          try {
            const banner = new (Mongoose.model("Banner", BannerSchema))(ele);
            const result1 = await banner.save();
            console.log("Create Banner.", result1);
          } catch (err1) {
            console.log("Error with bonus types save created ", err1);
          }
        }
      })();
      
    }
  });
