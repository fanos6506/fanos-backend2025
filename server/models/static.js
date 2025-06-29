import Mongoose, { Schema } from "mongoose";
import mongoosePaginateImport from "mongoose-paginate-v2";
import mongooseAggregatePaginateImport from "mongoose-aggregate-paginate";

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;
import status from "../enums/status.js";

const options = {
  collection: "static",
  timestamps: true,
};

const staticSchema = new Schema(
  {
    type: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    status: { type: String, default: status.ACTIVE },
  },
  options
);

staticSchema.plugin(mongoosePaginate);
staticSchema.plugin(mongooseAggregatePaginate);

const StaticModel = Mongoose.model("static", staticSchema);
export default StaticModel;

// ✅ الكود الإضافي:
(async () => {
  let result = await StaticModel.find({});
  if (result.length !== 0) {
    console.log("Default Static content already created.");
  } else {
    const objects = [
      {
        type: "TermsConditions",
        title: "Term And Conditions",
        description:
          "A term and conditions agreement is the agreement that includes the terms, the rules and the guidelines of acceptable behavior and other useful sections to which users must agree in order to use or access your website and mobile app.",
      },
      {
        type: "Privacypolicy",
        title: "Privacy Policy",
        description:
          "It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged...",
      },
      {
        type: "UserAgreement",
        title: "User Agreement",
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      },
      {
        type: "RiskWarning",
        title: "Risk Warning",
        description:
          "It has survived not only five centuries, but also the leap into electronic typesetting...",
      },
    ];

    let staticResult = await StaticModel.create(objects);
    if (staticResult) {
      console.log("DEFAULT STATIC Created.", staticResult);
    }
  }
})();
