import Mongoose, { Schema } from "mongoose";
import mongoosePaginateImport from "mongoose-paginate-v2";

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;

import status from "../enums/status.js";

const websiteSettingSchema = new Schema(
  {
    siteMaintainanceMode: {
      type: String,
      enum: ["ENABLE", "DISABLE"],
    },
    maintainanceModeText: { type: String },
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE,
    },
  },
  { timestamps: true }
);

websiteSettingSchema.plugin(mongoosePaginate);

const model_websiteSetting = Mongoose.model("websiteSetting", websiteSettingSchema);

// ✅ تحقق من وجود إعدادات الموقع الافتراضية
(async () => {
  try {
    const settings = await model_websiteSetting.find({});
    if (settings.length > 0) {
      console.log("Default website settings already exist.");
    } else {
      const object1 = {
        siteMaintainanceMode: "DISABLE",
        maintainanceModeText: "Site is under maintenance",
      };
      const createdSetting = await model_websiteSetting.create(object1);
      console.log("DEFAULT website settings created.", createdSetting);
    }
  } catch (err) {
    console.log("Error in websiteSettingSchema:", err);
  }
})();

// ✅ تصدير واحد صحيح
export default model_websiteSetting;
