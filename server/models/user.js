import Mongoose, { Schema } from "mongoose";

import mongoosePaginateImport from 'mongoose-paginate-v2';
import mongooseAggregatePaginateImport from 'mongoose-aggregate-paginate';
import bcryptImport from 'bcryptjs';

import userType from "../enums/userType.js";
import status from "../enums/status.js";
import approveStatus from "../enums/approveStatus.js";
import privacyType from "../enums/privacyType.js";

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;
const mongooseAggregatePaginate = mongooseAggregatePaginateImport?.default || mongooseAggregatePaginateImport;
const bcrypt = bcryptImport?.default || bcryptImport;

const userSchema = new Schema(
  {
    likesUserId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    userId: { type: Number },
    email: { type: String },
    name: { type: String, default: "" },
    countryCode: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },
    password: { type: String },
    otp: { type: String },
    otpTime: { type: Number },
    deviceToken: { type: String, default: "" },
    deviceType: { type: String },
    address: { type: String },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    userName: { type: String, default: "" },
    location: { type: String, default: "" },
    isReset: { type: Boolean },
    isOnline: { type: Boolean },
    otpVerification: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    failedAttemptReqTime: { type: Date, default: null },
    attempExceedTime: { type: Date, default: null },
    profilePic: { type: [String], default: "" },
    userType: {
      type: String,
      enum: [
        userType.ADMIN,
        userType.USER,
        userType.MODERATOR,
        userType.supervisor,
      ],
      default: userType.USER,
    },
    dateOfBirth: { type: String },
    gender: { type: String },
    zipCode: { type: String },
    followers: [{ type: Schema.Types.ObjectId, ref: "user" }],
    followersCount: { type: Number, default: 0 },
    following: [{ type: Schema.Types.ObjectId, ref: "user" }],
    likesUser: [{ type: Schema.Types.ObjectId, ref: "user" }],
    likesUserCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    whoCanSee: { type: [String] },
    status: { type: String, default: status.ACTIVE },
    roleId: { type: Schema.Types.ObjectId, ref: "role" },
  },
  { timestamps: true }
);

userSchema.plugin(mongoosePaginate);
userSchema.plugin(mongooseAggregatePaginate);

// ✅ بناء الموديل
const model_user = Mongoose.model("user", userSchema);

// ✅ إنشاء الأدمن الافتراضي
(async () => {
  try {
    const admins = await model_user.find({ userType: userType.ADMIN });
    if (admins.length > 0) {
      console.log("Default Admin 🤪😃😁");
    } else {
      const obj = {
        userType: userType.ADMIN,
        name: "Mobiloitte",
        countryCode: "",
        mobileNumber: "",
        email: "hossamsabbagh2015@gmail.com",
        password: bcrypt.hashSync("SuSu.2024@"),
        address: "Pune, Maharastra",
        otpVerification: true,
      };
      const newAdmin = await model_user.create(obj);
      console.log("Default Admin Created 😇😉😄", newAdmin);
    }
  } catch (err) {
    console.log("DEFAULT ADMIN ERROR", err);
  }
})();

// ✅ تصدير الموديل الافتراضي
export default model_user;
