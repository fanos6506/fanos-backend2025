import paymentModel from "../../../models/payment.js";
import status from "../../../enums/status.js";

const paymentServices = {
  createPayment: async (insertObj) => {
    return await paymentModel.create(insertObj);
  },

  findPayment: async (query) => {
    return await paymentModel.findOne(query);
  },

  paymentAggregate: async (query) => {
    return await paymentModel.aggregate(query);
  },

  updatePayment: async (query, updateObj) => {
    return await paymentModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  PaymentList: async (query) => {
    return await paymentModel.find(query);
  },

  removePayment: async (query) => {
    return await paymentModel.deleteMany(query);
  },

  countPayment: async (query) => {
    return await paymentModel.countDocuments(query);
  },

  findPaymentDeatils: async (query) => {
    return await paymentModel
      .findOne(query)
      .populate("userId")
      .populate("productId")
      .populate("shippingAddressId")
      .sort({ createdAt: -1 });
  },

  paginatePaymentSearch: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE } };
    const { search, fromDate, toDate, page, limit } = validatedBody;
    if (search) {
      query._id = search;
    }
    if (fromDate && toDate) {
      query["$and"] = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ];
    }
    const options = {
      page: page || 1,
      limit: limit || 10,
      sort: { createdAt: -1 },
      populate: [
        { path: "userId" },
        { path: "productId" },
        { path: "shippingAddressId" },
      ],
    };

    return await paymentModel.paginate(query, options);
  },

  paginatePaymentSearchWithOrderType: async (validatedBody) => {
    let query = {};
    const { orderType, search, fromDate, toDate, page, limit } = validatedBody;
    if (orderType) {
      query.orderType = orderType;
    }

    if (search) {
      query["$or"] = [
        { userId: { $regex: search, $options: "i" } },
        { productId: { $regex: search, $options: "i" } },
      ];
    }
    if (fromDate && toDate) {
      const startOfDay = new Date(fromDate);
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999); // Set the end time of the day
      query.$and = [
        { createdAt: { $gte: startOfDay } },
        { createdAt: { $lte: endOfDay } },
      ];
    } else if (fromDate && !toDate) {
      query.createdAt = { $gte: new Date(fromDate) };
    } else if (!fromDate && toDate) {
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999); // Set the end time of the day
      query.createdAt = { $lte: endOfDay };
    }

    const options = {
      page: page || 1,
      limit: limit || 10,
      sort: { createdAt: -1 },
      populate: [
        { path: "userId" },
        { path: "productId" },
        { path: "shippingAddressId" },
      ],
    };

    return await paymentModel.paginate(query, options);
  },
};

export default paymentServices;
