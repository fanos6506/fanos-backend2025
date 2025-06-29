import mongoose, { Schema } from "mongoose";
import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;
import status from "../enums/status.js";
import userType from "../enums/userType.js";

const options = {
  collection: "contactUs",
  timestamps: true,
};

const contactUsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    name: { type: String },
    email: { type: String },
    message: { type: String },
  },
  options
);

contactUsSchema.plugin(mongoosePaginate);
contactUsSchema.plugin(mongooseAggregatePaginate);

const ContactUsModel = mongoose.model("contactUs", contactUsSchema);

export default ContactUsModel;
