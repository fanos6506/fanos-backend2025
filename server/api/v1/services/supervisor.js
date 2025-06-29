
import userModel from "../../../models/user.js";
import storeModel from "../../../models/store.js"
import couponModel from "../../../models/coupon.js"
import invoiceModel from "../../../models/invoice.js"
import status from '../../../enums/status.js';
import userType from "../../../enums/userType.js";
import approveStatus from "../../../enums/approveStatus.js";

const supervisorServices = {

  createStore: async (insertObj) => {
    return await storeModel.create(insertObj);
  },

  removeStore: async (query) => {
    return await storeModel.deleteOne(query);
  },
  removeManyStores: async (query) => {
    return await storeModel.deleteMany(query);
  },

  findStore: async (query) => {
    return await storeModel.findOne(query);
  },

  countStore: async (query) => {
    return await storeModel.countDocuments(query);
  },
  
  updateStore: async (query, updateObj) => {
    return await storeModel.findByIdAndUpdate(query, updateObj, { new: true });
  },

  paginateStoreSearch: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE } };
    const { search, fromDate, toDate, page, limit } = validatedBody;
    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
      ]
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
      ]
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 }
    };
    return await storeModel.paginate(query, options);
  },

  paginateSearchForStore: async (validatedBody) => {
    let query = {};
    const { search, fromDate, toDate, page, limit, status } = validatedBody;
    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
      ]
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)) };
    }

    if (fromDate && !toDate) {
      query.createdAt = { $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)) };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: new Date(new Date(toDate).toISOString().slice(0, 10) + 'MMM DD, YYYY hh:mm A') };

    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)) } },
        { createdAt: { $lte: new Date(new Date(toDate).toISOString().slice(0, 10) + 'MMM DD, YYYY hh:mm A') } },
      ]
    }
    if (status) {
      query.status = { $regex: status, $options: 'i' }
    }

    let options = {
      page: page || 1,
      limit: limit || 15,
      sort: { createdAt: -1 },
    };
    return await storeModel.paginate(query, options);
  },

  paginateCoupenSearch: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE } };
    const { search, fromDate, toDate,  status1 , page, limit} = validatedBody;
    if (search) {
      query.$or = [
        { couponCode: { $regex: search, $options: 'i' } },
      ]
    }
    if (status1) {
      query.status = status1
    }

    if (fromDate && !toDate) {
      query.createdAt = { $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)) };

    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: new Date(new Date(toDate).toISOString().slice(0, 10) + 'MMM DD, YYYY hh:mm A') };

    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)) } },
        { createdAt: { $lte: new Date(new Date(toDate).toISOString().slice(0, 10) + 'MMM DD, YYYY hh:mm A') } },
      ]
    }
    let options = {
      page: page || 1,
      limit: limit || 10,
      sort: { createdAt: -1 },
    };
    return await couponModel.paginate(query, options);
  },

  findListStore: async (query) => {
    return await storeModel.find(query);
  },

  addCoupon: async (insertObj) => {
    return await couponModel.create(insertObj);
  },

  getCoupon: async (query) => {
    return await couponModel.findOne(query);
  },

  findCoupon: async (query) => {
    return await couponModel.find(query);
  },

  getAllCouponList: async (query) => {
    return await couponModel.find(query).sort({ createdAt: -1 });
  },

  getSingleCoupon: async (query) => {
    return await couponModel.findOne(query);
  },

  couponDelete: async (query) => {
    return await couponModel.deleteOne(query);
  },

  couponDeleteMany: async (query) => {
    return await couponModel.deleteMany(query);
  },

  updateCoupon: async (query, updateObj) => {
    return await couponModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  updateCouponById: async (query, updateObj) => {
    return await couponModel.findByIdAndUpdate(query, updateObj, { new: true });
  },

  createInvoice: async (insertObj) => {
    return await invoiceModel.create(insertObj);
  },

  getInvoice: async (query) => {
    return await invoiceModel.findOne(query);
  },

  findInvoice: async (query) => {
    return await invoiceModel.find(query);
  },

  getAllInvoiceList: async (query) => {
    return await invoiceModel.find(query).sort({ createdAt: -1 });
  },

}

export default  supervisorServices ;
