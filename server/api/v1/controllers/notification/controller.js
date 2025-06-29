import * as _ from 'lodash';
import Joi from "joi";
import apiError from "../../../../helper/apiError.js";
import auth from "../../../../helper/auth.js";
import response from "../../../../../assets/response.js";
import responseMessage from "../../../../../assets/responseMessage.js";
import  notificationServices  from "../../services/notification.js";
import status from "../../../../enums/status.js";
import  userServices  from "../../services/user.js";
import userType from "../../../../enums/userType.js";
const {
  notificationList,
  notificationData,
  notificationUpdate,
  multiUpdateNotification,
  paginationNotificationSearch,
} = notificationServices;
const {
  checkUserExists,
  emailMobileExist,
  createUser,
  findUser,
  findAllUser,
  updateUser,
  updateUserById,
  paginateSearch,
  insertManyUser,
} = userServices;

export class notificationController {
  /**
   * @swagger
   * /notification/onNotification:
   *   post:
   *     tags:
   *       - NOTIFICATION MANAGEMENT
   *     description: turn on notifications
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: deviceToken
   *         description: token
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Data found successfully.
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async onNotification(req, res, next) {
    let validationSchema = {
      deviceToken: Joi.string().required(),
    };
    try {
      let validatedBody = await Joi.validate(req.query, validationSchema);
      const { deviceToken } = validatedBody;
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: [userType.USER] },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      const data = await updateUser(
        { _id: req.userId },
        { $set: { deviceToken: validatedBody.deviceToken } }
      );
      return res.json(new response(data, responseMessage.UPDATE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /notification/listNotification:
   *   post:
   *     tags:
   *       - NOTIFICATION MANAGEMENT
   *     description: list notifications
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Data found successfully.
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async listNotification(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: [userType.USER] },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let notificationRes = await notificationList({
        userId: req.userId,
        status: { $ne: status.DELETE },
      });
      if (notificationRes) {
        return res.json(
          new response(notificationRes, responseMessage.NOTIFICATION_GET)
        );
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /notification/viewNotification/{_id}:
   *   get:
   *     tags:
   *       - NOTIFICATION MANAGEMENT
   *     description: viewStaticContent
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id of notification
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Data found successfully.
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async viewNotification(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: [userType.USER] },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        const data = await notificationData({
          _id: req.params._id,
          userId: userResult._id,
          status: status.ACTIVE,
        });
        if (data.length == 0) {
          throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
        } else {
          await notificationUpdate(
            { _id: data._id },
            { $set: { isRead: true } }
          );
          return res.json(new response(data, responseMessage.DATA_FOUND));
        }
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /notification/readNotification:
   *   put:
   *     tags:
   *       - NOTIFICATION MANAGEMENT
   *     description: readNotification
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async readNotification(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: [userType.USER] },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        let result = await multiUpdateNotification(
          { userId: userResult._id },
          { $set: { isRead: true } }
        );
        return res.json(new response(result, responseMessage.DETAILS_FETCHED));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /notification/readSingleNotification:
   *   put:
   *     tags:
   *       - NOTIFICATION MANAGEMENT
   *     description: readSingleNotification
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: notificationId
   *         description: notificationId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async readSingleNotification(req, res, next) {
    const validationSchema = Joi.object({
      notificationId: Joi.string().required(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);

      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: [userType.USER] },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let result = await notificationUpdate(
        { _id: validatedBody.notificationId },
        { $set: { isRead: true } }
      );
      return res.json(new response(result, responseMessage.DETAILS_FETCHED));
    } catch (error) {
      return next(error);
    }
  }

  async getNotificationList(token) {
    let responses;
    try {
      var unReadCount = 0;
      return new Promise(async (resolve, reject) => {
        let userId = await auth.verifyTokenBySocket(token);
        const responseData = await notificationList({
          userId: userId,
          status: { $ne: status.DELETE },
        });
        if (responseData.length == 0) {
          responses = apiError.notFound(responseMessage.DATA_NOT_FOUND);
          resolve(responses);
        } else {
          for (let i = 0; i < responseData.length; i++) {
            if (responseData[i].isRead === false) {
              unReadCount += 1;
            }
          }
          let obj = {
            data: responseData,
            unReadCount: unReadCount,
          };
          responses = {
            responseCode: 200,
            responseMessage: "Data fetched successfully!",
            responseResult: obj,
          };
          resolve(responses);
        }
      });
    } catch (error) {
      responses = error;
      reject(responses);
    }
  }

  /**
   * @swagger
   * /notification/deleteNotification/{_id}:
   *   delete:
   *     tags:
   *       - NOTIFICATION MANAGEMENT
   *     description: deleteNotification
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id of notification
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Notification deleted successfully.
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async deleteNotification(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: [userType.USER] },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        const data = await notificationData({
          _id: req.params._id,
          userId: userResult._id,
          status: status.ACTIVE,
        });
        if (data.length == 0) {
          throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
        } else {
          await notificationUpdate(
            { _id: data._id },
            { $set: { status: status.DELETE } }
          );
          return res.json(
            new response(data, responseMessage.NOTIFICATION_DELETED)
          );
        }
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /notification/clearAllNotification:
   *   delete:
   *     tags:
   *       - NOTIFICATION MANAGEMENT
   *     description: clear All Notifications
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Notification cleared successfully.
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async clearAllNotification(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: [userType.USER] },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        const data = await multiUpdateNotification(
          { userId: userResult._id },
          { status: status.DELETE }
        );
        if (data.length == 0) {
          throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
        } else {
          return res.json(
            new response(data, responseMessage.CLEAR_NOTIFICATION)
          );
        }
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /notification/getNotificationListbyAdmin:
   *   post:
   *     tags:
   *       - ADMIN NOTIFICATION MANAGEMENT
   *     description: Get Notification List by Admin
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: admin token
   *         in: header
   *         required: true
   *       - name: userId
   *         description: userId
   *         in: query
   *         required: false
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: query
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
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Data found successfully.
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async getNotificationListbyAdmin(req, res, next) {
    const validationSchema = Joi.object({
      userId: Joi.string().optional(),
      search: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.string().optional(),
      limit: Joi.string().optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);

      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: [userType.ADMIN] },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      console.log(validatedBody);
      let paginatedData = await paginationNotificationSearch(validatedBody);

      if (paginatedData.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(paginatedData, responseMessage.DETAILS_FETCHED)
      );
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /notification/getGestUserNotificationList:
   *   get:
   *     tags:
   *       -  NOTIFICATION MANAGEMENT
   *     description: getGestUserNotificationList.
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getGestUserNotificationList(req, res, next) {
    try {
      let result = await notificationList({ status: { $ne: status.DELETE } });
      return res.json(new response(result, responseMessage.NOTIFICATION_LIST));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /notification/getSingleNotification:
   *   get:
   *     tags:
   *       -  ADMIN NOTIFICATION MANAGEMENT
   *     description: getSingleNotification.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: admin token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: Notification Id
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getSingleNotification(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      let result = await notificationData({
        _id: validatedBody._id,
        status: { $ne: status.DELETE },
      });
      return res.json(new response(result, responseMessage.NOTIFICATION_LIST));
    } catch (error) {
      return next(error);
    }
  }
}

export default new notificationController();