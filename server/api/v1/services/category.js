import categoryModel from "../../../models/category.js";
import status from "../../../enums/status.js";

const categoryServices = {
  createCategory: async (insertObj) => {
    return await categoryModel.create(insertObj);
  },

  findCategory: async (query) => {
    return await categoryModel.findOne(query);
  },

  updateCategory: async (query, updateObj) => {
    return await categoryModel.findOneAndUpdate(query, updateObj, {
      new: true,
    });
  },

  categoryList: async (query) => {
    return await categoryModel.find(query);
  },

  removeCategory: async (query) => {
    return await categoryModel.deleteMany(query);
  },
  aggrcateCategory: async (insertObj) => {
    return await categoryModel.aggregate(insertObj);
  },
  categoryListWithPagination: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE } };
    const { search, fromDate, toDate, page, limit, type } = validatedBody;
    if (search) {
      query.$or = [{ categoryName: { $regex: search, $options: "i" } }];
    }
    if (type) {
      query.categoryType = type;
    }
    if (fromDate && !toDate) {
      query.createdAt = {
        $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString(),
      };
    }
    if (!fromDate && toDate) {
      query.createdAt = {
        $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString(),
      };
    }
    if (fromDate && toDate) {
      query.$and = [
        {
          createdAt: {
            $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString(),
          },
        },
        {
          createdAt: {
            $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString(),
          },
        },
      ];
    }
    let options = {
      page: page || 1,
      limit: limit || 10,
      sort: { createdAt: -1 },
    };
    return await categoryModel.paginate(query, options);
  },

  countCategory: async (query) => {
    return await categoryModel.countDocuments(query);
  },
};

export default categoryServices;
