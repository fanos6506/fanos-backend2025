import Joi from "joi";
import * as _ from 'lodash';
import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import responseMessage from "../../../../../assets/responseMessage.js";
import userModel from "../../../../models/user.js";
import chatSchema from "../../../../models/chatting.js";
import mongoose from "mongoose";
import auth from "../../../../helper/auth.js";
import commonFunction from "../../../../helper/util.js";
import status from "../../../../enums/status.js";
import userType from "../../../../enums/userType.js";
import uploadHandler from "../../../../helper/uploadHandler.js";

import chattingServices  from "../../services/socket.js";
const { findChatMessages, updateMessage, messageList, messageList1 } =
  chattingServices;

import  userServices  from "../../services/user.js";
const {
  userCheck,
  findUserData,
  checkUserExists,
  emailMobileExist,
  createUser,
  paginateSearch,
  paginateSearchWithoutLogininUser,
  findUser,
  updateUser,
  updateUserByIdcheckSocialLogin,
  userSubscribedTrue,
} = userServices;

let responses;
export class socketController {
  

  async oneToOneChat(req) {
    try {
        if (!req.senderId || !req.receiverId || !req.message) {
            return {
                response_code: 400,
                response_message: "Missing required fields",
                error: "senderId, receiverId and message are required"
            };
        }

        let query = { 
            status: { $ne: "DELETE" },
            $and: [
                { $or: [{ senderId: req.senderId }, { senderId: req.receiverId }] },
                { $or: [{ receiverId: req.receiverId }, { receiverId: req.senderId }] }
            ]
        };

        let chatQuery = {
            $or: [
                { receiverId: req.receiverId },
                { senderId: req.receiverId }
            ]
        };

        const newMessage = {
            message: req.message,
            mediaType: req.mediaType || "text",
            receiverId: req.receiverId,
            createdAt: new Date().toISOString(),
            disappear: req.disappear || false,
            messageStatus: "Unread"
        };

        let result = await chatSchema.findOne(query);

        if (!result) {
            // Create new chat
            const newChat = new chatSchema({
                senderId: req.senderId,
                receiverId: req.receiverId,
                messages: [newMessage],
                status: "ACTIVE"
            });

            const savedChat = await newChat.save();

            const chatHistory = await chatSchema
                .find(chatQuery)
                .sort({ "messages.createdAt": -1 })
                .populate("senderId receiverId", "name profilePic");

            savedChat.messages = savedChat.messages.reverse();

            return {
                response_code: 200,
                response_message: "Message sent successfully",
                result: savedChat,
                chatHistory
            };
        }

        if (result.status !== "ACTIVE") {
            return {
                response_code: 403,
                response_message: "Chat is not active",
                result: null
            };
        }

        // Add message to existing chat
        const updatedChat = await chatSchema.findByIdAndUpdate(
            result._id,
            { 
                $push: { messages: newMessage },
                $set: { lastMessageAt: new Date() }
            },
            { new: true }
        ).populate("senderId receiverId", "name profilePic");

        if (!updatedChat) {
            return {
                response_code: 404,
                response_message: "Failed to update chat",
                error: "Chat not found"
            };
        }

        const chatHistory = await chatSchema
            .find(chatQuery)
            .sort({ "messages.createdAt": -1 })
            .populate("senderId receiverId", "name profilePic");

        updatedChat.messages = updatedChat.messages.reverse();

        return {
            response_code: 200,
            response_message: "Message sent successfully",
            result: updatedChat,
            chatHistory
        };

    } catch (error) {
        console.error("Error in oneToOneChat:", error);
        return {
            response_code: 500,
            response_message: "Internal server error",
            error: error.message
        };
    }
  }


  
  async oneToOneChatApi(request, res) {
    try {
      let req = request.body;
      var response,
        chatQuery = {},
        chatHistory = [];
  
      let query = {
        status: { $ne: "DELETE" },
        $and: [
          { $or: [{ senderId: req.senderId }, { senderId: req.receiverId }] },
          { $or: [{ receiverId: req.receiverId }, { receiverId: req.senderId }] },
        ],
      };
  
      if (req.media) {
        req.media = await commonFunction.getSecureUrl(req.media);
      }
  
      chatQuery.$or = [
        { receiverId: req.receiverId },
        { senderId: req.receiverId },
      ];
  
      const result = await chatSchema.findOne(query);
  
      if (!result) {
        req.messages = [
          {
            message: req.message,
            media: req.media,
            receiverId: req.receiverId,
            senderId: req.senderId,
            createdAt: new Date().toISOString(),
            disappear: req.disappear,
            messageStatus: "Unread"
          },
        ];
  
        const newChat = new chatSchema(req);
        const savedChat = await newChat.save();
  
        chatHistory = await chatSchema
          .find(chatQuery)
          .sort({ "messages.createdAt": -1 })
          .populate([
            { path: "senderId", select: "name email profilePic" },
            { path: "receiverId", select: "name email profilePic" }
          ]);
  
        savedChat.messages = savedChat.messages.reverse();
        response = {
          response_code: 200,
          response_message: "Message sent successfully.",
          result: savedChat,
          chatHistory,
        };
        return res.send(response);
      }
      
      if (result.status === "ACTIVE") {
        const messages = [
          {
            message: req.message,
            receiverId: req.receiverId,
            senderId: req.senderId,
            media: req.media,
            createdAt: new Date().toISOString(),
            disappear: req.disappear,
            messageStatus: "Unread"
          },
        ];
  
        await chatSchema.findByIdAndUpdate(
          result._id,
          { $push: { messages: messages } },
          { new: true }
        );
  
        const updatedChat = await chatSchema
          .findById(result._id)
          .populate([
            { path: "senderId", select: "name email profilePic" },
            { path: "receiverId", select: "name email profilePic" }
          ]);
  
        chatHistory = await chatSchema
          .find(chatQuery)
          .sort({ "messages.createdAt": -1 })
          .populate([
            { path: "senderId", select: "name email profilePic" },
            { path: "receiverId", select: "name email profilePic" }
          ]);
  
        updatedChat.messages = updatedChat.messages.reverse();
        response = {
          response_code: 200,
          response_message: "Message sent successfully.",
          result: updatedChat,
          chatHistory,
        };
        return res.send(response);
      } else {
        response = {
          response_code: 404,
          response_message: "You can't chat",
          result: result,
        };
        return res.send(response);
      }
    } catch (error) {
      console.error("❌ oneToOneChatApi error:", error);
      return res.status(500).send({
        response_code: 500,
        response_message: "Internal Server Error",
        error: error.message,
      });
    }
  }
  


  async ChattingHistory(req) {
    let query = {};
    let response = {};
  
    if (req.senderId) {
      query.$or = [
        { receiverId: new mongoose.Types.ObjectId(req.senderId) },
        { senderId: new mongoose.Types.ObjectId(req.senderId) },
      ];
    }
    if (req.chatId) {
      query._id = new mongoose.Types.ObjectId(req.chatId);
    }
  
    const result = await chatSchema.aggregate([
      { $match: query },
      {
        $addFields: {
          unReadCount: {
            $size: {
              $filter: {
                input: "$messages",
                cond: {
                  $and: [
                    { $eq: ["$$this.messageStatus", "Unread"] },
                    {
                      $eq: [
                        "$$this.receiverId",
                        new mongoose.Types.ObjectId(req.senderId),
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
      { $sort: { "messages.createdAt": -1 } },
      {
        $lookup: {
          from: "user",
          localField: "senderId",
          foreignField: "_id",
          as: "senderId",
        },
      },
      { $unwind: "$senderId" },
      {
        $lookup: {
          from: "user",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiverId",
        },
      },
      { $unwind: "$receiverId" },
      {
        $project: {
          "senderId.name": 1,
          "senderId.profilePic": 1,
          "senderId._id": 1,
          "receiverId.name": 1,
          "receiverId.profilePic": 1,
          "receiverId._id": 1,
          messages: 1,
          unReadCount: 1,
        },
      },
    ]);
  
    return {
      response_code: 200,
      response_message: "Data found successfully.",
      result: result || [],
    };
  }
  

  

  async chatHistory(req, res, next) {
    try {
      var query = {};
      if (req.userId) {
        query.$or = [
          { receiverId:new mongoose.Types.ObjectId(req.userId) },
          { senderId:new mongoose.Types.ObjectId(req.userId) },
        ];
      }
      // if (req.body.chatId) {
      //     query._id = mongoose.Types.ObjectId(req.body.chatId);
      // }
      let result = await chatSchema.aggregate([
        { $match: query },
        {
          $addFields: {
            unReadCount: {
              $size: {
                $filter: {
                  input: "$messages",
                  cond: {
                    $and: [
                      { $eq: ["$$this.messageStatus", "Unread"] },
                      {
                        $eq: [
                          "$$this.receiverId",
                         new mongoose.Types.ObjectId(req.userId),
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $sort: { "messages.createdAt": -1 },
        },
        {
          $lookup: {
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            as: "senderId",
          },
        },
        {
          $unwind: "$senderId",
        },
        {
          $lookup: {
            from: "users",
            localField: "receiverId",
            foreignField: "_id",
            as: "receiverId",
          },
        },
        {
          $unwind: "$receiverId",
        },
        {
          $project: {
            "senderId.name": 1,
            "senderId.profilePic": 1,
            "senderId._id": 1,
            "senderId.isOnline": 1,
            "receiverId.name": 1,
            "receiverId.profilePic": 1,
            "receiverId._id": 1,
            "receiverId.isOnline": 1,
            messages: 1,
            unReadCount: 1,
          },
        },
      ]);
      if (result.length == 0) {
        return res.json(new response(result, responseMessage.DATA_FOUND));
      } else {
        var array = [];
        result[0].messages.forEach((element) => {
          console.log("element: ", element.receiverId);
          if (element.receiverId.toString() == req.userId.toString()) {
            array.push({ ...element, receiver: true });
          } else {
            array.push({ ...element, receiver: false });
          }
        });
        result[0].messages = array;
        return res.json(new response(result, responseMessage.DATA_FOUND));
      }
    } catch (error) {
      return next(error);
    }
  }

  
  viewChat(req) {
    let response = {};
    return new Promise((resolve, reject) => {
      chatSchema
        .findOne({ _id: req.chatId, status: "ACTIVE" })
        .sort({ "messages.createdAt": -1 })
        .exec((error, findRes) => {
          if (error) {
            response = {
              response_code: 500,
              response_message: "Internal server error.",
              err,
            };
            resolve(response);
          } else if (!findRes) {
            response = {
              response_code: 404,
              response_message: "Data not found",
              result: [],
            };
            resolve(response);
          } else {
            response = {
              response_code: 200,
              response_message: "Data found successfully.",
              result: findRes,
            };
            resolve(response);
          }
        });
    });
  }

  

  clearChat(req) {
    try {
      var query = { clearStatus: false },
        response;
      if (req.senderId && req.receiverId) {
        query.$and = [
          { $or: [{ senderId: req.senderId }, { senderId: req.receiverId }] },
          {
            $or: [{ receiverId: req.receiverId }, { receiverId: req.senderId }],
          },
        ];
      }
      return new Promise((resolve, reject) => {
        chatSchema.findOneAndUpdate(
          query,
          { $set: { messages: [] } },
          { new: true },
          (error, chatRes) => {
            if (error) {
              response = {
                response_code: 500,
                response_message: "Internal server error.",
                err,
              };
              resolve(response);
            } else if (!chatRes) {
              response = {
                response_code: 404,
                response_message: "Data not found",
                result: [],
              };
              resolve(response);
            } else {
              response = {
                response_code: 200,
                response_message: "Cleared successfully.",
                result: chatRes,
              };
              resolve(response);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }

  async clearChat(request, res) {
    let req = request.body;
    try {
      var query = { clearStatus: false },
        response;
      if (req.senderId && req.receiverId) {
        query.$and = [
          { $or: [{ senderId: req.senderId }, { senderId: req.receiverId }] },
          {
            $or: [{ receiverId: req.receiverId }, { receiverId: req.senderId }],
          },
        ];
      }

      chatSchema.findOneAndUpdate(
        query,
        { $set: { messages: [] } },
        { new: true },
        (error, chatRes) => {
          if (error) {
            response = {
              response_code: 500,
              response_message: "Internal server error.",
              err,
            };
            return res.send(response);
          } else if (!chatRes) {
            response = {
              response_code: 404,
              response_message: "Data not found",
              result: [],
            };
            return res.send(response);
          } else {
            response = {
              response_code: 200,
              response_message: "Cleared successfully.",
              result: chatRes,
            };
            return res.send(response);
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
  async readChat(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let chatData = await chatSchema.findByIdAndDelete({
        _id: req.params.chatId,
        status: { $ne: status.DELETE },
      });
      if (!chatData) {
        return res.send({
          response_code: 404,
          response_message: "Data not found",
          result: [],
        });
      }
      await chatSchema.update(
        { _id: chatData._id, "messages.receiverId": userResult._id },
        {
          $set: {
            "messages.$[elem].messageStatus": "Read",
            "messages.$[elem].updatedAt": new Date().toISOString(),
          },
        },
        { arrayFilters: [{ "elem.receiverId": userResult._id }], multi: true }
      );
      return res.json({
        response_code: 200,
        response_message: "Read all messages & Delete successfully.",
      });
    } catch (error) {
      return next(error);
    }
  }

  async messageReceiveUserCount(token) {
    try {
      return new Promise(async (resolve, reject) => {
        let userId = await auth.verifyTokenBySocket(token);
        var query = {};
        query.messages = {
          $elemMatch: {
            receiverId:new mongoose.Types.ObjectId(userId),
            messageStatus: "Unread",
          },
        };
        let result = await chatSchema.aggregate([
          { $match: query },
          {
            $addFields: {
              unReadCount: {
                $size: {
                  $filter: {
                    input: "$messages",
                    cond: { $eq: ["$$this.messageStatus", "Unread"] },
                  },
                },
              },
            },
          },
        ]);
        let count = 0;
        for (let i of result) {
          if (i.unReadCount > 0) {
            count += 1;
          }
        }
        responses = {
          responseCode: 200,
          responseMessage: "Data fetched successfully!",
          responseResult: count,
        };
        resolve(responses);
      });
    } catch (error) {
      responses = error;
      reject(responses);
    }
  }

  async chatHistoryWebSocket(req) {
    try {
      let query = {};
      let response = {};
      return new Promise(async (resolve, reject) => {
        if (req.senderId) {
          query.$or = [
            { receiverId:new mongoose.Types.ObjectId(req.senderId) },
            { senderId:new mongoose.Types.ObjectId(req.senderId) },
          ];
        }
        if (!req.chatId) {
          response = {
            response_code: 400,
            response_message: "Chat id is required",
            result: [],
          };
          resolve(response);
        }

        if (req.chatId) {
          query._id =new mongoose.Types.ObjectId(req.chatId);
        }
        // let result = await chatSchema.find()
        let result = await chatSchema.aggregate([
          { $match: query },
          {
            $addFields: {
              unReadCount: {
                $size: {
                  $filter: {
                    input: "$messages",
                    cond: {
                      $and: [
                        { $eq: ["$$this.messageStatus", "Unread"] },
                        {
                          $eq: [
                            "$$this.receiverId",
                           new mongoose.Types.ObjectId(req.senderId),
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          {
            $sort: { "messages.createdAt": -1 },
          },
          {
            $lookup: {
              from: "users",
              localField: "senderId",
              foreignField: "_id",
              as: "senderId",
            },
          },
          {
            $unwind: "$senderId",
          },
          {
            $lookup: {
              from: "users",
              localField: "receiverId",
              foreignField: "_id",
              as: "receiverId",
            },
          },
          {
            $unwind: "$receiverId",
          },
          {
            $project: {
              "senderId.userName": 1,
              "senderId.name": 1,
              "senderId.profilePic": 1,
              "senderId._id": 1,
              "senderId.isOnline": 1,
              "receiverId.userName": 1,
              "receiverId.name": 1,
              "receiverId.profilePic": 1,
              "receiverId._id": 1,
              "receiverId.isOnline": 1,
              messages: 1,
              unReadCount: 1,
            },
          },
        ]);
        if (result.length == 0) {
          response = {
            response_code: 200,
            response_message: "Data found successfully",
            result: [],
          };
          resolve(response);
        } else {
          response = {
            response_code: 200,
            response_message: "Data found successfully.",
            result: result,
          };
          resolve(response);
        }
      });
    } catch (error) {
      responses = error;
      reject(responses);
    }
  }
 
  async deleteMessage(req, res, next) {
    let validationSchema = {
      chatId: Joi.string().required(),
      messageId: Joi.string().required(),
    };
    try {
      var { chatId, messageId } = await Joi.validate(
        req.query,
        validationSchema
      );
      var userResult = await findUser({
        _id: req.userId,
        status: status.ACTIVE,
      });
      if (!userResult) {
        throw apiError.invalid(responseMessage.USER_NOT_FOUND);
      }

      var chatResult = await findChatMessages({
        _id: chatId,
        messages: {
          $elemMatch: { _id: messageId, receiverId: { $nin: [req.userId] } },
        },
      });
      console.log("chatResult: ", chatResult);
      if (!chatResult) {
        throw apiError.notFound(responseMessage.CHAT_YO_CANNOT_FOUND);
      }

      const result = await updateMessage(
        { _id: chatId },
        {
          $pull: {
            messages: { _id: messageId, receiverId: { $nin: [req.userId] } },
          },
        }
      );
      return res.json(new response(result, responseMessage.DELETE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /chat/deleteForEveryone:
   *   patch:
   *     tags:
   *       - CHAT
   *     description: deleteForEveryone
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: deleteForEveryone
   *         description: deleteForEveryone
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/deleteMessage'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async deleteForEveryone(req, res, next) {
    let validationSchema = {
      chatId: Joi.string().required(),
      messages: Joi.array().items(Joi.string()).required(),
    };
    try {
      var { chatId, messages } = await Joi.validate(req.body, validationSchema);
      var userResult = await findUser({
        _id: req.userId,
        status: status.ACTIVE,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var chatResult = await findChatMessages(chatId, messages);
      if (!chatResult) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      var user = userResult._id.toString();
      for (let i of messages) {
        var checkResult = await findChatMessage(chatId, i);
        if (checkResult.messages[0].senderId == user) {
          await updateMessage(
            { _id: chatId, "messages._id": i },
            { $set: { "messages.$.isDeleted": true } }
          );
        }
      }

      return res.json(new response({}, responseMessage.DELETE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /socket/listUser:
   *   get:
   *     tags:
   *       - SOCKET
   *     description: listUser
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
  async listUser(req, res, next) {
    const validationSchema = Joi.object({
        search: Joi.string().allow("").optional(),
        fromDate: Joi.string().allow("").optional(),
        toDate: Joi.string().allow("").optional(),
        page: Joi.number().optional(),
        limit: Joi.number().optional(),
    });

    try {
        const validatedBody = await validationSchema.validateAsync(req.query);

        // التأكد أن المستخدم موجود
        const userRes = await findUser({ _id: req.userId, userType: "USER" });
        if (!userRes) {
            throw apiError.notFound(responseMessage.USER_NOT_FOUND);
        }

        // البحث والفلترة مع الباجينج
        const dataResults = await paginateSearchWithoutLogininUser(validatedBody, req.userId);

        if (!dataResults.docs || dataResults.docs.length === 0) {
            throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
        }

        const textMsg = await messageList1(req.userId);
        console.log(textMsg, 1140000);

        return res.json(new response(textMsg, responseMessage.DATA_FOUND));

    } catch (error) {
        console.error("====error==>>", error);
        return next(error);
    }
}

}

export default new socketController();
