import Joi from "joi";
import { joiPasswordExtendCore } from "joi-password";
const joiPassword = Joi.extend(joiPasswordExtendCore);
import * as _ from 'lodash';
import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import  bcrypt from 'bcryptjs';
import responseMessage from "../../../../../assets/responseMessage.js";
import userModel from "../../../../models/user.js";
import commonFunction from "../../../../helper/util.js";
import status from "../../../../enums/status.js";
import userType from "../../../../enums/userType.js";
import { Country, State, City } from "country-state-city";
import maintainance from "../../../../models/websiteSetting.js";
import SearchModel from "../../../../models/search.js";
import Product from "../../../../models/product.js";

import  userServices from "../../services/user.js";
const {
  emailMobileExist,
  createUser,
  findUser,
  userFindList,
  updateUser,
  updateUserById,
  findUserDatax,
} = userServices;

import  wishlistServices  from "../../services/wishlist.js";
const {
  createWishlist,
  deleteWishlistData,
  findWishlist,
  paginateWishlist,
  deleteWishlist,
  wishlist,
} = wishlistServices;

import  productServices  from "../../services/product.js";
const {
  findProduct,
  findAllProductNew,
  featureProductsList,
  productListWithPaginationNew,
  recentProductsList,
} = productServices;

import  supervisorServices  from "../../services/supervisor.js";
const { getCoupon, updateCoupon } = supervisorServices;

import  notificationServices  from "../../services/notification.js";
const { notificationCreate , notificationList} = notificationServices;

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

import bcryptPkg from "bcryptjs";
const { hashSync } = bcryptPkg;








export class userController {
  
  /**
   * @swagger
   * components:
   *   securitySchemes:
   *     tokenauth:
   *       type: apiKey
   *       in: header
   *       name: token
   *       description: قم بإدخال التوكن مباشرة بدون إضافات. مثال - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * 
   *   responses:
   *     UnauthorizedError:
   *       description: غير مصرح به - التوكن غير صالح أو مفقود
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: boolean
   *                 example: false
   *               message:
   *                 type: string
   *                 example: "غير مصرح به"
   * 
   * security:
   *   - tokenauth: []
   */

  /**
   * @swagger
   * /user/signup:
   *   post:
   *     summary: Signup User
   *     tags:
   *       - User
   *     description: Signup User
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               confirmPassword:
   *                 type: string
   *             required:
   *               - name
   *               - email
   *               - password
   *               - confirmPassword
   *     responses:
   *       200:
   *         description: User signup successfully
   */
  async signup(req, res, next) {
    const validationSchema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string()
        .email({ minDomainSegments: 2 })
        .message("Email is not valid"),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .messages({
          "password.minOfUppercase":
            "password should contain at least {#min} uppercase character",
          "password.minOfSpecialCharacters":
            "password should contain at least {#min} special character",
          "password.minOfLowercase":
            "password should contain at least {#min} lowercase character",
          "password.minOfNumeric":
            "password should contain at least {#min} numeric character",
          "password.noWhiteSpaces": "password should not contain white spaces",
          "password.min": "password length must be password",
        }),
      confirmPassword: Joi.ref("password"),
      mobileNumber: Joi.string().allow('').optional(),
      countryCode: Joi.string().allow('').optional()
    });
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email, password, confirmPassword, name } = validatedBody;
      var userInfo = await findUser(
        { email: email },
        { userType: userType.USER, status: { $ne: status.DELETE } }
      );

      if (userInfo) {
        if (userInfo.email == email) {
          if (userInfo.status === status.BLOCK) {
            throw apiError.conflict(responseMessage.BLOCK_USER_EMAIL_BY_ADMIN);
          } else if (userInfo.otpVerification == true) {
            throw apiError.conflict(responseMessage.EMAIL_EXIST);
          }
        }
      }
      if (validatedBody.password !== validatedBody.confirmPassword) {
        throw apiError.badRequest(responseMessage.PWD_CFMPWD_NOT_MATCH);
      }
      validatedBody.password = bcrypt.hashSync(validatedBody.password);
      validatedBody.otp = commonFunction.getOTP();
      validatedBody.otpTime = new Date().getTime() + 180000;

      if (userInfo) {
        if (userInfo.otpVerification == false) {
          await commonFunction.sendEmailOtpForSignup(email, validatedBody.otp);
          let updateUserData = await updateUser(
            { _id: userInfo._id },
            validatedBody
          );
          let obj = {
            _id: updateUserData._id,
            email: updateUserData.email,
            otp: updateUserData.otp,
          };
          return res.json(new response(obj, responseMessage.OTP_SEND));
        }
      }
      await commonFunction.sendEmailOtpForSignup(email, validatedBody.otp);
      let userdata = await createUser(validatedBody);
      let obj = {
        _id: userdata._id,
        email: userdata.email,
        otp: userdata.otp,
      };
      return res.json(new response(obj, responseMessage.OTP_SEND));
    } catch (error) {
      console.log(error, 123);
      return next(error);
    }
  }
  /**
   * @swagger
   * /user/verifySignUpOTP:
   *   post:
   *     summary: Verify Signup OTP
   *     tags:
   *       - User
   *     description: Verify OTP sent during signup process
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               _id:
   *                 type: string
   *                 description: User ID
   *               otp:
   *                 type: string
   *                 description: OTP received via email
   *             required:
   *               - _id
   *               - otp
   *     responses:
   *       200:
   *         description: OTP verified successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 _id:
   *                   type: string
   *                 email:
   *                   type: string
   *                 otpVerification:
   *                   type: boolean
   *       400:
   *         description: Invalid OTP or OTP expired
   *       404:
   *         description: User not found
   */
  async verifySignUpOTP(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
      otp: Joi.string().required(),
    });
    try {
      var validatedBody = await validationSchema.validateAsync(req.body);
      const { _id, otp } = validatedBody;
      var userResult = await findUserDatax({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      var attemp = userResult.attempts;

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      if (new Date().getTime() > userResult.failedAttemptReqTime) {
        attemp = 0;
        await userModel.updateOne(
          { email: userResult.email },
          { $set: { attempts: attemp } }
        );
      }

      if (new Date().getTime() < userResult.attempExceedTime) {
        throw apiError.alreadyExist(responseMessage.LIMIT_EXCEED);
      }

      if (new Date().getTime() > userResult.otpTime) {
        throw apiError.badRequest(responseMessage.OTP_EXPIRED);
      }
      if (userResult.otp != otp) {
        if (attemp < 4) {
          attemp = attemp + 1;
          await userModel.updateOne(
            { email: userResult.email },
            {
              $set: {
                attempts: attemp,
                failedAttemptReqTime: new Date().getTime() + 20 * 60000,
              },
            }
          );
          throw apiError.badRequest(responseMessage.INCORRECT_OTP);
        } else {
          let time = new Date().getTime() + 3 * 60000;
          await userModel.updateOne(
            { email: userResult.email },
            { $set: { attempts: 0, attempExceedTime: time } }
          );
          throw apiError.alreadyExist(responseMessage.LIMIT_EXCEED);
        }
      }
      const updateResult = await updateUser(
        { _id: userResult._id },
        { otpVerification: true }
      );

      await notificationCreate({
        userId: updateResult._id,
        title: "Account Created",
        body: `Hi ${updateResult.name} your account has been created successfully`,
        currentTime: new Date().toISOString(),
        currentDay: daysOfWeek[new Date().getDay()],
      });
      const obj = {
        _id: updateResult._id,
        email: updateResult.email,
        otpVerification: true,
      };
      return res.json(new response(obj, responseMessage.Acc_Created));
    } catch (error) {
      return next(error);
    }
  }

   /**
   * @swagger
   * /user/login:
   *   post:
   *     summary: User Login
   *     tags:
   *       - User
   *     description: User Login
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *             required:
   *               - email
   *               - password
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async login(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string()
        .email()
        .message("Email is not valid"),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .messages({
          "string.min": "Password must be at least 6 characters.",
          "string.max": "Password must be at most 16 characters.",
          "string.empty": "Please enter your password."
        }),
      deviceToken: Joi.string().allow("").optional(),
      deviceType: Joi.string().allow("").optional(),
    });
    try {
      let token;
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      const { email, password, deviceToken, deviceType } =
        await validationSchema.validateAsync(req.body);
      var userResult = await findUser({
        $and: [
          { status: { $ne: status.DELETE } },
          { email: email },
          { userType: userType.USER },
        ],
      });
      // --- Debugging print ---
      console.log('LOGIN DEBUG:', {
        inputEmail: email,
        inputPassword: password,
        dbPassword: userResult ? userResult.password : undefined,
        compareResult: userResult ? bcrypt.compareSync(password, userResult.password) : undefined,
        userFound: !!userResult
      });
      // --- End Debugging print ---
      if (!userResult) {
        throw apiError.notFound(responseMessage.INVALID_CREDENTIALS);
      }
      if (userResult.status === status.BLOCK) {
        throw apiError.badRequest(
          responseMessage.BLOCK_USER_BY_ADMIN_PLEASE_CONTACT_ADMIN
        );
      }
      if (userResult.otpVerification === false) {
        throw apiError.badRequest(responseMessage.OTP_NOT_VERIFIED);
      }
      if (
        !userResult.password ||
        !bcrypt.compareSync(password, userResult.password)
      ) {
        throw apiError.invalid(responseMessage.INCORRECT_LOGIN);
      }
      if (deviceToken) {
        await updateUser({ _id: userResult._id }, { deviceToken: deviceToken });
      }
      token = await commonFunction.getToken({
        _id: userResult._id,
        email: userResult.email,
        userType: userResult.userType,
      });
      await notificationCreate({
        userId: userResult._id,
        title: "User Login",
        body: `User has been logged in successfully`,
        currentTime: new Date().toISOString(),
        currentDay: daysOfWeek[new Date().getDay()],
      });
      let obj = {
        _id: userResult._id,
        email: userResult.email || userResult.mobileNumber,
        name: userResult.name,
        token: token,
        otpVerification: userResult.otpVerification,
        userType: userResult.userType,
        status: userResult.status,
      };
      await Promise.all([
        updateUser(
          { _id: userResult._id, userType: userType.USER },
          { $set: { isOnline: true } }
        ),
      ]);
      return res.json(new response(obj, responseMessage.LOGIN));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/forgotPassword:
   *   put:
   *     summary: Forgot Password
   *     tags:
   *       - User
   *     description: Send OTP for password reset
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *             required:
   *               - email
   *     responses:
   *       200:
   *         description: OTP sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 _id:
   *                   type: string
   *                 email:
   *                   type: string
   *                 otp:
   *                   type: string
   *       404:
   *         description: User not found
   */
  async forgotPassword(req, res, next) {
    var validationSchema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "in"] } })
        .message("Email is not valid"),
    });
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      var validatedBody = await validationSchema.validateAsync(req.body);
      const { email } = validatedBody;
      var userResult = await findUser({
        $and: [{ status: { $ne: status.DELETE } }, { email: email }],
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var otp = commonFunction.getOTP();
      var otpTime = new Date().getTime() + 300000;
      if (userResult.email == email) {
        commonFunction.sendForgotPasswordOtp(email, otp);
      }
      var updateResult = await updateUser(
        { _id: userResult._id },
        { otp: otp, otpTime: otpTime, otpVerification: false }
      );
      let obj = {
        _id: updateResult._id,
        email: updateResult.email,
        otp: updateResult.otp,
      };
      return res.json(new response(obj, responseMessage.OTP_SEND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/verifyOTP:
   *   post:
   *     summary: Verify OTP
   *     tags:
   *       - User
   *     description: Verify OTP for user (login, password reset, etc)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               _id:
   *                 type: string
   *               otp:
   *                 type: string
   *             required:
   *               - _id
   *               - otp
   *     responses:
   *       200:
   *         description: OTP verified successfully
   *       400:
   *         description: Invalid or expired OTP
   */
  async verifyOTP(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
      otp: Joi.string().required(),
    });
    try {
      var validatedBody = await validationSchema.validateAsync(req.body);
      const { _id, otp } = validatedBody;
      var userResult = await findUserDatax({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      var attemp = userResult.attempts;

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      if (new Date().getTime() > userResult.failedAttemptReqTime) {
        attemp = 0;
        await userModel.updateOne(
          { email: userResult.email },
          { $set: { attempts: attemp } }
        );
      }

      if (new Date().getTime() < userResult.attempExceedTime) {
        throw apiError.alreadyExist(responseMessage.LIMIT_EXCEED);
      }

      if (new Date().getTime() > userResult.otpTime) {
        throw apiError.badRequest(responseMessage.OTP_EXPIRED);
      }
      if (userResult.otp != otp) {
        if (attemp < 4) {
          attemp = attemp + 1;
          await userModel.updateOne(
            { email: userResult.email },
            {
              $set: {
                attempts: attemp,
                failedAttemptReqTime: new Date().getTime() + 20 * 60000,
              },
            }
          );
          throw apiError.badRequest(responseMessage.INCORRECT_OTP);
        } else {
          let time = new Date().getTime() + 3 * 60000;
          await userModel.updateOne(
            { email: userResult.email },
            { $set: { attempts: 0, attempExceedTime: time } }
          );
          throw apiError.alreadyExist(responseMessage.LIMIT_EXCEED);
        }
      }
      const updateResult = await updateUser(
        { _id: userResult._id },
        { otpVerification: true }
      );

      const obj = {
        _id: updateResult._id,
        email: updateResult.email,
        otpVerification: true,
      };
      return res.json(new response(obj, responseMessage.OTP_VERIFY));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/resendOTP:
   *   put:
   *     summary: Resend OTP
   *     tags:
   *       - User
   *     description: Resend OTP to user email
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *             required:
   *               - email
   *     responses:
   *       200:
   *         description: OTP resent successfully
   *       404:
   *         description: User not found
   */
  async resendOTP(req, res, next) {
    var validationSchema = Joi.object({
      email: Joi.string().required(),
    });
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      var validatedBody = await validationSchema.validateAsync(req.body);
      const { email } = validatedBody;
      var userResult = await findUser({
        $and: [{ status: { $ne: status.DELETE } }, { email: email }],
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var otp = commonFunction.getOTP();
      var otpTime = new Date().getTime() + 300000;
      await commonFunction.sendEmailReSendOtp(email, otp);
      var updateResult = await updateUser(
        { _id: userResult._id },
        { otp: otp, otpTime: otpTime }
      );
      let obj = {
        _id: updateResult._id,
        email: updateResult.email,
        otp: updateResult.otp,
      };
      return res.json(new response(obj, responseMessage.OTP_SEND));
    } catch (error) {
      return next(error);
    }
  }
  /**
   * @swagger
   * /user/viewMyProfile:
   *   get:
   *     summary: View My Profile
   *     tags:
   *       - User
   *     security:
   *       - tokenauth: []
   *     responses:
   *       200:
   *         description: تم العثور على بيانات المستخدم
   *       401:
   *         description: غير مصرح به - التوكن غير صالح أو مفقود
   *       404:
   *         description: المستخدم غير موجود
   */
  async viewMyProfile(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      userResult = JSON.parse(JSON.stringify(userResult));
      const notification = await notificationList({userId:req.userId , isRead:false});
      delete userResult.password;
      delete userResult.otpVerification;
      let obj = {
        city: userResult.city,
        state: userResult.state,
        country: userResult.country,
        userName: userResult.userName,
        profilePic: userResult.profilePic,
        userType: userResult.userType,
        followersCount: userResult.followersCount,
        likesUserCount: userResult.likesUserCount,
        followingCount: userResult.followingCount,
        _id: userResult._id,
        name: userResult.name,
        email: userResult.email,
        countryCode: userResult.countryCode,
        mobileNumber: userResult.mobileNumber,
        location: userResult.location,
        unreadNotificationCount: notification.length
      };
      return res.json(new response(obj, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/updateProfile:
   *   put:
   *     summary: Update User Profile
   *     tags:
   *       - User
   *     description: Update the current user's profile information
   *     produces:
   *       - application/json
   *     security:
   *       - tokenauth: []
   *     parameters:
   *       - in: header
   *         name: token
   *         schema:
   *           type: string
   *         required: true
   *         description: Authentication token
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               countryCode:
   *                 type: string
   *               mobileNumber:
   *                 type: string
   *               location:
   *                 type: string
   *               profilePic:
   *                 type: file
   *     responses:
   *       200:
   *         description: تم تحديث الملف الشخصي بنجاح
   *       401:
   *         description: غير مصرح به - التوكن غير صالح أو مفقود
   *       404:
   *         description: المستخدم غير موجود
   */
  async updateProfile(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      var validationSchema = Joi.object({
        name: Joi.string().optional(),
        email: Joi.string()
          .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "in"] } })
          .message("صيغة البريد الإلكتروني غير صحيحة"),
        countryCode: Joi.string().optional(),
        mobileNumber: Joi.string().optional(),
        location: Joi.string().optional(),
        profilePic: Joi.string().optional(),
      });

      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }

      const validatedBody = await validationSchema.validateAsync(req.body);
      
      let userExist = await emailMobileExist(
        validatedBody.mobileNumber,
        validatedBody.email,
        userResult._id
      );

      if (userExist) {
        if (userExist.email == validatedBody.email) {
          throw apiError.conflict(responseMessage.EMAIL_EXIST);
        } else {
          throw apiError.conflict(responseMessage.MOBILE_EXIST);
        }
      }

      if (req.files && req.files.length != 0) {
        let imgUrl1 = await commonFunction.getImageUrl(req.files[0].path);
        validatedBody.profilePic = imgUrl1.url;
      }

      const result = await updateUser({ _id: userResult._id }, validatedBody);

      // إنشاء إشعار
      const title = "Account  Updated";
      const body = `Hi ${userResult.name}, your profile has been updated successfully`;
      await notificationCreate({
        userId: userResult._id,
        title: title,
        imageUrl: validatedBody.profilePic,
        body: body,
        currentTime: new Date().toISOString(),
        currentDay: daysOfWeek[new Date().getDay()],
      });

      if (userResult.deviceToken && userResult.deviceType != "") {
        await commonFunction.pushNotification(
          userResult.deviceToken,
          title,
          body
        );
      }

      return res.json(new response(result, responseMessage.USER_UPDATED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/changePassword:
   *   put:
   *     summary: Change Password
   *     tags:
   *       - User
   *     security:
   *       - tokenauth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               oldPassword:
   *                 type: string
   *               newPassword:
   *                 type: string
   *               confirmPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: تم تغيير كلمة المرور بنجاح
   *       401:
   *         description: غير مصرح به - التوكن غير صالح أو مفقود
   *       400:
   *         description: خطأ في البيانات المدخلة
   */
  async changePassword(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const validationSchema = Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
        confirmPassword: Joi.string().required(),
      });

      let validatedBody = await validationSchema.validateAsync(req.body);

      if (validatedBody.oldPassword == validatedBody.newPassword) {
        throw apiError.badRequest("يجب أن تكون كلمة المرور الجديدة مختلفة عن القديمة");
      }

      if (validatedBody.newPassword != validatedBody.confirmPassword) {
        throw apiError.badRequest("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      }

      if (!bcrypt.compareSync(validatedBody.oldPassword, userResult.password)) {
        throw apiError.badRequest("كلمة المرور القديمة غير صحيحة");
      }

      let updated = await updateUserById(userResult._id, {
        password: bcrypt.hashSync(validatedBody.newPassword)
      });

      return res.json(new response({}, "تم تغيير كلمة المرور بنجاح"));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/resetPassword:
   *   post:
   *     summary: Reset Password
   *     tags:
   *       - User
   *     description: Reset user password after verification
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               _id:
   *                 type: string
   *               password:
   *                 type: string
   *               confirmPassword:
   *                 type: string
   *             required:
   *               - _id
   *               - password
   *               - confirmPassword
   *     responses:
   *       200:
   *         description: Password reset successfully
   *       400:
   *         description: Passwords do not match
   *       404:
   *         description: User not found
   */
  async resetPassword(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    });
    try {
      const { _id, password, confirmPassword } =
        await validationSchema.validateAsync(req.body);
      var userResult = await findUser({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        if (password == confirmPassword) {
          let update = await updateUser(
            { _id: userResult._id },
            { password: bcrypt.hashSync(password) }
          );
          return res.json(new response({}, responseMessage.PWD_CHANGED));
        } else {
          throw apiError.notFound(responseMessage.PWD_NOT_MATCH);
        }
      }
    } catch (error) {
      return next(error);
    }
  }
  //******************************************************************* USER FLOW END HERE ************************************************************************ */

  //****************************************************************** FOLLOW/UNFOLLW MANAGEMENT START HERE ******************************************************** */

  /**
   * @swagger
   * /user/followUnfollowUser/{userId}:
   *   put:
   *     summary: Follow/Unfollow User
   *     tags:
   *       - USER_FOLLOW/UNFOLLOW_MANAGEMENT
   *     description: Follow or unfollow another user
   *     security:
   *       - tokenauth: []
   *     parameters:
   *       - in: header
   *         name: token
   *         schema:
   *           type: string
   *         required: true
   *         description: Authentication token
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: تم تنفيذ العملية بنجاح
   *       401:
   *         description: غير مصرح به - التوكن غير صالح أو مفقود
   *       404:
   *         description: المستخدم غير موجود
   */
  async followUnfollowUser(req, res, next) {
    try {
      // التحقق من المستخدم الحالي (req.userId يتم توفيره من خلال middleware)
      let userResult = await findUser({ 
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
        return res.status(404).json({
          status: false,
          responseCode: 404,
          responseMessage: "المستخدم غير موجود"
        });
      }

      // التحقق من المستخدم المراد متابعته
      let userToFollow = await findUser({
        _id: req.params.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userToFollow) {
        return res.status(404).json({
          status: false,
          responseCode: 404,
          responseMessage: "المستخدم المراد متابعته غير موجود"
        });
      }

      // التحقق من عدم متابعة النفس
      if (userResult._id.toString() === userToFollow._id.toString()) {
        return res.status(400).json({
          status: false,
          responseCode: 400,
          responseMessage: "لا يمكنك متابعة نفسك"
        });
      }

      let result;
      // إلغاء المتابعة إذا كان يتابع بالفعل
      if (userToFollow.followers.includes(userResult._id)) {
        await updateUser(
          { _id: userToFollow._id },
          { $pull: { followers: userResult._id }, $inc: { followersCount: -1 } }
        );
        result = await updateUser(
          { _id: userResult._id },
          { $pull: { following: userToFollow._id }, $inc: { followingCount: -1 } }
        );

        return res.json(new response(result, "تم إلغاء المتابعة بنجاح"));
      }

      // إضافة متابعة جديدة
      await updateUser(
        { _id: userToFollow._id },
        { $addToSet: { followers: userResult._id }, $inc: { followersCount: 1 } }
      );
      result = await updateUser(
        { _id: userResult._id },
        { $addToSet: { following: userToFollow._id }, $inc: { followingCount: 1 } }
      );

      // إنشاء إشعار للمستخدم المتابَع
      await notificationCreate({
        userId: userToFollow._id,
        title: "متابع جديد",
        body: `قام ${userResult.name} بمتابعتك`,
        currentTime: new Date().toISOString(),
        currentDay: daysOfWeek[new Date().getDay()],
      });

      // إرسال إشعار push إذا كان لديه توكن جهاز
      if (userToFollow.deviceToken && userToFollow.deviceType) {
        await commonFunction.pushNotification(
          userToFollow.deviceToken,
          "متابع جديد",
          `قام ${userResult.name} بمتابعتك`
        );
      }

      return res.json(new response(result, "تمت المتابعة بنجاح"));

    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/followerUserList:
   *   post:
   *     summary: followerUserList
   *     tags:
   *       - USER_FOLLOW/UNFOLLOW_MANAGEMENT
   *     description: List of followers for a user
   *     security:
   *       - tokenauth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               page:
   *                 type: number
   *               limit:
   *                 type: number
   *               search:
   *                 type: string
   *     responses:
   *       200:
   *         description: تم العثور على المتابعين
   *       401:
   *         description: غير مصرح به - التوكن غير صالح أو مفقود
   */
  async followerUserList(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let followers = [];
      let followerQuery = {
        _id: { $in: userResult.followers },
        status: "ACTIVE",
      };

      if (req.body.search) {
        followerQuery.$or = [
          { name: { $regex: req.body.search, $options: "i" } },
          { email: { $regex: req.body.search, $options: "i" } },
          { userName: { $regex: req.body.search, $options: "i" } },
        ];
      }

      followers = await userFindList(followerQuery);

      if (followers.length == 0) {
        return res.json(new response(
          { docs: followers, count: 0 },
          "لا يوجد متابعين"
        ));
      }

      if (req.body.page && req.body.limit) {
        let paginatedData = await commonFunction.paginationFunction(
          followers,
          Number(req.body.page) || 1,
          Number(req.body.limit) || 10
        );
        return res.json(new response(paginatedData, "تم العثور على المتابعين"));
      }

      return res.json(new response(
        { docs: followers, count: followers.length },
        "تم العثور على المتابعين"
      ));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/followingUserList:
   *   post:
   *     summary: followingUserList
   *     tags:
   *       - USER_FOLLOW/UNFOLLOW_MANAGEMENT
   *     description: List of following for a user
   *     security:
   *       - tokenauth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               page:
   *                 type: number
   *               limit:
   *                 type: number
   *               search:
   *                 type: string
   *     responses:
   *       200:
   *         description: تم العثور على المتابَعين
   *       401:
   *         description: غير مصرح به - التوكن غير صالح أو مفقود
   */
  async followingUserList(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let following = [];
      let followingQuery = {
        _id: { $in: userResult.following },
        status: "ACTIVE",
      };

      if (req.body.search) {
        followingQuery.$or = [
          { name: { $regex: req.body.search, $options: "i" } },
          { email: { $regex: req.body.search, $options: "i" } },
          { userName: { $regex: req.body.search, $options: "i" } },
        ];
      }

      following = await userFindList(followingQuery);

      if (following.length == 0) {
        return res.json(new response(
          { docs: following, count: 0 },
          "لا يوجد متابَعين"
        ));
      }

      if (req.body.page && req.body.limit) {
        let paginatedData = await commonFunction.paginationFunction(
          following,
          Number(req.body.page) || 1,
          Number(req.body.limit) || 10
        );
        return res.json(new response(paginatedData, "تم العثور على المتابَعين"));
      }

      return res.json(new response(
        { docs: following, count: following.length },
        "تم العثور على المتابَعين"
      ));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/otherfollowingUserList:
   *   get:
   *     summary: otherfollowingUserList
   *     tags:
   *       - USER_FOLLOW/UNFOLLOW_MANAGEMENT
   *     description: otherfollowingUserList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async otherfollowingUserList(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let following = [];
      let targetUser = await findUser({ _id: req.query._id });
      
      if (!targetUser) {
        throw apiError.notFound("المستخدم المطلوب غير موجود");
      }

      for (let element of targetUser.following) {
        let followedUser = await findUser({ _id: element });
        following.push(followedUser);
      }

      let obj = {
        following: following,
        count: targetUser.following.length,
      };

      return res.json(new response(obj, "تم العثور على قائمة المتابَعين"));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/otherfollowerUserList:
   *   get:
   *     summary: otherfollowerUserList
   *     tags:
   *       - USER_FOLLOW/UNFOLLOW_MANAGEMENT
   *     description: otherfollowerUserList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: query
   *         required: true
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async otherfollowerUserList(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let targetUser = await findUser({ _id: req.query._id });
      if (!targetUser) {
        throw apiError.notFound("المستخدم المطلوب غير موجود");
      }

      let followers = [];
      let followerQuery = {
        _id: { $in: targetUser.followers },
        status: "ACTIVE",
      };

      if (req.query.search) {
        followerQuery.$or = [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
          { userName: { $regex: req.query.search, $options: "i" } },
        ];
      }

      followers = await userFindList(followerQuery);

      if (followers.length == 0) {
        return res.json(new response(
          { docs: followers, count: 0 },
          "لا يوجد متابعين"
        ));
      }

      if (req.query.page && req.query.limit) {
        let paginatedData = await commonFunction.paginationFunction(
          followers,
          Number(req.query.page) || 1,
          Number(req.query.limit) || 10
        );
        return res.json(new response(paginatedData, "تم العثور على المتابعين"));
      }

      return res.json(new response(
        { docs: followers, count: followers.length },
        "تم العثور على المتابعين"
      ));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/checkMutualFollow/{targetUserId}:
   *   get:
   *     summary: Check Mutual Follow Status
   *     tags:
   *       - USER_FOLLOW/UNFOLLOW_MANAGEMENT
   *     description: Check if there is mutual follow between current user and target user
   *     security:
   *       - tokenauth: []
   *     parameters:
   *       - in: path
   *         name: targetUserId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the user to check mutual follow status with
   *     responses:
   *       200:
   *         description: Returns mutual follow status
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 iFollowThem:
   *                   type: boolean
   *                 theyFollowMe:
   *                   type: boolean
   *       404:
   *         description: User not found
   */
  async checkMutualFollow(req, res, next) {
    try {
      // التحقق من المستخدم الحالي
      let currentUser = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!currentUser) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // التحقق من المستخدم المستهدف
      let targetUser = await findUser({
        _id: req.params.targetUserId,
        status: { $ne: status.DELETE }
      });
      
      if (!targetUser) {
        throw apiError.notFound("المستخدم المستهدف غير موجود");
      }

      // التحقق من عدم فحص النفس
      if (currentUser._id.toString() === targetUser._id.toString()) {
        return res.json(new response({
          iFollowThem: false,
          theyFollowMe: false
        }, "لا يمكن فحص المتابعة مع نفسك"));
      }

      // التحقق من حالة المتابعة المتبادلة
      const iFollowThem = targetUser.followers.includes(currentUser._id);
      const theyFollowMe = currentUser.followers.includes(targetUser._id);

      return res.json(new response({
        iFollowThem,
        theyFollowMe
      }, "تم التحقق من حالة المتابعة المتبادلة"));

    } catch (error) {
      return next(error);
    }
  }

  //****************************************************************** FOLLOW/UNFOLLW MANAGEMENT END HERE ******************************************************** */

  //****************************************************************** WISHLIST MANAGEMENT START HERE ********************************************************** */

  /**
   * @swagger
   * /user/addToWishlist:
   *   post:
   *     summary: Add to Wishlist
   *     tags:
   *       - WISHLIST_MANAGEMENT
   *     description: Add a product to user's wishlist
   *     security:
   *       - tokenauth: []
   *     parameters:
   *       - in: header
   *         name: token
   *         schema:
   *           type: string
   *         required: true
   *         description: Authentication token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               productId:
   *                 type: string
   *     responses:
   *       200:
   *         description: تمت الإضافة بنجاح
   *       401:
   *         description: غير مصرح به - التوكن غير صالح أو مفقود
   *       409:
   *         description: المنتج موجود بالفعل في المفضلة
   */
  async addToWishlist(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      var validationSchema = Joi.object({
        productId: Joi.string().required(),
      });

      const validatedBody = await validationSchema.validateAsync(req.body);
      const { productId } = validatedBody;

      let check = await findWishlist({
        productId: productId,
        userId: userResult._id,
        status: status.ACTIVE,
      });

      if (check) {
        throw apiError.conflict("المنتج موجود بالفعل في قائمة المفضلة");
      }

      let product = await findProduct({ _id: productId });
      if (!product) {
        throw apiError.notFound("المنتج غير موجود");
      }

      let obj = {
        productId: productId,
        userId: userResult._id,
        ownerId: product.userId,
      };

      const title = "إضافة إلى المفضلة";
      const body = `تمت إضافة المنتج "${product.productName}" إلى قائمة المفضلة`;
      
      await notificationCreate({
        userId: userResult._id,
        title: title,
        imageUrl: product.productImage[0],
        body: body,
        currentTime: new Date().toISOString(),
        currentDay: daysOfWeek[new Date().getDay()],
      });

      if(userResult.deviceToken && userResult.deviceType != ""){
        await commonFunction.pushNotification(userResult.deviceToken, title, body);
      }

      let data = await createWishlist(obj);
      return res.json(new response(data, "تمت إضافة المنتج إلى المفضلة"));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/allWishlist:
   *   post:
   *     summary: View Wishlist
   *     tags:
   *       - WISHLIST_MANAGEMENT
   *     security:
   *       - tokenauth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               page:
   *                 type: number
   *               limit:
   *                 type: number
   *     responses:
   *       200:
   *         description: تم العثور على القائمة
   *       401:
   *         description: غير مصرح به - التوكن غير صالح أو مفقود
   */
  async allWishlist(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let data = await paginateWishlist(req.body, userResult._id);
      if (data.docs.length === 0) {
        return res.json(new response(data, "لا توجد منتجات في المفضلة"));
      }
      return res.json(new response(data, "تم العثور على المنتجات"));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/wishlistDataSearchProductId:
   *   post:
   *     summary: wishlistDataSearchProductId
   *     tags:
   *       - WISHLIST_MANAGEMENT
   *     description: wishlistDataSearchProductId
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: productId
   *         description: productId
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async wishlistDataSearchProductId(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let data = await findWishlist({
        productId: req.body.productId,
        userId: userResult._id,
        status: status.ACTIVE,
      });

      if (!data) {
        return res.json(new response(null, "المنتج غير موجود في المفضلة"));
      }

      return res.json(new response(data, "تم العثور على المنتج"));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/removeWishlist:
   *   delete:
   *     summary: Remove from Wishlist
   *     tags:
   *       - WISHLIST_MANAGEMENT
   *     description: Remove a product from user's wishlist
   *     security:
   *       - tokenauth: []
   *     parameters:
   *       - in: query
   *         name: wishlistId
   *         required: true
   *         schema:
   *           type: string
   *         description: Wishlist item ID to remove
   *     responses:
   *       200:
   *         description: تم الحذف بنجاح
   *       401:
   *         description: غير مصرح به - التوكن غير صالح أو مفقود
   *       404:
   *         description: العنصر غير موجود
   */
  async removeWishlist(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      var validationSchema = Joi.object({
        wishlistId: Joi.string().required(),
      });

      const validatedBody = await validationSchema.validateAsync(req.query);

      const result = await findWishlist({
        _id: validatedBody.wishlistId,
        status: { $ne: status.DELETE },
      });

      if (!result) {
        throw apiError.notFound("المنتج غير موجود في المفضلة");
      }

      const updateRes = await deleteWishlistData({ _id: result._id });
      return res.json(new response(updateRes, "تم إزالة المنتج من المفضلة"));
    } catch (error) {
      return next(error);
    }
  }

  async deleteWishlistData(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const result = await deleteWishlist();
      if (!result) {
        throw apiError.notFound("لا توجد منتجات في المفضلة");
      }

      return res.json(new response({}, "تم حذف قائمة المفضلة بنجاح"));
    } catch (error) {
      return next(error);
    }
  }

  //****************************************************************** WISHLIST MANAGEMENT END HERE ********************************************************** */

  //****************************************************************** HOME MANAGEMENT START HERE ********************************************************** */

  /**
   * @swagger
   * /user/getRecentProducts:
   *   get:
   *     summary: Get Recent Products
   *     tags:
   *       - Products
   *     description: Get list of recently added products
   *     parameters:
   *       - in: query
   *         name: userId
   *         schema:
   *           type: string
   *         description: Optional user ID to filter products
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: List of recent products
   *       404:
   *         description: No products found
   */
  async getRecentProducts(req, res, next) {
    const validationSchema = Joi.object({
      userId: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      var result = await recentProductsList(validatedBody);
      if (!result) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      result = JSON.parse(JSON.stringify(result));
      return res.json(new response(result, responseMessage.GET_PRODUCTS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getPopularProducts:
   *   get:
   *     summary: Get Popular Products
   *     tags:
   *       - Products
   *     description: Get list of popular products based on wishlist count
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of items per page
   *       - in: query
   *         name: userId
   *         schema:
   *           type: string
   *         description: Optional user ID to filter products
   *     responses:
   *       200:
   *         description: List of popular products
   *       404:
   *         description: No products found
   */
  async getPopularProducts(req, res, next) {
    try {
      const allProductData = await wishlist();
      if (!allProductData) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      const result = Object.entries(
        allProductData.reduce((acc, obj) => {
          if (obj.productId in acc) {
            acc[obj.productId].count++;
          } else {
            acc[obj.productId] = { count: 1 };
          }
          return acc;
        }, {})
      ).map(([productId, { count }]) => ({ productId, count }));

      const productId = result.map((element) => element.productId);

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const totalItems = productId.length;

      let allPopularProducts = [];
      if (req.query.userId) {
        allPopularProducts = await findAllProductNew(
          {
            _id:  productId ,
            //userId:  req.query.userId ,
            status: "ACTIVE",
            approveStatus: "APPROVED"
          },
          startIndex,
          limit
        );
      } else {
        allPopularProducts = await findAllProductNew(
          {
            _id:  productId ,
            status: "ACTIVE",
            approveStatus: "APPROVED"
          },
          startIndex,
          limit
        );
      }

      const responseData = allPopularProducts.map((item) => {
        const matchedItem = result.find(
          (resultItem) => resultItem.productId === item._id.toString()
        );
        return { ...matchedItem, ...item._doc };
      });

      const totalPages = Math.ceil(totalItems / limit);

      return res.json(
        new response(
          {
            data: responseData,
            page,
            limit,
            totalItems,
            totalPages,
          },
          responseMessage.GET_PRODUCTS
        )
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getAllProducts:
   *   get:
   *     summary: Get All Products
   *     tags:
   *       - Products
   *     description: Get paginated list of all products
   *     parameters:
   *       - in: query
   *         name: userId
   *         schema:
   *           type: string
   *         description: Optional user ID to filter products
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: List of products
   *       404:
   *         description: No products found
   */
  async getAllProducts(req, res, next) {
    const validationSchema = Joi.object({
      userId: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
    });

    try {

      const validatedBody = await validationSchema.validateAsync(req.query);

      const result = await productListWithPaginationNew(validatedBody);

      if (!result || (Array.isArray(result) && result.length === 0)) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }

      return res.json(new response(result, responseMessage.GET_PRODUCTS));
    } catch (error) {
     
      return next(error);
    }
}

  /**
   * @swagger
   * /user/getBestPriceProduct:
   *   get:
   *     summary: Get Best Price Product
   *     tags:
   *       - Products
   *     description: Get the product with the lowest price
   *     responses:
   *       200:
   *         description: Returns the product with the lowest price
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     _id:
   *                       type: string
   *                     productName:
   *                       type: string
   *                     price:
   *                       type: number
   *                     description:
   *                       type: string
   *                     productImage:
   *                       type: array
   *                       items:
   *                         type: string
   *       404:
   *         description: No products found
   */
async getBestPriceProduct(req, res, next) {
  try {
    const allProducts = await productServices.findAllProduct({ approveStatus: "APPROVED" });

    if (!allProducts || allProducts.length === 0) {
      return res.status(200).json({ 
        status: true, 
        message: "لا توجد منتجات", 
        data: null 
      });
    }

    const bestPriceProduct = allProducts.reduce((min, curr) =>
      curr.price < min.price ? curr : min
    );

    return res.status(200).json({
      status: true,
      message: "أرخص منتج متاح",
      data: bestPriceProduct,
    });

  } catch (error) {
    console.error("خطأ:", error);
    return next(error);
  }
}

async getbestForYouProduct(req, res, next) {
  const validationSchema = Joi.object({
    userId: Joi.string().allow("").optional(),
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
  });

  try {
    const validatedBody = await validationSchema.validateAsync(req.query);
    const { userId, page = 1, limit = 10 } = validatedBody;

    let searchKeywords = [];

    if (userId) {
      const recentSearches = await SearchModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5);

      searchKeywords = recentSearches
        .map(entry => entry.searchText)
        .filter(Boolean);
    }

    let matchStage = {};
    let addFieldsStage = {};

    if (searchKeywords.length > 0) {
      const keyword = searchKeywords[0]; // نستخدم أول كلمة بحث فقط مؤقتًا

      matchStage = {
        $match: {
          $or: searchKeywords.flatMap(keyword => ([
            { productName: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ])),
          status: "ACTIVE", // تأكد من عرض المنتجات النشطة فقط
        },
      };

      addFieldsStage = {
        $addFields: {
          relevance: {
            $cond: [
              { $regexMatch: { input: "$productName", regex: keyword, options: "i" } },
              2,
              {
                $cond: [
                  { $regexMatch: { input: "$description", regex: keyword, options: "i" } },
                  1,
                  0,
                ],
              }
            ]
          }
        }
      };
    }

    const aggregationPipeline = [
      ...(searchKeywords.length > 0 ? [matchStage, addFieldsStage] : [
        { $match: { status: "ACTIVE" } }
      ]),
      { $sort: searchKeywords.length > 0 ? { relevance: -1, createdAt: -1 } : { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];

    const products = await Product.aggregate(aggregationPipeline);

    // إرجاع استجابة ناجحة حتى في حالة عدم وجود منتجات
    const responseData = !products || products.length === 0 ? [] : products;
    return res.json(new response(responseData, products.length === 0 ? "لا توجد منتجات" : responseMessage.GET_PRODUCTS));
  } catch (error) {
    console.log("🔴 getbestForYouProduct error:", error);
    return next(error);
  }
}



  //****************************************************************** HOME MANAGEMENT END HERE ********************************************************** */

  //****************************************************************** Maintainance MANAGEMENT END HERE ********************************************************** */
  /**
   * @swagger
   * /user/getMaintainanceStatus:
   *   get:
   *     summary: Get Maintenance Status
   *     tags:
   *       - System
   *     description: Check if system is under maintenance
   *     responses:
   *       200:
   *         description: Maintenance status
   *       404:
   *         description: Status not found
   */
  async getMaintainanceStatus(req, res, next) {
    try {
      console.log("🔍 getMaintainanceStatus called..."); // ✅ كونسول أول

      var result = await maintainance.find();
      console.log("🔎 Query result:", result); // ✅ كونسول ثاني

      if (!result || result.length === 0) {
        console.log("⚠️ No data found in maintainance collection.");
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }

      result = JSON.parse(JSON.stringify(result));
      console.log("✅ Sending response with data:", result); // ✅ كونسول ثالث

      res.set('Cache-Control', 'no-store'); // يمنع الكاش مؤقتاً
      return res.json(new response(result, responseMessage.GET_PRODUCTS));
    } catch (error) {
      console.log("❌ Error in getMaintainanceStatus:", error); // ✅ كونسول رابع
      return next(error);
    }
}

  //****************************************************************** Maintainance MANAGEMENT END HERE ********************************************************** */

  // ****************************************************************** Country and State  START HERE ********************************************************** */

  /**
   * @swagger
   * /user/getCountry:
   *   get:
   *     summary: Get Countries List
   *     tags:
   *       - Location
   *     description: Get list of all countries
   *     responses:
   *       200:
   *         description: List of countries
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       countryName:
   *                         type: string
   *                       countryId:
   *                         type: string
   */
  async getCountry(req, res, next) {
    try {
      const countries = Country.getAllCountries().map((country) => {
        return { countryName: country.name, countryId: country.isoCode };
      });
      // const countries1 = Country.getAllCountries()

      return res.json({
        data: countries,
        message: "Successfully retrieved countries",
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/states/{country}:
   *   get:
   *     summary: Get States List
   *     tags:
   *       - Location
   *     description: Get list of states for a specific country
   *     parameters:
   *       - in: path
   *         name: country
   *         required: true
   *         schema:
   *           type: string
   *         description: Country code (e.g., US, IN)
   *     responses:
   *       200:
   *         description: List of states
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       country:
   *                         type: string
   *                       state:
   *                         type: string
   *       404:
   *         description: Country not found
   */
  async getStates(req, res, next) {
    try {
      const { country } = req.params;
      const countryObj = Country.getCountryByCode(country);
      if (!countryObj) {
        return res.status(404).json({
          error: "Country not found",
        });
      }
      const states = State.getStatesOfCountry(countryObj.isoCode).map(
        (state) => ({
          country: countryObj.name,
          state: state.name,
        })
      );

      return res.json({
        data: states,
        message: `States of ${countryObj.name}`,
      });
    } catch (error) {
      return next(error);
    }
  }

  // ****************************************************************** Country and State  START HERE ********************************************************** */
}
export default new userController();

