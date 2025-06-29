import subCategoryModel from "../../../models/subCategory.js";
import status from "../../../enums/status.js";


const subCategoryServices = {

    createSubCategory: async (insertObj) => {
        return await subCategoryModel.create(insertObj);
    },

    findSubCategory: async (query) => {
        return await subCategoryModel.findOne(query).populate('categoryId');
    },

    updateSubCategory: async (query, updateObj) => {
        return await subCategoryModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    subCategoryList: async (query) => {
        return await subCategoryModel.find(query);
    },

    removeSubCategory: async (query) => {
        return await subCategoryModel.deleteMany(query);
    },

    subCategoryListWithPagination: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { search, fromDate, toDate, page, limit, categoryId } = validatedBody;
        if (search) {
            query.$or = [
                { subCategoryName: { $regex: search, $options: 'i' } },
            ]
        }
        if (categoryId) {
            query.categoryId = categoryId
        }
        if (fromDate && !toDate) {
            query.createdAt = { $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString() };
        }
        if (!fromDate && toDate) {
            query.createdAt = { $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString() };
        }
        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: new Date(new Date(fromDate).setHours(0, 0)).toISOString() } },
                { createdAt: { $lte: new Date(new Date(toDate).setHours(23, 59)).toISOString() } },
            ]
        }
        let options = {
            page: page || 1,
            limit: limit || 10,
            sort: { createdAt: -1 },
            populate: ('categoryId')
        };
        return await subCategoryModel.paginate(query, options);
    },

    updateSubCategoryMany: async (query, updateObj) => {
        return await subCategoryModel.updateMany(query, updateObj, { multi: true })
    },

    subCategoryCount: async (query) => {
        return await subCategoryModel.find(query).populate('categoryId');
    },

    subCategoryCount: async (query) => {
        return await subCategoryModel.aggregate(query)
    }
}

export default subCategoryServices;