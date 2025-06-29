import Mongoose, { Schema } from "mongoose";
import mongoosePaginateImport from "mongoose-paginate-v2";
import mongooseAggregatePaginateImport from "mongoose-aggregate-paginate";

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;

const searchSchema = new Schema(
  {
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    serchText: {
      type: String,
    },
  },
  { timestamps: true }
);

searchSchema.plugin(mongoosePaginate);
searchSchema.plugin(mongooseAggregatePaginate);

const searchModel = Mongoose.model("search", searchSchema);

export default searchModel;
