import contactUsModel from "../../../models/contactUs.js";
import statuss from "../../../enums/status.js";

const contactusServices = {
  createContactUs: async (insertObj) => {
    return await contactUsModel.create(insertObj);
  },

  findContactUs: async (query) => {
    return await contactUsModel.findOne(query);
  },

  updateContactUs: async (query, updateObj) => {
    return await contactUsModel.findOneAndUpdate(query, updateObj, {
      new: true,
    });
  },
  deleteContactUs: async (query, updateObj) => {
    return await contactUsModel.findByIdAndDelete(query, updateObj, {
      new: true,
    });
  },

  ContactUsListwithoutSearch: async (query) => {
    query = { status: { $ne: "DELETE" } };
    return await contactUsModel.find(query);
  },
  contactUsLists: async (validatedBody) => {
    const { search, fromDate, userType, toDate, page, limit, status } =
      validatedBody;
    let query = { status: { $ne: statuss.DELETE } };
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }
    if (status) {
      query.status = status;
    }
    if (userType) {
      query.userType = userType;
    }
    if (fromDate && !toDate) {
      query.createdAt = {
        $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
      };
    }
    if (!fromDate && toDate) {
      query.createdAt = {
        $lte: new Date(
          new Date(toDate).toISOString().slice(0, 10) + "MMM DD, YYYY hh:mm A"
        ),
      };
    }
    if (fromDate && toDate) {
      query.$and = [
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
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 },
    };

    return await contactUsModel.paginate(query, options);
  },
};

export default contactusServices;
