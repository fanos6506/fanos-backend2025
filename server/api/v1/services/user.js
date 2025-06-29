import userModel from "../../../models/user.js";
import status from "../../../enums/status.js";
import userType from "../../../enums/userType.js";


const userServices = {
  userCheck: async (userId) => {
    let query = {
      $and: [
        { status: { $ne: status.DELETE } },
        { $or: [{ email: userId }, { mobileNumber: userId }] },
      ],
    };
    return await userModel.findOne(query);
  },

  checkUserExists: async (mobileNumber, email) => {
    let query = {
      $and: [
        { status: { $ne: status.DELETE } },
        { userType: "USER" },
        { $or: [{ email: email }, { mobileNumber: mobileNumber }] },
      ],
    };
    return await userModel.findOne(query);
  },

  emailMobileExist: async (mobileNumber, email, id, userTypes) => {
    let query = {
      $and: [
        { status: { $ne: status.DELETE } },
        { userType: userTypes },
        { _id: { $ne: id } },
        { $or: [{ email: email }, { mobileNumber: mobileNumber }] },
      ],
    };
    return await userModel.findOne(query);
  },

  checkSocialLogin: async (socialId, socialType) => {
    return await userModel.findOne({
      socialId: socialId,
      socialType: socialType,
    });
  },

  findCount: async (query) => {
    return await userModel.countDocuments(query);
  },

  findAllUser: async () => {
    let query = {
      $and: [{ status: { $ne: status.DELETE } }, { userType: "USER" }],
    };
    return await userModel.find(query);
  },

  createUser: async (insertObj) => {
    return await userModel.create(insertObj);
  },

  userPagination: async (query, page, limit) => {
    let options = {
      page: page || 1,
      limit: limit || 10,
      sort: { createdAt: -1 },
      select: "-password",
    };
    return await userModel.paginate(query, options);
  },

  findUser: async (query) => {
    return await userModel.findOne(query);
  },
  getUser: async (query) => {
    return await userModel.findOne(query).select("-password");
  },

  updateToken: async (id, token) => {
    return await userModel.findByIdAndUpdate(
      id,
      { $set: { token: token } },
      { new: true }
    );
  },

  paginateSearchModerator: async (validatedBody) => {
    let query = {
      status: { $ne: status.DELETE },
      userType: { $in: userType.MODERATOR },
    };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      userType1,
      status1,
      country,
    } = validatedBody;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (country) {
      query.country = { $regex: country, $options: "i" };
    }
    if (status1) {
      query.status = status1;
    }
    if (userType1) {
      query.userType = userType1;
    }
    if (fromDate && !toDate) {
      // query.createdAt = { $gte: fromDate };
      query.createdAt = {
        $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
      };
    }
    if (!fromDate && toDate) {
      // query.createdAt = { $lte: toDate };
      query.createdAt = {
        $lte: new Date(
          new Date(toDate).toISOString().slice(0, 10) + "MMM DD, YYYY hh:mm A"
        ),
      };
    }
    if (fromDate && toDate) {
      query.$and = [
        // { createdAt: { $gte: fromDate } },
        // { createdAt: { $lte: toDate } },
        {
          createdAt: {
            $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
          },
        },
        {
          createdAt: {
            $lte: new Date(
              new Date(toDate).toISOString().slice(0, 10) + "MMM DD, YYYY hh:mm A"
            ),
          },
        },
      ];
    }
    let options = {
      page: page || 1,
      limit: limit || 15,
      sort: { createdAt: -1 },
      // select: '-ethAccount.privateKey'
    };
    return await userModel.paginate(query, options);
  },

  paginateSearchsupervisor: async (validatedBody) => {
    let query = {
      status: { $ne: status.DELETE },
      userType: { $in: userType.supervisor },
    };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      userType1,
      status1,
      country,
    } = validatedBody;
    console.log("limit", limit, 170);
    console.log("page", page);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (country) {
      query.country = { $regex: country, $options: "i" };
    }
    if (status1) {
      query.status = status1;
    }
    if (userType1) {
      query.userType = userType1;
    }
    if (fromDate && !toDate) {
      // query.createdAt = { $gte: fromDate };
      query.createdAt = {
        $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
      };
    }
    if (!fromDate && toDate) {
      // query.createdAt = { $lte: toDate };
      query.createdAt = {
        $lte: new Date(
          new Date(toDate).toISOString().slice(0, 10) + "MMM DD, YYYY hh:mm A"
        ),
      };
    }
    if (fromDate && toDate) {
      query.$and = [
        // { createdAt: { $gte: fromDate } },
        // { createdAt: { $lte: toDate } },
        {
          createdAt: {
            $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
          },
        },
        {
          createdAt: {
            $lte: new Date(
              new Date(toDate).toISOString().slice(0, 10) + "MMM DD, YYYY hh:mm A"
            ),
          },
        },
      ];
    }
    let options = {
      page: page || 1,
      limit: limit || 15,
      sort: { createdAt: -1 },
      // select: '-ethAccount.privateKey'
    };
    return await userModel.paginate(query, options);
  },

  findUserWithFollowUser: async (query) => {
    return await userModel.findOne(query).populate("followers").select("-otp");
  },

  findUserDatax: async (query) => {
    return await userModel.findOne(query);
  },

  deleteUser: async (query) => {
    return await userModel.deleteOne(query);
  },

  deleteAllUsers: async (query) => {
    return await userModel.deleteMany(query);
  },

  userFindList: async (query) => {
    return await userModel.find(query).sort({ createdAt: -1 }).select("-otp");
  },

  updateUser: async (query, updateObj) => {
    return await userModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  updateUsers: async (query, updateObj) => {
    return await userModel.updateMany(query, updateObj, { new: true });
  },

  updateUserById: async (query, updateObj) => {
    return await userModel
      .findByIdAndUpdate(query, updateObj, { new: true })
      .select("-otp");
  },

  insertManyUser: async (obj) => {
    return await userModel.insertMany(obj);
  },

  paginateSearch: async (validatedBody) => {
    let query = {
      status: { $ne: status.DELETE },
      userType: { $ne: userType.ADMIN },
    };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      userType1,
      status1,
      country,
    } = validatedBody;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (country) {
      query.country = { $regex: country, $options: "i" };
    }
    if (status1) {
      query.status = status1;
    }
    if (userType1) {
      query.userType = userType1;
    }
    if (fromDate && !toDate) {
      // query.createdAt = { $gte: fromDate };
      query.createdAt = {
        $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
      };
    }
    if (!fromDate && toDate) {
      // query.createdAt = { $lte: toDate };
      query.createdAt = {
        $lte: new Date(
          new Date(toDate).toISOString().slice(0, 10) + "MMM DD, YYYY hh:mm A"
        ),
      };
    }
    if (fromDate && toDate) {
      query.$and = [
        // { createdAt: { $gte: fromDate } },
        // { createdAt: { $lte: toDate } },
        {
          createdAt: {
            $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
          },
        },
        {
          createdAt: {
            $lte: new Date(
              new Date(toDate).toISOString().slice(0, 10) + "MMM DD, YYYY hh:mm A"
            ),
          },
        },
      ];
    }
    let options = {
      page: page || 1,
      limit: limit || 15,
      sort: { createdAt: -1 },
      // select: '-ethAccount.privateKey'
    };
    return await userModel.paginate(query, options);
  },

  paginateSearchWithoutLogininUser: async (validatedBody, userId) => {
    let query = {
      _id: { $ne: userId },
      status: { $ne: status.DELETE },
      userType: userType.USER,
    };
    // query.$select = { _id: 1}

    const { search, fromDate, toDate, page, limit } = validatedBody;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
      ];
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
      limit: parseInt(limit) || 200,
      sort: { createdAt: -1 },
      //   select: (["firstName", "lastName", "profilePic", "mobileNumber"])
    };
    let data = await userModel.paginate(query, options);
    return data;
  },
};

export default userServices ;
