import transactionModel from "../../../models/transactionModel.js";
import status from "../../../enums/status.js";

const transactionServices = {
  createTransaction: async (insertObj) => {
    return await transactionModel.create(insertObj);
  },

  findTransaction: async (query) => {
    return await transactionModel.findOne(query).populate("userId orderId");
  },
  findTransactions: async (query) => {
    return await transactionModel.find(query).populate("userId orderId");
  },
  updateTransaction: async (query, updateObj) => {
    return await transactionModel.findOneAndUpdate(query, updateObj, {
      new: true,
    });
  },

  transactionList: async (status) => {
    let query = { status: status };
    return await transactionModel.find(query);
  },

  paginateTransaction: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE } };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      statusOfPayment,
      statusOfSettlement,
    } = validatedBody;
    if (search) {
      query.$or = [
        { transactionid: { $regex: validatedBody.search, $options: "i" } },
        { amount: { $regex: validatedBody.search, $options: "i" } },
      ];
    }
    if (statusOfPayment) {
      query.paymentStatus = statusOfPayment;
    }
    if (statusOfSettlement) {
      query.settlementStatus = statusOfSettlement;
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
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 },
      populate: [
        {
          path: "userId",
        },
        {
          path: "orderId",
          populate: { path: "cancelReasonId serviceAreaId" },
        },
      ],
    };
    return await transactionModel.paginate(query, options);
  },

  aggregateTransaction: async (validBody) => {
    const { page, limit, search } = validBody;
    let searchData,
      data = [];
    searchData = search || "";
    data.push(
      {
        $lookup: {
          from: "orders",
          let: {
            orderId: "$orderId",
          },
          as: "orderDetails",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$orderId", "$_id"] },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$orderDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "serviceareas",
          localField: "orderDetails.serviceAreaId",
          foreignField: "_id",
          as: "serviceAreaDetails",
        },
      },

      {
        $unwind: {
          path: "$serviceAreaDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "cancellation",
          localField: "orderDetails.cancelReasonId",
          foreignField: "_id",
          as: "cancelReasonDetails",
        },
      },

      {
        $unwind: {
          path: "$cancelReasonDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "orderDetails.agent_Expert_Id",
          foreignField: "_id",
          as: "agentExpertDetails",
        },
      },

      {
        $unwind: {
          path: "$agentExpertDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $match: { status: { $ne: status.DELETE } },
      },
      {
        $match: {
          "orderDetails.orderId": { $regex: searchData, $options: "i" },
        },
      },
      { $sort: { createdAt: -1 } }
    );

    let aggregate = transactionModel.aggregate(data);
    let options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort: { createdAt: -1 },
    };
    return await transactionModel.aggregatePaginate(aggregate, options);
  },

};

module.exports = { transactionServices };

function dateRetunrMonth(month) {
  if (month == 1) {
    return 31;
  }
  if (month == 2) {
    return 29;
  }
  if (month == 3) {
    return 31;
  }
  if (month == 5) {
    return 31;
  }
  if (month == 7) {
    return 31;
  }
  if (month == 8) {
    return 31;
  }
  if (month == 10) {
    return 31;
  }
  if (month == 12) {
    return 31;
  }
  if (month == 4) {
    return 30;
  }
  if (month == 6) {
    return 30;
  }
  if (month == 9) {
    return 30;
  }
  if (month == 11) {
    return 30;
  }
}
