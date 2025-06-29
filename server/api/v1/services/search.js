import searchModel from "../../../models/search.js";


const searchServices = {

    createSearch: async (insertObj) => {
        return await searchModel.create(insertObj);
    },

    findSearch: async (query) => {
        return await searchModel.findOne(query);
    },

    updateSearch: async (query, updateObj) => {
        return await searchModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    SearchList: async (query) => {
        return await searchModel.find(query).sort({ createdAt: -1 });
    },


}

export default searchServices;
