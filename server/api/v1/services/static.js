import staticModel from "../../../models/static.js";

const staticServices = {
  createStaticContent: async (insertObj) => {
    return await staticModel.create(insertObj);
  },

  findStaticContent: async (query) => {
    return await staticModel.findOne(query);
  },

  updateStaticContent: async (query, updateObj) => {
    return await staticModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  deleteStaticContent: async (query) => {
    return await staticModel.deleteOne(query);
  },

  staticContentList: async (query) => {
    return await staticModel.find(query);
  },
};

export default staticServices;
