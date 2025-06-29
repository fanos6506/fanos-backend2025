import bannersModel from "../../../models/banner.js";

const bannersServices = {
  bannersCreate: async (insertObj) => {
    return await bannersModel(insertObj).save();
  },
  bannersData: async (query) => {
    return await bannersModel.findOne(query);
  },
  bannersFind: async (query) => {
    return await bannersModel.find(query).sort({ createdAt: -1 });
  },
  bannersList: async (query) => {
    return await bannersModel.paginate(query);
  },
  deleteBanners: async (query) => {
    return await bannersModel.findByIdAndDelete(query);
  },
  bannersUpdate: async (query, updateObj) => {
    return await bannersModel.findByIdAndUpdate(query, updateObj, {
      new: true,
    });
  },
  bultiUpdateBanners: async (query, updateObj) => {
    return await bannersModel.updateMany(query, updateObj, { multi: true });
  },
};

export default bannersServices;
