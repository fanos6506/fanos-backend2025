import mongoose, { Schema } from "mongoose";
import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;
import status from "../enums/status.js";

const options = {
  collection: "faq",
  timestamps: true,
};

const faqSchema = new Schema(
  {
    question: { type: String },
    answer: { type: String },
    status: { type: String, default: status.ACTIVE },
  },
  options
);

faqSchema.plugin(mongoosePaginate);
faqSchema.plugin(mongooseAggregatePaginate);

const faqModel = mongoose.model("faq", faqSchema);

export default faqModel;
