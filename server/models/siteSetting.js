import mongoose from "mongoose";
const schema = mongoose.Schema;
import * as mongoosePaginate from 'mongoose-paginate-v2';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from "../enums/status.js";

const options = {
  collection: "siteSetting",
  timestamps: true,
};

const schemaDefination = new schema(
  {
    userId: {
      type: schema.Types.ObjectId,
      ref: "user",
    },
    googleLink: { type: String },
    twitterLink: { type: String },
    androidAppLink: { type: String },
    iosAppLink: { type: String },
    socialLoginHeading: { type: String },
    appLinkHeading: { type: String },
    generalTextBeforeLogin: { type: String },
    generalTextAfterLogin: { type: String },
    details: { type: String },
    image: { type: String },
    status: { type: String, default: status.ACTIVE },
  },
  options
);

schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("siteSetting", schemaDefination);
