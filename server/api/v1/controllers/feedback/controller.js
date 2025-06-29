import Joi from "joi";
import { joiPasswordExtendCore } from "joi-password";
const joiPassword = Joi.extend(joiPasswordExtendCore);
import * as _ from 'lodash';
import config from "config";
import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import responseMessage from "../../../../../assets/responseMessage.js";
import commonFunction from "../../../../helper/util.js";
import status from "../../../../enums/status.js";
import userType from "../../../../enums/userType.js";
import user from "../../../../models/user.js";

import  userServices  from "../../services/user.js";
const {
  userCheck,
  findUserWithFollowUser,
  checkUserExists,
  emailMobileExist,
  checkSocialLogin,
  findCount,
  createUser,
  findUser,
  findUserData,
  deleteUser,
  userFindList,
  updateUser,
  updateUserById,
  insertManyUser,
  paginateSearch,
  listSearchUsers,
  findUserDatax,
  paginateSearchListByUser,
  listVendorUser,
  paginateSearchsupervisor,
} = userServices;

import  feedbackServices  from "../../services/feedback.js";
const {
  createFeedbackContent,
  FeedbackContentList,
  paginateSearchFeedbacks,
  findOneFeedback,
} = feedbackServices;

export class feedbackController {
  /**
   * @swagger
   * /feedback/addFeedback:
   *   post:
   *     summary:  Add Feedback
   *     tags:
   *       - FEEDBACK
   *     description: addFeedback
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: addFeedback
   *         description: addFeedback
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/addFeedback'
   *     responses:
   *       200:
   *         description: User addFeedback successfully
   */
  async addFeedback(req, res, next) {
    const validationSchema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string()
        .required()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "in"] } })
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
      message: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { name, email, message } = validatedBody;
      let result = await createFeedbackContent(validatedBody);
      result = JSON.parse(JSON.stringify(result));
      await commonFunction.sendMailFeedback(validatedBody.email);
      return res.json(
        new response(result, responseMessage.THANK_YOU_FOR_YOUR_FEEDBACK)
      );
    } catch (error) {
      console.log(error, 84);
      return next(error);
    }
  }

  /**
   * @swagger
   * /feedback/getFeedback:
   *   get:
   *     tags:
   *       - FEEDBACK
   *     description: getFeedback.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         type: integer
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getFeedback(req, res, next) {
    const validationSchema = Joi.object({
      status1: Joi.string().allow("").optional(),
      userType1: Joi.string().allow("").optional(),
      search: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
      country: Joi.string().allow("").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      var result = await paginateSearchFeedbacks(validatedBody);
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      console.log(error, 84);
      return next(error);
    }
  }

  /**
   * @swagger
   * /feedback/getSingleFeedback:
   *   get:
   *     tags:
   *       - FEEDBACK
   *     description: getSingleFeedback.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: feedbackId
   *         description: feedbackId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getSingleFeedback(req, res, next) {
    const validationSchema = Joi.object({
      feedbackId: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      const { feedbackId } = validatedBody;
      var result = await findOneFeedback({ _id: feedbackId });
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }
}

export default new feedbackController();
