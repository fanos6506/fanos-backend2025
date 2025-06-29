import deliveryChargeModel from "../../../models/deliverySetting.js";


const deliveryChargeServices = {

    addDeliveryCharge: async (insertObj) => {
        return await deliveryChargeModel.create(insertObj);
    },

    findDeliveryCharge: async (query) => {
        return await deliveryChargeModel.findOne(query);
    },

    updateDeliveryCharge: async (query, updateObj) => {
        return await deliveryChargeModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    deliveryChargeList: async (query) => {
        return await deliveryChargeModel.find(query);
    },


}

export default deliveryChargeServices;
