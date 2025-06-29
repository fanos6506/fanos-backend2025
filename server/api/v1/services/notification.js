import notificationModel from "../../../models/notification.js";
import status from "../../../enums/status.js";

const notificationServices = {
  notificationCreate: async (insertObj) => {
    return await notificationModel(insertObj).save();
  },
  notificationData: async (query) => {
    return await notificationModel.findOne(query);
  },
  notificationList: async (query) => {
    return await notificationModel.find(query).sort({ createdAt: -1 });
  },
  notificationUpdate: async (query, updateObj) => {
    return await notificationModel.findByIdAndUpdate(query, updateObj, {
      new: true,
    });
  },
  clearAllNotifications: async (query, updateObj) => {
    return await notificationModel.deleteMany(query, updateObj, {
      multi: true,
    });
  },
  multiUpdateNotification: async (query, updateObj) => {
    return await notificationModel.updateMany(query, updateObj, {
      multi: true,
    });
  },
  allNotificationList: async (query) => {
    return await notificationModel.find(query).sort({ createdAt: -1 });
  },
  notificationListWithSort: async (query) => {
    return await notificationModel
      .find(query)
      .populate([
        { path: "userId" },
        { path: "chatId" },
        { path: "p2pAdvertisementId" },
      ])
      .sort({ createdAt: -1 });
  },
  paginationNotificationSearch: async (validatedBody) => {
    let query = { sendBy: "ADMIN", status: { $ne: status.DELETE } };
    const { userId, search, fromDate, toDate, page, limit } = validatedBody;
    console.log("limit", limit);
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
      ];
    }
    if (userId) {
      query.userId = userId;
    }
    if (fromDate && toDate) {
      const startOfDay = new Date(fromDate);
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.$and = [
        { createdAt: { $gte: startOfDay } },
        { createdAt: { $lte: endOfDay } },
      ];
    } else if (fromDate && !toDate) {
      query.createdAt = { $gte: new Date(fromDate) };
    } else if (!fromDate && toDate) {
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt = { $lte: endOfDay };
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: { createdAt: -1 },
    };
    const result = await notificationModel.paginate(query, options);
    const totalPages = Math.ceil(result.total / options.limit);
    result.totalPages = totalPages;
    return result;
  },
};

export default notificationServices;
