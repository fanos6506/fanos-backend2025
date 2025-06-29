import reportModel from "../../../models/report.js";
import status from "../../../enums/status.js";

const reportService = {
  createReport: async (insertObj) => {
    return await reportModel.create(insertObj);
  },

  findReport: async (query) => {
    return await reportModel.findOne(query);
  },

  updateReport: async (query, updateObj) => {
    return await reportModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  reportList: async (query) => {
    return await reportModel.find(query).populate([
      { path: "userId", select: "name" },
      { path: "sellerId", select: "name" },
    ]);
  },
  reportLists: async (query) => {
    return await reportModel.find(query);
  },
  countReport: async (query) => {
    return await reportModel.countDocuments(query);
  },
  reportPaginate: async (validatedBody) => {
    const page = validatedBody.page ? +validatedBody.page : 1;
    const limit = validatedBody.limit ? +validatedBody.limit : 10;
    let matchStage = {};
    if (validatedBody.type) {
      matchStage.reasonType = validatedBody.type;
    }
    if (validatedBody.fromDate || validatedBody.toDate) {
      matchStage.createdAt = {};

      if (validatedBody.fromDate) {
        console.log("validatedBody", validatedBody);
        const startOfDay = new Date(validatedBody.fromDate);
        startOfDay.setHours(0, 0, 0, 0);
        matchStage.createdAt.$gte = startOfDay;
      }

      if (validatedBody.toDate) {
        const endOfDay = new Date(validatedBody.toDate);
        endOfDay.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = endOfDay;
      }
    }
    console.log("matchStage", matchStage);
    const aggregatequery = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $unwind: {
          path: "$userId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sellerId",
          foreignField: "_id",
          as: "sellerId",
        },
      },
      {
        $unwind: {
          path: "$sellerId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          status: 1,
          "userId.name": 1,
          "sellerId.name": 1,
          reasonType: 1,
          description: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $match: {
          $or: [
            {
              "userId.name": {
                $regex: validatedBody.search ? validatedBody.search : "",
                $options: "i",
              },
            },
            {
              "sellerId.name": {
                $regex: validatedBody.search ? validatedBody.search : "",
                $options: "i",
              },
            },
          ],
        },
      },
      {
        $facet: {
          metadata: [
            { $count: "total" },
            {
              $addFields: {
                current_page: page,
                total_page: { $ceil: { $divide: ["$total", limit] } },
                limit: limit,
              },
            },
          ],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ];
    let data = await reportModel.aggregate(aggregatequery);
    return data;
  },
};

export default reportService;
