import Joi from "joi";
import * as _ from 'lodash';
import config from "config";
import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import responseMessage from "../../../../../assets/responseMessage.js";
import commonFunction from "../../../../helper/util.js";
import status from "../../../../enums/status.js";
import userType from "../../../../enums/userType.js";

import  userServices  from "../../services/user.js";
const { findUser, updateUser } = userServices;

import  bannersServices  from "../../services/banner.js";
const {
  bannersFind,
  bannersCreate,
  bannersData,
  bannersList,
  bannersUpdate,
  bultiUpdateBanners,
  deleteBanners,
} = bannersServices;

export class bannerController {
  /**
   * @swagger
   * /banner/addBanner:
   *   post:
   *     summary:  Add banner
   *     tags:
   *       - BANNER 2.0
   *     description: addBanner
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: admin token
   *         in: header
   *         required: true
   *       - name: img
   *         description: img
   *         in: formData
   *         type: file
   *         required: false
   *         schema:
   *           $ref: '#/definitions/addBanner'
   *     responses:
   *       200:
   *         description: User addBanner successfully
   */
  async addbanner(req, res, next) {
    const validationSchema = Joi.object({
      img: Joi.string().optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let adminResult = await findUser({
        _id: req.userId,
        userType: { $in: userType.ADMIN },
      });
      if (!adminResult)
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);

      if (req.files) {
        let imgUrl = await commonFunction.getImageUrl(req.files[0].path);
        validatedBody.img = imgUrl.secure_url;
        await bannersCreate(validatedBody);
      }
      return res.json(
        new response(validatedBody, responseMessage.BANNER_ADDED)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /banner/get-all-banners:
   *   get:
   *     summary:  Get all banners
   *     tags:
   *       - BANNER 2.0
   *     description: Get all banners.
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getAllBanners(req, res, next) {
    try {
      var result = await bannersFind({ status: { $ne: status.BLOCK } });
      result = JSON.parse(JSON.stringify(result));
      return res.json(new response(result, responseMessage.GET_BANNERS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /banner/get-all-banners-for-admin:
   *   get:
   *     summary:  Get all banners
   *     tags:
   *       - BANNER 2.0
   *     description: Get all banners.
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getAllBannersForAdmin(req, res, next) {
    try {
      var result = await bannersFind();
      result = JSON.parse(JSON.stringify(result));
      return res.json(new response(result, responseMessage.GET_BANNERS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /banner/getBanner:
   *   get:
   *     summary:  Get banner
   *     tags:
   *       - BANNER 2.0
   *     description: getBanner
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: _id
   *         in: query
   *         required: true
   *         schema:
   *           $ref: '#/definitions/getBanner'
   *     responses:
   *       200:
   *         description: GetBanner successfully
   */
  async getBanner(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);

      const bannerInfo = await bannersData({
        _id: validatedBody._id,
        status: { $ne: status.BLOCK },
      });
      if (!bannerInfo) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

      return res.json(new response(bannerInfo, responseMessage.GET_BANNERS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /banner/editBanner:
   *   put:
   *     summary: edit banner
   *     tags:
   *       - BANNER 2.0
   *     description: editBanner
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: admin token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: banner id
   *         in: formData
   *         required: true
   *       - name: img
   *         description: img
   *         in: formData
   *         type: file
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async editBanner(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
      img: Joi.string().optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let adminResult = await findUser({
        _id: req.userId,
        userType: { $in: userType.ADMIN },
      });
      if (!adminResult)
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);

      let findBanner = await bannersData({
        _id: validatedBody._id,
        status: { $ne: status.BLOCK },
      });
      if (!findBanner) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

      if (req.files) {
        let imgUrl = await commonFunction.getImageUrl(req.files[0].path);
        validatedBody.img = imgUrl.secure_url;
      }
      let updateBanner = await bannersUpdate(
        { _id: findBanner._id },
        validatedBody
      );
      return res.json(
        new response(updateBanner, responseMessage.BANNER_UPDATED)
      );
    } catch (error) {
      console.log(error, 189);
      return next(error);
    }
  }

  /**
   * @swagger
   * /banner/blockAndUnblockBanner:
   *   put:
   *     summary: Block banner
   *     tags:
   *       - BANNER 2.0
   *     description: Block banner
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: admin token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: banner id
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async blockAndUnblockBanner(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      let adminResult = await findUser({
        _id: req.userId,
        userType: { $in: userType.ADMIN },
      });
      if (!adminResult)
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);

      let findBanner = await bannersData({ _id: validatedBody._id });
      if (!findBanner) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

      if (findBanner.status == status.ACTIVE) {
        let blockRes = await bannersUpdate(
          { _id: findBanner._id },
          { status: status.BLOCK }
        );
        return res.json(new response(blockRes, responseMessage.BLOCK_BY_ADMIN));
      } else {
        let activeRes = await bannersUpdate(
          { _id: findBanner._id },
          { status: status.ACTIVE }
        );
        return res.json(
          new response(activeRes, responseMessage.UNBLOCK_BY_ADMIN)
        );
      }
    } catch (error) {
      console.log(error, 234);
      return next(error);
    }
  }

  /**
   * @swagger
   * /banner/deleteBanner:
   *   delete:
   *     summary: Block banner
   *     tags:
   *       - BANNER 2.0
   *     description: Delete banner
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: admin token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: banner id
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
  async deleteBanner(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);

      let adminResult = await findUser({
        _id: req.userId,
        userType: { $in: userType.ADMIN },
      });
      if (!adminResult)
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);

      let findBanner = await bannersData({ _id: validatedBody._id });
      if (!findBanner) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

      await deleteBanners({ _id: findBanner._id });
      return res.json(new response({}, responseMessage.DELETED_SUCCESSFULLY));
    } catch (error) {
      console.log(error, 234);
      return next(error);
    }
  }
}
export default new bannerController();
