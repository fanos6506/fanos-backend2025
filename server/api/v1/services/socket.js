import chattingModel from "../../../models/chatting.js";
import mongoose from "mongoose";
const chattingServices = {
  createmessage: async (insertObj) => {
    return await chattingModel.create(insertObj);
  },

  findChatMessages: async (query) => {
    return await chattingModel.findOne(query).sort({ "messages.createdAt": 1 });
  },

  findChat: async (query) => {
    return await chattingModel.findOne(query);
  },

  updateMessage: async (query, updateObj) => {
    return await chattingModel.findOneAndUpdate(query, updateObj, {
      new: true,
    });
  },

  messageList: async (query) => {
    return await chattingModel
      .find(query)
      .select([
        "senderId",
        "receiverId",
        "messages.message",
        "messages.messageStatus",
        "messages.profilePic",
        "messages.disappear",
        "messages._id",
        "messages.createdAt",
      ])
      .sort({ createdAt: -1 });
  },

  messageList1: async (userId) => {
    const pipeline = [
      [
        { $match: { receiverId: { $ne:new mongoose.Types.ObjectId(userId) } } },
        {
          $lookup: {
            from: "users",
            localField: "receiverId",
            foreignField: "_id",
            as: "userData",
          },
        },
        {
          $project: {
            _id: 1,
            senderId: 1,
            receiverId: 1,
            messages: 1,
            "userData.firstName": 1,
            "userData.lastName": 1,
            "userData.profilePic": 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ],
    ];
    return await chattingModel.aggregate(pipeline);
  },
};

export default chattingServices;
