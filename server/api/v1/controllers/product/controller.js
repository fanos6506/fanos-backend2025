import Joi from "joi";
import * as _ from 'lodash';
import config from "config";
import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import responseMessage from "../../../../../assets/responseMessage.js";
import status from "../../../../enums/status.js";
import commonFunction from "../../../../helper/util.js";
import approveStatus from "../../../../enums/approveStatus.js";
import categoryType from "../../../../enums/categoryType.js";
import  userServices  from "../../services/user.js";
import  categoryServices  from "../../services/category.js";
import subCategoryServices from "../../services/subCategory.js";
import  productServices  from "../../services/product.js";
import userType from "../../../../enums/userType.js";

import Product from "../../../../models/product.js";
const {
  addProduct,
  createProduct,
  findProduct,
  findProduct1,
  updateProduct,
  countProduct,
  paginateSortingForProduct,
  countDocuments,
  productList,
  findAllProduct,
  FindAllPaginateSearchForProduct,
  productListWithPagination,
  ParticularProductListWithPagination,
  ParticularProductListWithPaginationForProductStatus,
  findMyLikesProduct,
  listProductV2,
  deleteProduct,
  deleteProducts,
  paginateSearchForProduct,
  paginateSearch1,
} = productServices;
const {
  createSubCategory,
  findSubCategory,
  updateSubCategory,
  subCategoryList,
  subCategoryListWithPagination,
} = subCategoryServices;
const {
  createCategory,
  findCategory,
  updateCategory,
  categoryList,
  categoryListWithPagination,
} = categoryServices;
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

import  reportService  from "../../services/report.js";
const {
  createReport,
  findReport,
  updateReport,
  reportList,
  reportPaginate,
  countReport,
} = reportService;

import  notificationServices  from "../../services/notification.js";
const { notificationCreate, notificationData, notificationUpdate } =
  notificationServices;

import  chattingServices  from "../../services/socket.js";
const { findChat } = chattingServices;

import  searchServices  from "../../services/search.js";
const { createSearch, findSearch, updateSearch, SearchList } = searchServices;

import  wishlistServices  from "../../services/wishlist.js";
const {
  createWishlist,
  findWishlist,
  updateWishlist,
  checkWishlist,
  paginateWishlistList,
  paginateWishlist,
  deleteWishlist,
  wishlistCount,
  wishlist,
} = wishlistServices;

import Mongoose from "mongoose";
import model_whishlist from "../../../../models/whishlist.js";
import fs from 'fs';
import path from 'path';

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export class productController {
  /**
   * @swagger
   * /product/addProduct:
   *   post:
   *     tags:
   *       - PRODUCT
   *     description: Add a new product
   *     produces:
   *       - application/json
   *     security:
   *       - tokenauth: []
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - name: productName
   *         description: Name of the product
   *         in: formData
   *         type: string
   *         required: true
   *       - name: description
   *         description: Product description
   *         in: formData
   *         type: string
   *         required: true
   *       - name: categoryId
   *         description: Category ID
   *         in: formData
   *         type: string
   *         required: true
   *       - name: subCategoryId
   *         description: Subcategory ID
   *         in: formData
   *         type: string
   *         required: true
   *       - name: currency
   *         description: Currency (e.g. USD)
   *         in: formData
   *         type: string
   *         required: true
   *       - name: price
   *         description: Product price
   *         in: formData
   *         type: number
   *         required: true
   *       - name: location
   *         description: Product location
   *         in: formData
   *         type: string
   *         required: true
   *       - name: productImage1
   *         description: First product image
   *         in: formData
   *         type: file
   *         required: true
   *       - name: productImage2
   *         description: Second product image
   *         in: formData
   *         type: file
   *         required: true
   *       - name: productImage3
   *         description: Third product image
   *         in: formData
   *         type: file
   *         required: true
   *       - name: productImage4
   *         description: Fourth product image (optional)
   *         in: formData
   *         type: file
   *         required: false
   *       - name: productImage5
   *         description: Fifth product image (optional)
   *         in: formData
   *         type: file
   *         required: false
   *     responses:
   *       200:
   *         description: Product added successfully
   *       400:
   *         description: Invalid input data
   *       401:
   *         description: Unauthorized - Invalid or missing token
   */
  async addProduct(req, res, next) {
    const validationSchema = Joi.object({
      productName: Joi.string().required(),
      description: Joi.string().required(),
      categoryId: Joi.string().required(),
      subCategoryId: Joi.string().required(),
      currency: Joi.string().required(),
      price: Joi.number().required(),
      location: Joi.string().required()
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // التحقق من وجود الفئة
      let categoryRes = await findCategory({
        _id: validatedBody.categoryId,
        status: { $ne: status.DELETE }
      });
      
      if (!categoryRes) {
        throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
      }

      // التحقق من وجود الفئة الفرعية
      let subCategoryRes = await findSubCategory({
        _id: validatedBody.subCategoryId,
        categoryId: categoryRes._id,
        status: { $ne: status.DELETE }
      });
      
      if (!subCategoryRes) {
        throw apiError.notFound(responseMessage.SUBCATEGORY_NOT_FOUND);
      }

      // التحقق من الصور
      if (!req.files || req.files.length < 3) {
        throw apiError.badRequest("يجب رفع 3 صور على الأقل");
      }

      let productImages = [];
      for (let i = 0; i < req.files.length; i++) {
        let imgUrl = await commonFunction.getImageUrl(req.files[i].path);
        productImages.push(imgUrl.url);
      }

      validatedBody.userId = userResult._id;
      validatedBody.productImage = productImages;
      validatedBody.approveStatus = "PENDING";

      let result = await createProduct(validatedBody);

      return res.json(new response(result, responseMessage.PRODUCT_ADDED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/viewProduct:
   *   get:
   *     summary: View Product Details
   *     tags:
   *       - PRODUCT
   *     description: Get details of a specific product
   *     parameters:
   *       - name: productId
   *         description: ID of the product
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Product details retrieved successfully
   *       404:
   *         description: Product not found
   */
  async viewProduct(req, res, next) {
    var validationSchema = Joi.object({
      productId: Joi.string().required()
    });
    try {
      var validatedBody = await validationSchema.validateAsync(req.query);
      
      let productRes = await findProduct({
        _id: validatedBody.productId,
        status: { $ne: status.DELETE },
      });
      
      if (!productRes) {
        throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
      }
      
      productRes = productRes.toObject();

      // التحقق من وجود المنتج في قائمة المفضلة للمستخدم
      // Check if user is authenticated (optional authentication)
      if (req.userId) {
        try {
          // Get all wishlist items for current user
          const userWishlist = await model_whishlist.find({
            userId: req.userId,
            status: "ACTIVE"
          }).populate('userId').populate('ownerId').populate('productId');
          
          // Check if current product exists in user's wishlist
          let wishlistResult = null;
          for (let item of userWishlist) {
            if (item.productId._id.toString() === validatedBody.productId) {
              wishlistResult = item;
              break;
            }
          }

          if (wishlistResult) {
            productRes.inWishlist = true;
            productRes.wishlistId = wishlistResult._id;
          } else {
            productRes.inWishlist = false;
            productRes.wishlistId = null;
          }
        } catch (error) {
          console.error('Error checking wishlist:', error);
          productRes.inWishlist = false;
          productRes.wishlistId = null;
        }
      } else {
        productRes.inWishlist = false;
        productRes.wishlistId = null;
      }

      return res.json(new response(productRes, responseMessage.PRODUCT_FOUND));
    } catch (error) {
      console.error("Error in viewProduct:", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/listProduct:
   *   post:
   *     summary: List Products
   *     tags:
   *       - PRODUCT
   *     description: Get list of products with filters
   *     parameters:
   *       - name: search
   *         description: Search text
   *         in: formData
   *         required: false
   *       - name: fromDate
   *         description: Start date filter
   *         in: formData
   *         required: false
   *       - name: toDate
   *         description: End date filter
   *         in: formData
   *         required: false
   *       - name: page
   *         description: Page number
   *         in: formData
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: Items per page
   *         in: formData
   *         type: integer
   *         required: false
   *     responses:
   *       200:
   *         description: Products list retrieved successfully
   */
  async listProduct(req, res, next) {
    const validationSchema = Joi.object({
      categoryId: Joi.string().allow("").optional(),
      subCategoryId: Joi.string().allow("").optional(),
      approveStatus: Joi.string().allow("").optional(),
      search: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let dataResults = await productListWithPagination(validatedBody);
      
      if (dataResults.docs.length == 0) {
        return res.json(new response(dataResults, responseMessage.PRODUCT_FOUND));
      }

      // التحقق من وجود المنتجات في قائمة المفضلة للمستخدم
      if (req.userId) {
        try {
          // Get all wishlist items for current user once
          const userWishlist = await model_whishlist.find({
            userId: req.userId,
            status: "ACTIVE"
          }).populate('userId').populate('ownerId').populate('productId');
          
          // Create a map for faster lookup
          const wishlistMap = new Map();
          userWishlist.forEach(item => {
            wishlistMap.set(item.productId._id.toString(), item);
          });

          // Add wishlist information to each product
          const productsWithWishlist = dataResults.docs.map((product) => {
            const productObj = product.toObject ? product.toObject() : product;
            const wishlistResult = wishlistMap.get(productObj._id.toString());

            return {
              ...productObj,
              inWishlist: Boolean(wishlistResult),
              wishlistId: wishlistResult ? wishlistResult._id : null
            };
          });

          dataResults.docs = productsWithWishlist;
        } catch (error) {
          console.error('Error checking wishlist for products:', error);
          // If error occurs, return products without wishlist info
          const productsWithoutWishlist = dataResults.docs.map((product) => {
            const productObj = product.toObject ? product.toObject() : product;
            return {
              ...productObj,
              inWishlist: false,
              wishlistId: null
            };
          });
          dataResults.docs = productsWithoutWishlist;
        }
      } else {
        // No user authentication - add default wishlist info
        const productsWithoutWishlist = dataResults.docs.map((product) => {
          const productObj = product.toObject ? product.toObject() : product;
          return {
            ...productObj,
            inWishlist: false,
            wishlistId: null
          };
        });
        dataResults.docs = productsWithoutWishlist;
      }

      return res.json(new response(dataResults, responseMessage.PRODUCT_FOUND));
    } catch (error) {
      console.error("Error in listProduct:", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/myProductList:
   *   post:
   *     tags:
   *       - PRODUCT
   *     description: myProductList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: search
   *         description: search
   *         in: formData
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: formData
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: formData
   *         required: false
   *       - name: page
   *         description: page
   *         in: formData
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: formData
   *         type: integer
   *         required: false
   *       - name: categoryId
   *         description: categoryId
   *         in: formData
   *         required: false
   *       - name: subCategoryId
   *         description: subCategoryId
   *         in: formData
   *         required: false
   *       - name: approveStatus
   *         description: approveStatus
   *         enum: ["PENDING" ,"REJECTED","APPROVED"]
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async myProductList(req, res, next) {
    const validationSchema = Joi.object({
      categoryId: Joi.string().allow("").optional(),
      subCategoryId: Joi.string().allow("").optional(),
      approveStatus: Joi.string().allow("").optional(),
      search: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      validatedBody.userId = userResult._id;
      let dataResults = await ParticularProductListWithPagination(validatedBody);

      // Add wishlist information for each product
      if (dataResults.docs && dataResults.docs.length > 0) {
        const productsWithWishlist = await Promise.all(dataResults.docs.map(async (product) => {
          const productObj = product.toObject ? product.toObject() : product;
          const wishlistResult = await findWishlist({
            userId: req.userId,
            productId: product._id,
            status: { $ne: status.DELETE }
          });

          if (wishlistResult) {
            productObj.inWishlist = true;
            productObj.wishlistId = wishlistResult._id;
          } else {
            productObj.inWishlist = false;
            productObj.wishlistId = null;
          }
          return productObj;
        }));

        dataResults.docs = productsWithWishlist;
      }

      return res.json(new response(dataResults, responseMessage.PRODUCT_FOUND));
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/myProductListwithStatus:
   *   post:
   *     tags:
   *       - PRODUCT
   *     description: myProductListwithStatus
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: search
   *         description: search
   *         in: formData
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: formData
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: formData
   *         required: false
   *       - name: page
   *         description: page
   *         in: formData
   *         type: integer
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: formData
   *         type: integer
   *         required: false
   *       - name: categoryId
   *         description: categoryId
   *         in: formData
   *         required: false
   *       - name: subCategoryId
   *         description: subCategoryId
   *         in: formData
   *         required: false
   *       - name: status
   *         description: status
   *         enum: ["ACTIVE" ,"DEACTIVE","SOLD","DELETE","BLOCK","HIDE" , "ACTIVE And DEACTIVE"]
   *         in: formData
   *         required: false
   *       - name: approveStatus
   *         description: approveStatus
   *         enum: ["PENDING" ,"APPROVED","REJECTED"]
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async myProductListwithStatus(req, res, next) {
    const validationSchema = Joi.object({
      categoryId: Joi.string().allow("").optional(),
      subCategoryId: Joi.string().allow("").optional(),
      status: Joi.string().allow("").optional(),
      approveStatus: Joi.string().allow("").optional(),
      search: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      validatedBody.userId = userResult._id;
      if (validatedBody.status == "ACTIVE And DEACTIVE") {
        validatedBody.status = { $in: [status.ACTIVE, status.DEACTIVE] };
      }
      let dataResults = await FindAllPaginateSearchForProduct(validatedBody);

      // Add wishlist information for each product
      if (dataResults.docs && dataResults.docs.length > 0) {
        const productsWithWishlist = await Promise.all(dataResults.docs.map(async (product) => {
          const productObj = product.toObject ? product.toObject() : product;
          const wishlistResult = await findWishlist({
            userId: req.userId,
            productId: product._id,
            status: { $ne: status.DELETE }
          });

          if (wishlistResult) {
            productObj.inWishlist = true;
            productObj.wishlistId = wishlistResult._id;
          } else {
            productObj.inWishlist = false;
            productObj.wishlistId = null;
          }
          return productObj;
        }));

        dataResults.docs = productsWithWishlist;
      }

      return res.json(new response(dataResults, responseMessage.PRODUCT_FOUND));
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/updateProduct:
   *   post:
   *     summary: Update Product
   *     tags:
   *       - PRODUCT
   *     description: Update an existing product
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - name: productId
   *         description: ID of the product to update
   *         in: formData
   *         required: true
   *       - name: productName
   *         description: Name of the product
   *         in: formData
   *         required: false
   *       - name: description
   *         description: Product description
   *         in: formData
   *         required: false
   *       - name: categoryId
   *         description: Category ID
   *         in: formData
   *         required: false
   *       - name: subCategoryId
   *         description: Subcategory ID
   *         in: formData
   *         required: false
   *       - name: price
   *         description: Product price
   *         in: formData
   *         required: false
   *       - name: location
   *         description: Product location
   *         in: formData
   *         required: false
   *       - name: city
   *         description: City
   *         in: formData
   *         required: false
   *       - name: productImage1
   *         description: First product image
   *         in: formData
   *         type: file
   *         required: false
   *       - name: productImage2
   *         description: Second product image
   *         in: formData
   *         type: file
   *         required: false
   *       - name: productImage3
   *         description: Third product image
   *         in: formData
   *         type: file
   *         required: false
   *       - name: lat
   *         description: Latitude
   *         in: formData
   *         type: number
   *         required: false
   *       - name: long
   *         description: Longitude
   *         in: formData
   *         type: number
   *         required: false
   *     responses:
   *       200:
   *         description: Product updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Product not found
   */
  async updateProduct(req, res, next) {
    var validationSchema = Joi.object({
      productId: Joi.string().required(),
      productName: Joi.string().optional(),
      description: Joi.string().optional(),
      categoryId: Joi.string().optional(),
      subCategoryId: Joi.string().optional(),
      price: Joi.string().optional(),
      currency: Joi.string().required(),
      location: Joi.string().optional(),
      location: Joi.string().optional(),
      city: Joi.string().optional(),
      productImage1: Joi.string().optional(),
      productImage2: Joi.string().optional(),
      productImage3: Joi.string().optional(),
      productImage4: Joi.string().optional(),
      productImage5: Joi.string().optional(),
      productImage6: Joi.string().optional(),
      productImage7: Joi.string().optional(),
      productImage8: Joi.string().optional(),
      productImage9: Joi.string().optional(),
      productImage10: Joi.string().optional(),
      lat: Joi.number().optional(),
      long: Joi.number().optional(),
    });
    try {
      var validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      let findProductRes = await findProduct({
        _id: validatedBody.productId,
        userId: userResult._id,
        status: { $ne: status.DELETE },
      });
      if (!findProductRes) {
        throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
      }
      let productRes = await findProduct({
        productName: validatedBody.productName,
        _id: { $ne: findProductRes._id },
        status: { $ne: status.DELETE },
      });
      if (productRes) {
        throw apiError.conflict(responseMessage.EXIST_PRODUCT);
      }
      var categoryRes;
      if (validatedBody.categoryId) {
        categoryRes = await findCategory({
          _id: validatedBody.categoryId,
          status: { $ne: status.DELETE },
        });
        if (!categoryRes) {
          throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
        }
      }
      if (validatedBody.categoryId && validatedBody.subCategoryId) {
        let subCategoryRes = await findSubCategory({
          _id: validatedBody.subCategoryId,
          categoryId: categoryRes._id,
          status: { $ne: status.DELETE },
        });
        if (!subCategoryRes) {
          throw apiError.notFound(responseMessage.SUBCATEGORY_NOT_FOUND);
        }
      }
      console.log(
        5666415645,
        findProductRes.productImage,
        findProductRes.productImage.length
      );
      console.log(req.files, 1234);

      const result = findProductRes.productImage || [];
      console.log(result, 1234);
      if (req.files) {
        const fieldnameIndexMap = {
          productImage1: 0,
          productImage2: 1,
          productImage3: 2,
          productImage4: 3,
          productImage5: 4,
          productImage6: 5,
          productImage7: 6,
          productImage8: 7,
          productImage9: 8,
          productImage10: 9,
        };

        for (let i = 0; i < req.files.length; i++) {
          const fieldname = req.files[i].fieldname;
          const index = fieldnameIndexMap[fieldname];
          const imgUrl = await commonFunction.getImageUrl(req.files[i].path);
          if (index !== undefined && index < result.length) {
            result[index] = imgUrl.secure_url;
          } else {
            result.push(imgUrl.secure_url);
          }
        }
      }

      validatedBody.productImage = result;
      // احفظ حالة الموافقة الأصلية
      const currentApproveStatus = findProductRes.approveStatus;
      
      // إزالة السطر التالي:
      // validatedBody.approveStatus = approveStatus.APPROVED;
      // منطق جديد: لا تغير حالة الموافقة، فقط إذا كانت الحالة الحالية APPROVED
      if (currentApproveStatus === approveStatus.APPROVED) {
        validatedBody.approveStatus = approveStatus.APPROVED;
      } else {
        validatedBody.approveStatus = currentApproveStatus;
      }

      const updateRes = await updateProduct(
        { _id: findProductRes._id },
        validatedBody
      );

      await notificationCreate({
        userId: userResult._id,
        title: "Product updated",
        imageUrl: validatedBody.productImage[0],
        body: `this new ${validatedBody.productName} product has been updated successfully.`,
        currentTime: new Date().toISOString(),
        currentDay: daysOfWeek[new Date().getDay()],
      });
      return res.json(new response(updateRes, responseMessage.PRODUCT_UPDATED));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/updateProductStatus:
   *   put:
   *     tags:
   *       - PRODUCT
   *     description: تحديث حالة المنتج
   *     produces:
   *       - application/json
   *     security:
   *       - tokenauth: []
   *     parameters:
   *       - name: productId
   *         description: معرف المنتج
   *         in: header
   *         required: true
   *       - name: status
   *         description: الحالة الجديدة
   *         in: header
   *         required: true
   *         enum: ["DELETE", "SOLD", "ACTIVE", "DEACTIVE"]
   *     responses:
   *       200:
   *         description: تم تحديث حالة المنتج بنجاح
   *       400:
   *         description: خطأ في البيانات المدخلة
   *       404:
   *         description: المنتج غير موجود
   */
  async updateProductStatus(req, res, next) {
    try {
      console.log("Headers received:", req.headers);
      console.log("User ID from token:", req.userId);

      // التحقق من وجود الرؤوس المطلوبة
      if (!req.headers.productid || !req.headers.status) {
        console.log("Missing required headers");
        return res.status(400).json({
          status: false,
          message: "productId و status مطلوبان في رؤوس الطلب"
        });
      }

      // التحقق من صحة القيم
      const validationSchema = Joi.object({
        productId: Joi.string().required(),
        status: Joi.string().valid("DELETE", "SOLD", "ACTIVE", "DEACTIVE").required()
      });

      const validatedBody = await validationSchema.validateAsync({
        productId: req.headers.productid,
        status: req.headers.status
      });

      console.log("Validated data:", validatedBody);

      // التحقق من المستخدم
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE }
      });

      console.log("Found user:", userResult ? userResult._id : null);

      if (!userResult) {
        return res.status(404).json({
          status: false,
          message: responseMessage.USER_NOT_FOUND
        });
      }

      // التحقق من المنتج
      let findProductRes = await findProduct({
        _id: validatedBody.productId,
        userId: userResult._id
      });

      console.log("Found product:", findProductRes ? findProductRes._id : null);

      if (!findProductRes) {
        return res.status(404).json({
          status: false,
          message: responseMessage.PRODUCT_NOT_FOUND
        });
      }

      // تحديث حالة المنتج
      try {
        let updateRes = await updateProduct(
          { _id: findProductRes._id },
          { status: validatedBody.status }
        );
        console.log("Update result:", updateRes);

        // إنشاء عنوان ونص الإشعار بناءً على الحالة
        let notificationTitle = "تحديث حالة المنتج";
        let notificationBody = "";

        switch(validatedBody.status) {
          case "ACTIVE":
            notificationBody = `تم تنشيط منتجك "${findProductRes.productName}"`;
            break;
          case "DEACTIVE":
            notificationBody = `تم إلغاء تنشيط منتجك "${findProductRes.productName}"`;
            break;
          case "SOLD":
            notificationBody = `تم تحديث حالة منتجك "${findProductRes.productName}" إلى مباع`;
            break;
          case "DELETE":
            notificationBody = `تم حذف منتجك "${findProductRes.productName}"`;
            break;
        }

        // إرسال الإشعار
        try {
          await notificationCreate({
            userId: userResult._id,
            title: notificationTitle,
            body: notificationBody,
            currentTime: new Date().toISOString(),
            currentDay: daysOfWeek[new Date().getDay()]
          });

          if (userResult.deviceToken && userResult.deviceType !== "") {
            await commonFunction.pushNotification(
              userResult.deviceToken,
              notificationTitle,
              notificationBody
            );
          }
        } catch (notificationError) {
          console.error("Error sending notification:", notificationError);
        }

        return res.json(new response(updateRes, responseMessage.PRODUCT_UPDATED));
      } catch (updateError) {
        console.error("Error updating product:", updateError);
        throw updateError;
      }

    } catch (error) {
      console.error("Error in updateProductStatus:", error);
      console.error("Error stack:", error.stack);
      
      if (error.isJoi) {
        return res.status(400).json({
          status: false,
          message: error.details[0].message
        });
      }

      return res.status(500).json({
        status: false,
        message: "حدث خطأ في الخادم",
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /product/likeUnlikeProduct:
   *   put:
   *     tags:
   *       - PRODUCT_LIKE/UNLIKE
   *     description: likeUnlikeProduct
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async likeUnlikeProduct(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      let productCheck = await findProduct({
        _id: validatedBody._id,
        status: { $ne: status.DELETE },
      });
      if (!productCheck) {
        throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
      }
      let isExist = productCheck["likesUser"].some((id) => {
        return id.equals(userResult._id);
      });
      if (isExist == true) {
        let obj = {
          title: "Product Like.",
          description: `You have liked Product.`,
          type: "LIKE",
          userId: userResult._id,
          productId: productCheck._id,
        };
        var name = userResult.name;
        // await createActivity(obj);

        let notificationObj = {
          title: `Like a Product!`,
          description: `${name} has like your product.`,
          userId: userResult._id,
          notificationType: "PRODUCT_LIKE",
        };
        // await createNotification(notificationObj);
        let updateResult = await updateProduct(
          { _id: productCheck._id },
          { $pull: { likesUser: userResult._id } }
        );
        await updateUser(
          { _id: userResult._id },
          { $pull: { likesProduct: productCheck._id } }
        );
        return res.json(
          new response(updateResult, responseMessage.UNLIKE_SUCCESS)
        );
      } else {
        let updateRes = await updateProduct(
          { _id: productCheck._id },
          { $addToSet: { likesUser: userResult._id } }
        );
        await updateUser(
          { _id: userResult._id },
          { $addToSet: { likesProduct: productCheck._id } }
        );
        return res.json(new response(updateRes, responseMessage.LIKE_SUCCESS));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/myLikesProduct:
   *   get:
   *     tags:
   *       - PRODUCT_LIKE/UNLIKE
   *     description: myLikesProduct
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
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
  async myLikesProduct(req, res, next) {
    let validationSchema = Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);
      const { page, limit } = validatedBody;
      let userToken = await findUser({ _id: req.userId });
      if (!userToken) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let query = {
        status: status.ACTIVE,
        likesUser:new Mongoose.Types.ObjectId(userToken._id),
      };
      let myShortlistRes = await productList(query);
      if (myShortlistRes.length == 0) {
        return res.json(
          new response({ docs: myShortlistRes }, responseMessage.DATA_NOT_FOUND)
        );
      }

      if (page && limit) {
        let paginatedData = await commonFunction.paginationFunction(
          myShortlistRes,
          Number(page) || 1,
          Number(limit) || 10
        );
        return res.json(
          new response(paginatedData, responseMessage.DATA_FOUND)
        );
      }
      return res.json(
        new response({ docs: myShortlistRes }, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/deleteProduct:
   *   delete:
   *     summary: Delete Product
   *     tags:
   *       - PRODUCT
   *     description: Delete a product
   *     parameters:
   *       - name: _id
   *         description: Product ID to delete
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Product deleted successfully
   *       404:
   *         description: Product not found
   */
  async deleteProduct(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      let validatedBody = await validationSchema.validateAsync(req.query);
      let productCheck = await findProduct({
        _id: validatedBody._id,
        userId: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!productCheck) {
        throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
      }

      let updateRes = await deleteProduct({ _id: productCheck._id });
      return res.json(new response(updateRes, responseMessage.PRODUCT_DELETED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/createReport:
   *   post:
   *     tags:
   *       - REPORT
   *     description: createReport
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: productId
   *         description: productId
   *         in: formData
   *         required: false
   *       - name: reasonType
   *         description: reasonType
   *         in: formData
   *         enum: ["Duplicate ad","Inappropriate Content","Misleading Information","Offensive Language","Scam OR Fraud","Other (Please Specify)"]
   *       - name: description
   *         description: description
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Report added successfully.
   *       404:
   *         description: User not found.
   */
  async createReport(req, res, next) {
    try {
      const { productId, reasonType, description } = req.body;

      let user = await findUser({ _id: req.userId, status: status.ACTIVE });
      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const productData = await findProduct({
        _id: productId,
        status: status.ACTIVE,
      });
      if (!productData) {
        throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
      }

      let obj = {
        userId: user._id,
        productId: productData._id,
        reasonType: reasonType,
        description: description,
      };
      let data = await createReport(obj);
      return res.json(new response(data, responseMessage.REPORT_ADDED));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/createReportSeller:
   *   post:
   *     tags:
   *       - REPORT
   *     description: createReportSeller
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: user token
   *         in: header
   *         required: true
   *       - name: sellerId
   *         description: sellerId
   *         in: formData
   *         required: false
   *       - name: reasonType
   *         description: reasonType
   *         in: formData
   *         enum: ["Duplicate ad","Inappropriate Content","Misleading Information","Offensive Language","Scam OR Fraud","Other (Please Specify)"]
   *       - name: description
   *         description: description
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Report added successfully.
   *       404:
   *         description: User not found.
   */
  async createReportSeller(req, res, next) {
    try {
      const { sellerId, reasonType, description } = req.body;

      let user = await findUser({ _id: req.userId, status: status.ACTIVE });
      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const sellerData = await findUser({
        _id: sellerId,
        status: status.ACTIVE,
      });
      if (!sellerData) {
        throw apiError.notFound(responseMessage.SELLER_NOT_FOUND);
      }

      let obj = {
        userId: user._id,
        sellerId: sellerData._id,
        reasonType: reasonType,
        description: description,
      };

      let data = await createReport(obj);
      return res.json(new response(data, responseMessage.REPORT_ADDED));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/sellerProfile:
   *   post:
   *     summary: sellerProfile
   *     tags:
   *       - PRODUCT
   *     description: sellerProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async sellerProfile(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      var validatedBody = await validationSchema.validateAsync(req.body);

      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Create a new Date instance for today's date
      const today = new Date();
      let userData = await findUser({
        _id: validatedBody._id,
        status: { $ne: status.DELETE },
      });
      const userFollowStatus = userData.followers.includes(req.userId);
      const specificDate = userData.createdAt;
      const timeDifferenceMs = today - specificDate;

      // Calculate the difference between the two dates in days
      const timeDifferenceDays = Math.floor(
        timeDifferenceMs / (24 * 60 * 60 * 1000)
      );
      const timeStatus = `Joined ${timeDifferenceDays} days ago`;

      // Checking if Login user is already chat with seller or not if is yes then pass the chatId
      let checkChatIsExist = await findChat({
        $or: [
          {
            $and: [{ senderId: req.userId }, { receiverId: validatedBody._id }],
          },
          {
            $and: [{ senderId: validatedBody._id }, { receiverId: req.userId }],
          },
        ],
      });

      let obj = {
        profilePic: userData.profilePic,
        followers: userData.followers,
        followersCount: userData.followersCount,
        status: userFollowStatus,
        following: userData.following,
        followingCount: userData.followingCount,
        name: userData.name,
        joinedDate: timeStatus,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        chatId: checkChatIsExist ? checkChatIsExist._id : null,
      };
      return res.json(new response(obj, responseMessage.DETAILS_FETCHED));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/listedProduct:
   *   post:
   *     tags:
   *       - PRODUCT
   *     description: listedProduct
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async listedProduct(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const productListDATA = await productList({ userId: validatedBody._id });
      
      // Add wishlist information for each product if user is authenticated
      if (req.userId && productListDATA && productListDATA.length > 0) {
        try {
          // Get all wishlist items for current user once
          const userWishlist = await model_whishlist.find({
            userId: req.userId,
            status: "ACTIVE"
          }).populate('userId').populate('ownerId').populate('productId');
          
          // Create a map for faster lookup
          const wishlistMap = new Map();
          userWishlist.forEach(item => {
            wishlistMap.set(item.productId._id.toString(), item);
          });

          // Add wishlist information to each product
          const productsWithWishlist = productListDATA.map((product) => {
            const productObj = product.toObject ? product.toObject() : product;
            const wishlistResult = wishlistMap.get(productObj._id.toString());

            return {
              ...productObj,
              inWishlist: Boolean(wishlistResult),
              wishlistId: wishlistResult ? wishlistResult._id : null
            };
          });

          return res.json(
            new response(productsWithWishlist, responseMessage.PRODUCT_FOUND)
          );
        } catch (error) {
          console.error('Error checking wishlist for products:', error);
          // If error occurs, return products without wishlist info
          const productsWithoutWishlist = productListDATA.map((product) => {
            const productObj = product.toObject ? product.toObject() : product;
            return {
              ...productObj,
              inWishlist: false,
              wishlistId: null
            };
          });
          return res.json(
            new response(productsWithoutWishlist, responseMessage.PRODUCT_FOUND)
          );
        }
      } else {
        // No user authentication or no products - add default wishlist info
        const productsWithoutWishlist = productListDATA.map((product) => {
          const productObj = product.toObject ? product.toObject() : product;
          return {
            ...productObj,
            inWishlist: false,
            wishlistId: null
          };
        });
        return res.json(
          new response(productsWithoutWishlist, responseMessage.PRODUCT_FOUND)
        );
      }
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/searchProductApi:
   *   post:
   *     tags:
   *       - PRODUCT
   *     description: searchProductApi
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: categoryName
   *         description: categoryName
   *         in: formData
   *         required: false
   *       - name: subCategoryName
   *         description: subCategoryName
   *         in: formData
   *         required: false
   *       - name: productName
   *         description: productName
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async searchProductApi(req, res, next) {
    var validationSchema = Joi.object({
      categoryName: Joi.string().optional(),
      subCategoryName: Joi.string().optional(),
      productName: Joi.string().optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let categoryRes = await findCategory({
        categoryName: validatedBody.categoryName,
        status: { $ne: status.DELETE },
      });
      if (!categoryRes) {
        throw apiError.notFound(responseMessage.CATEGORY_NOT_FOUND);
      }

      let subCategoryRes = await findSubCategory({
        subCategoryName: validatedBody.subCategoryName,
        status: { $ne: status.DELETE },
      });
      if (!subCategoryRes) {
        throw apiError.conflict(responseMessage.SUBCATEGORY_NOT_FOUND);
      }

      let productRes = await findProduct({
        productName: validatedBody.productName,
        status: { $ne: status.DELETE },
      });
      if (!productRes) {
        throw apiError.conflict(responseMessage.PRODUCT_NOT_FOUND);
      }

      return res.json(new response(productRes, responseMessage.PRODUCT_FOUND));
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/serchProduct:
   *   get:
   *     summary: serch listed product
   *     tags:
   *       -  SEARCH PRODUCT
   *     description: serch List of all Product
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
   *       - name: location
   *         description: location
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async serchProduct(req, res, next) {
    const validationSchema = Joi.object({
      search: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
      location: Joi.string().allow("").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      let dataResults = await paginateSearchForProduct(validatedBody);
      
      if (!dataResults || dataResults.docs.length == 0) {
        return res.status(200).json(new response({
          docs: [],
          total: 0,
          pages: 0,
          page: validatedBody.page || 1,
          limit: validatedBody.limit || 10
        }, "لا يوجد بيانات"));
      }

      // Add wishlist information for each product if user is authenticated
      if (req.userId && dataResults.docs && dataResults.docs.length > 0) {
        try {
          // Get all wishlist items for current user once
          const userWishlist = await model_whishlist.find({
            userId: req.userId,
            status: "ACTIVE"
          }).populate('userId').populate('ownerId').populate('productId');
          
          // Create a map for faster lookup
          const wishlistMap = new Map();
          userWishlist.forEach(item => {
            wishlistMap.set(item.productId._id.toString(), item);
          });

          // Add wishlist information to each product
          const productsWithWishlist = dataResults.docs.map((product) => {
            const productObj = product.toObject ? product.toObject() : product;
            const wishlistResult = wishlistMap.get(productObj._id.toString());

            return {
              ...productObj,
              inWishlist: Boolean(wishlistResult),
              wishlistId: wishlistResult ? wishlistResult._id : null
            };
          });

          dataResults.docs = productsWithWishlist;
        } catch (error) {
          console.error('Error checking wishlist for products:', error);
          // If error occurs, return products without wishlist info
          const productsWithoutWishlist = dataResults.docs.map((product) => {
            const productObj = product.toObject ? product.toObject() : product;
            return {
              ...productObj,
              inWishlist: false,
              wishlistId: null
            };
          });
          dataResults.docs = productsWithoutWishlist;
        }
      } else {
        // No user authentication - add default wishlist info
        const productsWithoutWishlist = dataResults.docs.map((product) => {
          const productObj = product.toObject ? product.toObject() : product;
          return {
            ...productObj,
            inWishlist: false,
            wishlistId: null
          };
        });
        dataResults.docs = productsWithoutWishlist;
      }
      
      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/addRecentSearch:
   *   post:
   *     tags:
   *       - SEARCH PRODUCT
   *     description: addRecentSearch
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: serchText
   *         description: serchText
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async addRecentSearch(req, res, next) {
    const validationSchema = Joi.object({
      serchText: Joi.string().allow("").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      validatedBody.userId = req.userId;
      await createSearch(validatedBody);
      return res.json(new response({}, responseMessage.DATA_ADDED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/getRecentSearch:
   *   get:
   *     tags:
   *       - SEARCH PRODUCT
   *     description: getRecentSearch
   *     produces:
   *       - application/json
   *     security:
   *       - tokenauth: []
   *     responses:
   *       200:
   *         description: Returns success message
   *         schema:
   *           type: object
   *           properties:
   *             result:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   _id:
   *                     type: string
   *                   userId:
   *                     type: string
   *                   serchText:
   *                     type: string
   *                   createdAt:
   *                     type: string
   *                   updatedAt:
   *                     type: string
   */
  async getRecentSearch(req, res, next) {
    try {
      let searchData = await SearchList({ 
        userId: req.userId,
        status: { $ne: status.DELETE }
      });
      
      // Sort by most recent first
      searchData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Map to include only needed fields
      const formattedSearchData = searchData.map(item => ({
        _id: item._id,
        userId: item.userId,
        serchText: item.serchText,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));

      return res.json(new response(formattedSearchData, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/checkStatus:
   *   get:
   *     tags:
   *       - PRODUCT
   *     description: checkStatus
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: productId
   *         description: productId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async checkStatus(req, res, next) {
    var validationSchema = Joi.object({
      productId: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);

      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let obj = {};

      let productResult = await findProduct1({
        _id: validatedBody.productId,
        status: { $ne: status.DELETE },
      });
      if (!productResult) {
        throw apiError.notFound(responseMessage.PRODUCT_NOT_FOUND);
      }

      obj = JSON.parse(JSON.stringify(productResult));

      let wishlistResult = await findWishlist({
        userId: req.userId,
        productId: validatedBody.productId,
        status: { $ne: status.DELETE },
      });
      if (wishlistResult) {
        obj.isWishlist = true;
        obj.wishlistId = wishlistResult._id;
      } else {
        obj.isWishlist = false;
        obj.wishlistId = null;
      }
      return res.json(new response(obj, responseMessage.PRODUCT_FOUND));
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/sortingAndSearchingProduct:
   *   post:
   *     tags:
   *       - SORTING AND SEARCHING PRODUCT
   *     description: sortingAndSearchingProduct
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *       - name: priceStatus
   *         description: priceStatus
   *         in: query
   *         enum: [lowtohigh, hightolow]
   *         required: false
   *       - name: categoryName
   *         description: categoryName
   *         in: query
   *         required: false
   *       - name: subCategoryName
   *         description: subCategoryName
   *         in: query
   *         required: false
   *       - name: dateStatus
   *         description: dateStatus
   *         in: query
   *         enum: [newest, oldest]
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async sortingAndSearchingProduct(req, res, next) {
    const validationSchema = Joi.object({
      search: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
      priceStatus: Joi.string().allow("").optional(),
      categoryName: Joi.string().allow("").optional(),
      subCategoryName: Joi.string().allow("").optional(),
      dateStatus: Joi.string().allow("").optional(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      let {
        search,
        page,
        limit,
        priceStatus,
        categoryName,
        subCategoryName,
        dateStatus,
      } = validatedBody;
      let sort = "createdAt";
      let sortOrder = 1;
      const matchStage = {
        status: "ACTIVE",
        approveStatus: "APPROVED",
        paymentStatus: "APPROVED",
      };
      const sortStage = {
        [sort]: sortOrder,
      };
      const pipeline = [{ $match: matchStage }, { $sort: sortStage }];

      if (search) {
        pipeline.push({
          $match: {
            productName: {
              $regex: search ? `^${search}` : "",
              $options: "i",
            },
          },
        });
      }
      if (categoryName) {
        pipeline.push(
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
          {
            $unwind: {
              path: "$category",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $match: {
              "category.categoryName": {
                $regex: categoryName ? `^${categoryName}` : "",
                $options: "i",
              },
            },
          }
        );
      }

      if (subCategoryName) {
        pipeline.push(
          {
            $lookup: {
              from: "subcategories",
              localField: "subCategoryId",
              foreignField: "_id",
              as: "subcategory",
            },
          },
          {
            $unwind: {
              path: "$subcategory",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $match: {
              "subcategory.subCategoryName": {
                $regex: subCategoryName ? `^${subCategoryName}` : "",
                $options: "i",
              },
            },
          }
        );
      }

      let data = await Product.aggregate(pipeline);

      if (priceStatus == "lowtohigh") {
        data = data.sort((a, b) => a.price - b.price);
      }
      if (priceStatus == "hightolow") {
        data = data.sort((a, b) => b.price - a.price);
      }

      if (dateStatus == "newest") {
        data = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
      if (dateStatus == "oldest") {
        data = data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      }

      // Add wishlist information for each product
      if (req.userId && data && data.length > 0) {
        try {
          // Get all wishlist items for current user once
          const userWishlist = await model_whishlist.find({
            userId: req.userId,
            status: "ACTIVE"
          }).populate('userId').populate('ownerId').populate('productId');
          
          // Create a map for faster lookup
          const wishlistMap = new Map();
          userWishlist.forEach(item => {
            wishlistMap.set(item.productId._id.toString(), item);
          });

          // Add wishlist information to each product
          data = data.map((product) => {
            const wishlistResult = wishlistMap.get(product._id.toString());

            return {
              ...product,
              inWishlist: Boolean(wishlistResult),
              wishlistId: wishlistResult ? wishlistResult._id : null
            };
          });
        } catch (error) {
          console.error('Error checking wishlist for products:', error);
          // If error occurs, return products without wishlist info
          data = data.map((product) => ({
            ...product,
            inWishlist: false,
            wishlistId: null
          }));
        }
      } else {
        // No user authentication - add default wishlist info
        data = data.map((product) => ({
          ...product,
          inWishlist: false,
          wishlistId: null
        }));
      }

      let totalCount = data.length;

      // Calculate pagination values
      const currentPage = page ? parseInt(page) : 1;
      const perPage = limit ? parseInt(limit) : 10;
      const totalPages = Math.ceil(totalCount / perPage);
      const skip = (currentPage - 1) * perPage;

      // Apply pagination
      const paginatedData = data.slice(skip, skip + perPage);

      return res.json(
        new response(
          {
            data: paginatedData,
            currentPage: currentPage,
            perPage: perPage,
            totalPages: totalPages,
            totalCount: totalCount,
          },
          responseMessage.DATA_FOUND
        )
      );
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /product/deleteRecentSearch:
   *   delete:
   *     tags:
   *       - SEARCH PRODUCT
   *     description: حذف سجل البحث الحديث
   *     produces:
   *       - application/json
   *     security:
   *       - tokenauth: []
   *     parameters:
   *       - name: searchId
   *         description: معرف سجل البحث للحذف (اختياري)
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: تم حذف سجل البحث بنجاح
   *       404:
   *         description: سجل البحث غير موجود
   */
  async deleteRecentSearch(req, res, next) {
    const validationSchema = Joi.object({
      searchId: Joi.string().optional()
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      
      if (validatedBody.searchId) {
        // حذف سجل بحث محدد
        const searchRecord = await findSearch({
          _id: validatedBody.searchId,
          userId: req.userId,
          status: { $ne: status.DELETE }
        });

        if (!searchRecord) {
          throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
        }

        await updateSearch(
          { _id: searchRecord._id },
          { status: status.DELETE }
        );

        return res.json(new response({}, "تم حذف سجل البحث بنجاح"));
      } else {
        // حذف كل سجلات البحث للمستخدم
        await updateSearch(
          { userId: req.userId, status: { $ne: status.DELETE } },
          { status: status.DELETE }
        );

        return res.json(new response({}, "تم حذف جميع سجلات البحث بنجاح"));
      }
    } catch (error) {
      return next(error);
    }
  }
}
export default new productController();
