import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;

const feedbackModel = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

feedbackModel.plugin(mongoosePaginate);
feedbackModel.plugin(mongooseAggregatePaginate);
const model_feedback = Mongoose.model("feedbackMessage", feedbackModel);

export default model_feedback;
