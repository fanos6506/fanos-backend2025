import Joi from "joi";
import * as _ from 'lodash';
import config from "config";
import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import responseMessage from "../../../../../assets/responseMessage.js";
import status from "../../../../enums/status.js";
import commonFunction from "../../../../helper/util.js";
import  userServices  from "../../services/user.js";
import  categoryServices  from "../../services/category.js";
import  subCategoryServices  from "../../services/subCategory.js";
import  productServices  from "../../services/product.js";
import mongoose from "mongoose";
const {
  createSubCategory,
  findSubCategory,
  updateSubCategory,
  subCategoryList,
  subCategoryListWithPagination,
  removeSubCategory,
  subCategoryCount,
  updateSubCategoryMany,
} = subCategoryServices;
const {
  createCategory,
  findCategory,
  updateCategory,
  categoryList,
  categoryListWithPagination,
  removeCategory,
  aggrcateCategory,
} = categoryServices;
const { findAllProduct } = productServices;
const {
  userCheck,
  checkUserExists,
  emailMobileExist,
  checkSocialLogin,
  findCount,
  createUser,
  findUser,
  findUserData,
  deleteUser,
  userFindList,
  updateUser,
  updateUserById,
  insertManyUser,
  paginateSearch,
  userCount,
  userList,
} = userServices;

export class categoryController {
  /**
   * @swagger
   * components:
   *   securitySchemes:
   *     tokenauth:
   *       type: apiKey
   *       in: header
   *       name: token
   *       description: قم بإدخال التوكن مباشرة بدون إضافات. مثال - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * 
   *   responses:
   *     UnauthorizedError:
   *       description: غير مصرح به - التوكن غير صالح أو مفقود
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: boolean
   *                 example: false
   *               message:
   *                 type: string
   *                 example: "غير مصرح به"
   */

  /**
   * @swagger
   * /category/createCategory:
   *   post:
   *     tags:
   *       - CATEGORY
   *     description: createCategory
   *     produces:
   *       - application/json
   *     security:
   *       - tokenauth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               categoryName:
   *                 type: string
   *               categoryImage:
   *                 type: string
   *                 description: URL of the category image
   *               categoryType:
   *                 type: string
   *                 enum: ["PRODUCT"]
   *             required:
   *               - categoryName
   *               - categoryImage
   *               - categoryType
   *     responses:
   *       200:
   *         description: Category created successfully.
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       400:
   *         description: Bad Request
   */
  async createCategory(req, res, next) {
    const validationSchema = Joi.object({
      categoryName: Joi.string().required(),
      categoryImage: Joi.string().required(),
      categoryType: Joi.string().valid("PRODUCT").required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      
      // التحقق من وجود القسم
      let findResult = await findCategory({
        categoryName: validatedBody.categoryName,
        status: { $ne: status.DELETE },
      });
      
      if (findResult) {
        throw apiError.conflict(responseMessage.CATEGORY_ALREADY_EXIST);
      }

      // إضافة التواريخ الصحيحة
      validatedBody.createdAt = new Date();
      validatedBody.updatedAt = new Date();
      
      let saveRes = await createCategory(validatedBody);
      return res.json(new response(saveRes, responseMessage.CATEGORY_CREATED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /category/updateCategory:
   *   put:
   *     tags:
   *       - CATEGORY
   *     description: updateCategory
   *     produces:
   *       - application/json
   *     security:
   *       - tokenauth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               categoryId:
   *                 type: string
   *               categoryName:
   *                 type: string
   *               categoryImage:
   *                 type: string
   *               categoryType:
   *                 type: string
   *                 enum: ["PRODUCT"]
   *     responses:
   *       200:
   *         description: Category updated successfully.
   */
  async updateCategory(req, res, next) {
    const validationSchema = Joi.object({
      categoryId: Joi.string().required(),
      categoryName: Joi.string().optional(),
      categoryImage: Joi.string().optional(),
      categoryType: Joi.string().valid("PRODUCT").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      
      let categoryRes = await findCategory({
        _id: validatedBody.categoryId,
        status: { $ne: status.DELETE },
      });
      
      if (!categoryRes) {
        throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
      }

      if (validatedBody.categoryName) {
        let findResult = await findCategory({
          categoryName: validatedBody.categoryName,
          _id: { $ne: categoryRes._id },
          status: { $ne: status.DELETE },
        });
        
        if (findResult) {
          throw apiError.conflict(responseMessage.CATEGORY_ALREADY_EXIST);
        }
      }

      // تحديث تاريخ التعديل
      validatedBody.updatedAt = new Date();
      
      let updateRes = await updateCategory(
        { _id: categoryRes._id },
        validatedBody
      );
      
      return res.json(new response(updateRes, responseMessage.CATEGORY_UPDATED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /category/viewCategory:
   *   get:
   *     tags:
   *       - CATEGORY
   *     description: viewCategory
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: categoryId
   *         description: categoryId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewCategory(req, res, next) {
    const validationSchema = Joi.object({
      categoryId: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      let categoryRes = {};
      let categoryData = await findCategory({
        _id: validatedBody.categoryId,
        status: { $ne: status.DELETE },
      });
      categoryData = JSON.parse(JSON.stringify(categoryData));
      categoryRes = categoryData;
      if (!categoryRes) {
        throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
      }
      let pipeline = [
        {
          $match: {
            categoryId:new mongoose.Types.ObjectId(validatedBody.categoryId),
          },
        },
        {
          $count: "categoryId",
        },
      ];
      let count = await subCategoryCount(pipeline);
      categoryRes.count = 0;
      if (count.length != 0) {
        categoryRes.count = count[0].categoryId;
      }
      return res.json(
        new response(categoryRes, responseMessage.CATEGORY_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /category/listCategory:
   *   get:
   *     tags:
   *       - CATEGORY
   *     description: listCategory
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: type
   *         description: type
   *         enum: ["PRODUCT"]
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         type: integer
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async listCategory(req, res, next) {
    const validationSchema = Joi.object({
      categoryTypes: Joi.string().allow("").optional(),
      search: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
      type: Joi.string().valid("PRODUCT").optional()
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      let dataResults = await categoryListWithPagination(validatedBody);
      
      // إذا لم يتم العثور على أقسام، نرجع مصفوفة فارغة بدلاً من رمي خطأ
      if (!dataResults || !dataResults.docs || dataResults.docs.length === 0) {
        return res.json(new response({ 
          docs: [],
          totalDocs: 0,
          limit: validatedBody.limit || 10,
          page: validatedBody.page || 1,
          totalPages: 0
        }, "لا توجد أقسام"));
      }

      let subCategoryData = await subCategoryList();
      subCategoryData = JSON.parse(JSON.stringify(subCategoryData));
      
      // حساب عدد الأقسام الفرعية لكل قسم
      const counts = {};
      subCategoryData.forEach((obj) => {
        const key = obj.categoryId;
        counts[key] = counts[key] ? counts[key] + 1 : 1;
      });

      // دمج البيانات
      const merged = dataResults.docs.map(obj => {
        const key = obj._id;
        const count = counts[key] || 0;
        return { ...obj._doc, count };
      });

      dataResults.docs = merged;
      return res.json(new response(dataResults, "تم العثور على الأقسام"));
    } catch (error) {
      console.error("خطأ في listCategory:", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /category/deleteCategory:
   *   delete:
   *     summary: Delete Category
   *     tags:
   *       - CATEGORY
   *     description: Delete Category
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: categoryId
   *         description: categoryId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async deleteCategory(req, res, next) {
    const validationSchema = Joi.object({
      categoryId: Joi.string().required(),
    });
    try {
      const validationBody = await validationSchema.validateAsync(req.query);

      const category = await findCategory({ _id: validationBody.categoryId });
      console.log("category: ", category);
      if (!category) {
        throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
      }

      const result = await removeCategory({ _id: validationBody.categoryId });
      return res.json(new response(result, responseMessage.CATEGORY_DELETED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /category/createSubCategory:
   *   post:
   *     tags:
   *       - SUB_CATEGORY
   *     description: createSubCategory
   *     produces:
   *       - application/json
   *     security:
   *       - tokenauth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               subCategoryName:
   *                 type: string
   *               subCategoryImage:
   *                 type: string
   *                 description: URL of the subcategory image
   *               categoryId:
   *                 type: string
   *             required:
   *               - subCategoryName
   *               - subCategoryImage
   *               - categoryId
   *     responses:
   *       200:
   *         description: Returns success message
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       400:
   *         description: Bad Request
   */
  async createSubCategory(req, res, next) {
    const validationSchema = Joi.object({
      subCategoryName: Joi.string().required(),
      subCategoryImage: Joi.string().required(),
      categoryId: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let findResult = await findSubCategory({
        subCategoryName: validatedBody.subCategoryName,
        status: { $ne: status.DELETE },
      });
      if (findResult) {
        throw apiError.conflict(responseMessage.EXIST_SUBCATEGORY);
      }
      let categoryRes = await findCategory({
        _id: validatedBody.categoryId,
        status: { $ne: status.DELETE },
      });
      if (!categoryRes) {
        throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
      }

      let saveRes = await createSubCategory(validatedBody);
      await updateCategory(
        { _id: categoryRes._id },
        { isSubCategoryCreated: true }
      );
      return res.json(
        new response(saveRes, responseMessage.CREATE_SUBCATEGORY)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /category/updateSubCategory:
   *   put:
   *     tags:
   *       - SUB_CATEGORY
   *     description: updateSubCategory
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: subCategoryId
   *         description: subCategoryId
   *         in: formData
   *         required: true
   *       - name: subCategoryName
   *         description: subCategoryName
   *         in: formData
   *         required: false
   *       - name: subCategoryImage
   *         description: subCategoryImage
   *         in: formData
   *         type: file
   *         required: false
   *       - name: categoryId
   *         description: categoryId
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async updateSubCategory(req, res, next) {
    const validationSchema = Joi.object({
      subCategoryId: Joi.string().required(),
      subCategoryName: Joi.string().optional(),
      subCategoryImage: Joi.string().optional(),
      categoryId: Joi.string().optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let findSubCategoryRes = await findSubCategory({
        _id: validatedBody.subCategoryId,
        status: { $ne: status.DELETE },
      });
      if (!findSubCategoryRes) {
        throw apiError.notFound(responseMessage.SUBCATEGORY_NOT_FOUND);
      }
      let findResult = await findSubCategory({
        subCategoryName: validatedBody.subCategoryName,
        _id: { $ne: findSubCategoryRes._id },
        status: { $ne: status.DELETE },
      });
      if (findResult) {
        throw apiError.conflict(responseMessage.EXIST_SUBCATEGORY);
      }
      if (validatedBody.categoryId) {
        let categoryRes = await findCategory({
          _id: validatedBody.categoryId,
          status: { $ne: status.DELETE },
        });
        if (!categoryRes) {
          throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
        }
        await updateCategory(
          { _id: categoryRes._id },
          { isSubCategoryCreated: true }
        );
      }
      if (req.files && req.files.length != 0) {
        let imgUrl1 = await commonFunction.getImageUrl(req.files[0].path);
        validatedBody.subCategoryImage = imgUrl1.secure_url;
      }

      let saveRes = await updateSubCategory(
        { _id: findSubCategoryRes._id },
        validatedBody
      );
      return res.json(
        new response(saveRes, responseMessage.SUBCATEGORY_UPDATED)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /category/viewSubCategory:
   *   get:
   *     tags:
   *       - SUB_CATEGORY
   *     description: viewSubCategory
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: subCategoryId
   *         description: subCategoryId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewSubCategory(req, res, next) {
    const validationSchema = Joi.object({
      subCategoryId: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      let findSubCategoryRes = await findSubCategory({
        _id: validatedBody.subCategoryId,
        status: { $ne: status.DELETE },
      });
      if (!findSubCategoryRes) {
        throw apiError.notFound(responseMessage.SUBCATEGORY_NOT_FOUND);
      }
      return res.json(
        new response(findSubCategoryRes, responseMessage.SUBCATEGORY_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /category/listSubCategory:
   *   get:
   *     tags:
   *       - SUB_CATEGORY
   *     description: listSubCategory
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         type: integer
   *         required: false
   *       - name: categoryId
   *         description: categoryId
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async listSubCategory(req, res, next) {
    const validationSchema = Joi.object({
      categoryId: Joi.string().allow("").optional(),
      search: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      let dataResults = await subCategoryListWithPagination(validatedBody);
      if (dataResults.docs.length == 0) {
        throw apiError.notFound(responseMessage.SUBCATEGORY_NOT_FOUND);
      }
      let productData = await findAllProduct();
      productData = JSON.parse(JSON.stringify(productData));
      // Count the occurrences of each key value in productData
      const counts = {};
      productData.forEach((obj) => {
        const key = obj.subCategoryId;
        counts[key] = counts[key] ? counts[key] + 1 : 1;
      });

      // Merge the arrays
      const merged = [];
      dataResults.docs.forEach((obj) => {
        const key = obj._id;
        const count = counts[key] || 0; // Use count if it exists, otherwise 0
        const existingObj = merged.find((o) => o._id === key);
        if (existingObj) {
          existingObj._id = obj.subCategoryId;
          existingObj.count = count;
        } else {
          merged.push({ ...obj._doc, count });
        }
      });

      dataResults.docs = merged;

      return res.json(
        new response(dataResults, responseMessage.SUBCATEGORY_FOUND)
      );
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /category/deleteSubCategory:
   *   delete:
   *     summary: Delete Sub Category
   *     tags:
   *       - SUB_CATEGORY
   *     description: Delete Sub Category
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: subCategoryId
   *         description: subCategoryId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async deleteSubCategory(req, res, next) {
    const validationSchema = Joi.object({
      subCategoryId: Joi.string().required(),
    });
    try {
      const validationBody = await validationSchema.validateAsync(req.query);

      const category = await findSubCategory({
        _id: validationBody.subCategoryId,
      });
      console.log("category: ", category);
      if (!category) {
        throw apiError.notFound(responseMessage.SUBCATEGORY_NOT_FOUND);
      }

      const result = await removeSubCategory({
        _id: validationBody.subCategoryId,
      });
      return res.json(new response(result, responseMessage.SUBCATEGORY_DELETE));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /category/listCategoryAndSubCategory:
   *   get:
   *     summary: list Category And Sub-Category
   *     tags:
   *       - LIST_CATEGORY_AND_SUB_CATEGORY
   *     description: List Category And Sub-Category
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async listCategoryAndSubCategory(req, res, next) {
    try {
      const pipeline = [
        {
          $lookup: {
            from: "subcategories",
            localField: "_id",
            foreignField: "categoryId",
            as: "subcategories",
          },
        },
      ];
      const result = await aggrcateCategory(pipeline);
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /category/blockUnblockCategory:
   *   put:
   *     summary: blockUnblockCategory
   *     tags:
   *       - SUB_CATEGORY
   *     description: blockUnblockCategory When ADMIN want to block Category or Unblock Category on Plateform
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: blockUnblockCategory
   *         description: blockUnblockCategory
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/blockUnblockUser'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async blockUnblockCategory(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: "ADMIN" },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var categoryInfo = await findCategory({
        _id:new mongoose.Types.ObjectId(validatedBody._id),
      });
      if (!categoryInfo) {
        throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
      }
      if (categoryInfo.status == status.ACTIVE) {
        let blockRes = await updateCategory(
          { _id: categoryInfo._id },
          { status: status.BLOCK }
        );
        await updateSubCategoryMany(
          { categoryId: categoryInfo._id },
          { status: status.BLOCK }
        );
        return res.json(new response(blockRes, responseMessage.BLOCK_BY_ADMIN));
      } else {
        let activeRes = await updateCategory(
          { _id: categoryInfo._id },
          { status: status.ACTIVE }
        );
        await updateSubCategoryMany(
          { categoryId: categoryInfo._id },
          { status: status.ACTIVE }
        );
        return res.json(
          new response(activeRes, responseMessage.UNBLOCK_BY_ADMIN)
        );
      }
    } catch (error) {
      return next(error);
    }
  }

   /**
   * @swagger
   * /category/blockUnblockSubCategory:
   *   put:
   *     summary: blockUnblockSubCategory
   *     tags:
   *       - SUB_CATEGORY
   *     description: blockUnblockSubCategory When ADMIN want to block Category or Unblock Category on Plateform
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: blockUnblockSubCategory
   *         description: blockUnblockSubCategory
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/blockUnblockUser'
   *     responses:
   *       200:
   *         description: Returns success message
   */
   async blockUnblockSubCategory(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: "ADMIN" },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var subCategoryInfo = await findSubCategory({
        _id:new mongoose.Types.ObjectId(validatedBody._id),
      });
      if (!subCategoryInfo) {
        throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
      }
      if (subCategoryInfo.status == status.ACTIVE) {
        let blockRes = await updateSubCategory(
          { _id: subCategoryInfo._id },
          { status: status.BLOCK }
        );
        return res.json(new response(blockRes, responseMessage.BLOCK_BY_ADMIN));
      } else {
        let activeRes = await updateSubCategory(
          { _id: subCategoryInfo._id },
          { status: status.ACTIVE }
        );
        return res.json(
          new response(activeRes, responseMessage.UNBLOCK_BY_ADMIN)
        );
      }
    } catch (error) {
      return next(error);
    }
  }
}
export default new categoryController();
