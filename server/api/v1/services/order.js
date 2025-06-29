import order from "../../../models/orderModel.js";
import status from "../../../enums/status.js";
import orderStatus from "../../../enums/orderStatus.js";
import mongoose from "mongoose";

const orderServices = {
  createOrder: async (insertObj) => {
    return await order.create(insertObj);
  },
  findOrder: async (query) => {
    return await order.findOne(query);
  },
  findOneOrder: async (query) => {
    return await order.findOne(query);
  },
  findAllOrder: async (query) => {
    return await order.find(query).sort({ createdAt: -1 });
  },
  findAllOrder1: async (query) => {
    return await order.find(query).sort({ createdAt: -1 });
  },
  findCountOrder: async (query) => {
    return await order.count(query);
  },

  findOrderWithProductDetalis: async (userId, orderType) => {
    const pipeline = [
      { $match: { userId:new mongoose.Types.ObjectId(userId) } },
      { $match: { orderType: orderType } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $sort: { createdAt: -1 } },
    ];
    return await order.aggregate(pipeline);
  },

  //Create findorderwithproductdetails function by using populate userId orderType and product details?
  findOrderWithProductDetails1: async (userId, orderType) => {
    return await order
      .find({ userId: userId, orderType: orderType })
      .populate("userId")
      .populate("productId")
      .sort({ createdAt: -1 });
  },

  updateOrder: async (query, updateObj) => {
    return await order.findOneAndUpdate(query, updateObj, { new: true });
  },

  updateOrderById: async (query, updateObj) => {
    return await order.findByIdAndUpdate(query, updateObj, { new: true });
  },

  paginateOrderSearch: async (validatedBody) => {
    let query = {
      status: { $ne: status.DELETE },
      orderStatus: {
        $in: [
          orderStatus.PENDING,
          orderStatus.UNDER_REVIEW,
          orderStatus.ASSIGNED,
          orderStatus.DISPATCHED,
          orderStatus.STARTED_OFF,
        ],
      },
    };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      minAmount,
      maxAmount,
      orderStatus1,
    } = validatedBody;
    if (search) {
      query = { orderStatus: { $regex: search, $options: "i" } };
    }
    if (orderStatus1) {
      query.orderStatus = orderStatus1;
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ];
    }
    if (minAmount && !maxAmount) {
      query.total = { $gte: minAmount };
    }
    if (!minAmount && maxAmount) {
      query.total = { $lte: maxAmount };
    }

    if (minAmount && maxAmount) {
      query.$or = [
        { total: { $gte: minAmount } },
        { total: { $lte: maxAmount } },
      ];
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 },
    };
    return await order.paginate(query, options);
  },

  paginateOrderServiceSearch: async (validatedBody) => {
    let query = {
      status: { $ne: status.DELETE },
      serviceId: { $exists: true },
      productId: { $exists: true, $eq: [] },
      orderStatus: {
        $in: [
          orderStatus.PENDING,
          orderStatus.UNDER_REVIEW,
          orderStatus.COMPLETED,
          orderStatus.STARTED_OFF,
          orderStatus.CANCEL,
          orderStatus.ASSIGNED,
        ],
      },
    };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      minAmount,
      maxAmount,
      orderStatus1,
    } = validatedBody;
    if (search) {
      query = { orderStatus: { $regex: search, $options: "i" } };
    }
    if (orderStatus1) {
      query.orderStatus = orderStatus1;
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ];
    }
    if (minAmount && !maxAmount) {
      query.total = { $gte: minAmount };
    }
    if (!minAmount && maxAmount) {
      query.total = { $lte: maxAmount };
    }

    if (minAmount && maxAmount) {
      query.$or = [
        { total: { $gte: minAmount } },
        { total: { $lte: maxAmount } },
      ];
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 },
      populate: {
        path: "serviceId clientId agent_Expert_Id deliveryVehicle productId.productDetails discountId cancelReasonId serviceAreaId",
      },
    };
    return await order.paginate(query, options);
  },

  paginateOrderProductSearch: async (validatedBody) => {
    let query = {
      status: { $ne: status.DELETE },
      productId: { $exists: true },
      serviceId: { $exists: true, $eq: [] },
    };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      minAmount,
      maxAmount,
      orderStatus,
    } = validatedBody;
    if (search) {
      query = { orderStatus: { $regex: search, $options: "i" } };
    }
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ];
    }
    if (minAmount && !maxAmount) {
      query.total = { $gte: minAmount };
    }
    if (!minAmount && maxAmount) {
      query.total = { $lte: maxAmount };
    }

    if (minAmount && maxAmount) {
      query.$or = [
        { total: { $gte: minAmount } },
        { total: { $lte: maxAmount } },
      ];
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 },
    };
    return await order.paginate(query, options);
  },

  paginateOrderSearchByUser: async (validatedBody) => {
    let query = {
      status: { $ne: status.DELETE },
      clientId: validatedBody.clientId,
    };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      minAmount,
      maxAmount,
      orderStatus1,
    } = validatedBody;
    if (search) {
      query = { orderStatus: { $regex: search, $options: "i" } };
    }
    if (orderStatus1) {
      if (orderStatus1 == "CLOSE") {
        query.orderStatus = "COMPLETED" || "DELIVERED";
      } else {
        query.orderStatus = orderStatus1;
      }
    }

    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ];
    }
    if (minAmount && !maxAmount) {
      query.total = { $gte: minAmount };
    }
    if (!minAmount && maxAmount) {
      query.total = { $lte: maxAmount };
    }

    if (minAmount && maxAmount) {
      query.$or = [
        { total: { $gte: minAmount } },
        { total: { $lte: maxAmount } },
      ];
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 },
    };
    return await order.paginate(query, options);
  },

  paginateOrderSearchAdmin: async (validatedBody) => {
    if (validatedBody.orderStatus1 == "CLOSED") {
      let query = {
        status: { $ne: status.DELETE },
        orderStatus: { $in: [orderStatus.COMPLETED, orderStatus.DELIVERED] },
      };
      const {
        search,
        fromDate,
        toDate,
        page,
        limit,
        minAmount,
        maxAmount,
        orderStatus1,
      } = validatedBody;
      if (search) {
        query = { orderStatus: { $regex: search, $options: "i" } };
      }
      if (fromDate && !toDate) {
        query.createdAt = { $gte: fromDate };
      }
      if (!fromDate && toDate) {
        query.createdAt = { $lte: toDate };
      }
      if (fromDate && toDate) {
        query.$and = [
          { createdAt: { $gte: fromDate } },
          { createdAt: { $lte: toDate } },
        ];
      }
      if (minAmount && !maxAmount) {
        query.total = { $gte: minAmount };
      }
      if (!minAmount && maxAmount) {
        query.total = { $lte: maxAmount };
      }

      if (minAmount && maxAmount) {
        query.$or = [
          { total: { $gte: minAmount } },
          { total: { $lte: maxAmount } },
        ];
      }
      let options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 15,
        sort: { createdAt: -1 },
      };
      return await order.paginate(query, options);
    } else {
      let query = {
        status: { $ne: status.DELETE },
        orderStatus: {
          $in: [
            orderStatus.PENDING,
            orderStatus.UNDER_REVIEW,
            orderStatus.ASSIGNED,
            orderStatus.DISPATCHED,
            orderStatus.STARTED_OFF,
          ],
        },
      };
      const {
        search,
        fromDate,
        toDate,
        page,
        limit,
        minAmount,
        maxAmount,
        orderStatus1,
      } = validatedBody;
      if (search) {
        query = { orderStatus: { $regex: search, $options: "i" } };
      }
      if (orderStatus1) {
        query.orderStatus = orderStatus1;
      }
      if (fromDate && !toDate) {
        query.createdAt = { $gte: fromDate };
      }
      if (!fromDate && toDate) {
        query.createdAt = { $lte: toDate };
      }
      if (fromDate && toDate) {
        query.$and = [
          { createdAt: { $gte: fromDate } },
          { createdAt: { $lte: toDate } },
        ];
      }
      if (minAmount && !maxAmount) {
        query.total = { $gte: minAmount };
      }
      if (!minAmount && maxAmount) {
        query.total = { $lte: maxAmount };
      }

      if (minAmount && maxAmount) {
        query.$or = [
          { total: { $gte: minAmount } },
          { total: { $lte: maxAmount } },
        ];
      }
      let options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 15,
        sort: { createdAt: -1 },
      };
      return await order.paginate(query, options);
    }
  },

  paginateOrderSearchByUser1: async (validatedBody) => {
    if (validatedBody.orderStatus1 == "CLOSED") {
      let query = {
        status: { $ne: status.DELETE },
        clientId: validatedBody.clientId,
        orderStatus: { $in: [orderStatus.COMPLETED, orderStatus.DELIVERED] },
      };
      const {
        search,
        fromDate,
        toDate,
        page,
        limit,
        minAmount,
        maxAmount,
        orderStatus1,
      } = validatedBody;
      if (search) {
        query = { orderStatus: { $regex: search, $options: "i" } };
      }
      if (fromDate && !toDate) {
        query.createdAt = { $gte: fromDate };
      }
      if (!fromDate && toDate) {
        query.createdAt = { $lte: toDate };
      }
      if (fromDate && toDate) {
        query.$and = [
          { createdAt: { $gte: fromDate } },
          { createdAt: { $lte: toDate } },
        ];
      }
      if (minAmount && !maxAmount) {
        query.total = { $gte: minAmount };
      }
      if (!minAmount && maxAmount) {
        query.total = { $lte: maxAmount };
      }

      if (minAmount && maxAmount) {
        query.$or = [
          { total: { $gte: minAmount } },
          { total: { $lte: maxAmount } },
        ];
      }
      let options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 15,
        sort: { createdAt: -1 },
      };
      return await order.paginate(query, options);
    }
    let query = {
      status: { $ne: status.DELETE },
      clientId: validatedBody.clientId,
      orderStatus: {
        $in: [
          orderStatus.CANCEL,
          orderStatus.PENDING,
          orderStatus.UNDER_REVIEW,
          orderStatus.ASSIGNED,
          orderStatus.DISPATCHED,
          orderStatus.STARTED_OFF,
        ],
      },
    };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      minAmount,
      maxAmount,
      orderStatus1,
    } = validatedBody;
    if (search) {
      query = { orderStatus: { $regex: search, $options: "i" } };
    }
    if (orderStatus1) {
      query.orderStatus = orderStatus1;
    }

    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ];
    }
    if (minAmount && !maxAmount) {
      query.total = { $gte: minAmount };
    }
    if (!minAmount && maxAmount) {
      query.total = { $lte: maxAmount };
    }

    if (minAmount && maxAmount) {
      query.$or = [
        { total: { $gte: minAmount } },
        { total: { $lte: maxAmount } },
      ];
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { updatedAt: -1 },
    };
    return await order.paginate(query, options);
  },
};

export default orderServices;
