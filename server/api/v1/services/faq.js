import faqModel from "../../../models/faq.js";
import status from "../../../enums/status.js";

const faqServices = {
  createFAQ: async (insertObj) => {
    return await faqModel.create(insertObj);
  },

  findFAQ: async (query) => {
    return await faqModel.findOne(query);
  },

  updateFAQ: async (query, updateObj) => {
    return await faqModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  faqList: async () => {
    return await faqModel.find({});
  },

  deleteFaqData: async (query) => {
    return await faqModel.deleteOne(query);
  },

  listAllFAQ: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE } };
    const { search, fromDate, toDate, page, limit } = validatedBody;
    if (search) {
      query.$or = [{ question: { $regex: search, $options: "i" } }];
    }

    if (fromDate && toDate) {
      const startOfDay = new Date(fromDate);
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999); // Set the end time of the day
      // query.createdAt = { $gte: fromDate, $lte: toDate };
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

    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 200,
      sort: { createdAt: -1 },
    };
    // return await announcementModel.paginate(query, options);
    const result = await faqModel.paginate(query, options);

    // Calculate the total pages count
    const totalPages = Math.ceil(result.total / options.limit);

    // Add the total pages count to the result object
    result.totalPages = totalPages;

    return result;
  },
};

export default faqServices;
