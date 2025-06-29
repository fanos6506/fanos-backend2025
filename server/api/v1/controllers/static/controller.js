import Joi from "joi";
import * as _ from 'lodash';
import config from "config";
import apiError from "../../../../helper/apiError.js";
import response from "../../../../../assets/response.js";
import responseMessage from "../../../../../assets/responseMessage.js";
import axios from "axios";
import userType from "../../../../enums/userType.js";
import  staticServices  from "../../services/static.js";
const {
  createStaticContent,
  findStaticContent,
  updateStaticContent,
  staticContentList,
  deleteStaticContent,
} = staticServices;

import status from "../../../../enums/status.js";

import  userServices  from "../../services/user.js";
const { findUser } = userServices;

export class staticController {
  /**
   * @swagger
   * /static/addStaticContent:
   *   post:
   *     summary: addStaticContent
   *     tags:
   *       - STATIC
   *     description: addStaticContent
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: addStaticContent
   *         description: addStaticContent
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/addStaticContent'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async addStaticContent(req, res, next) {
    var validationSchema = Joi.object({
      type: Joi.string().required(),
      title: Joi.string().required(),
      description: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { type, title, description } = validatedBody;
      var result = await createStaticContent({
        type: type,
        title: title,
        description: description,
      });
      return res.json(new response(result, responseMessage.DATA_SAVED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /static/viewStaticContent/{type}:
   *   get:
   *     summary: viewStaticContent
   *     tags:
   *       - STATIC
   *     description: viewStaticContent
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: type
   *         description: type
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewStaticContent(req, res, next) {
    var validationSchema = Joi.object({
      type: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.params);
      var result = await findStaticContent({ type: validatedBody.type });
      if (!result) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /static/editStaticContent:
   *   put:
   *     summary: editStaticContent
   *     tags:
   *       - STATIC
   *     description: editStaticContent
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: editStaticContent
   *         description: editStaticContent
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/editStaticContent'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async editStaticContent(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
      type: Joi.string().required(),
      title: Joi.string().optional(),
      description: Joi.string().optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let staticRes = await findStaticContent({ _id: req.body._id });
      if (!staticRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      var result = await updateStaticContent(
        { _id: validatedBody._id },
        validatedBody
      );
      return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /static/staticContentList:
   *   get:
   *     summary: staticContentList
   *     tags:
   *       - STATIC
   *     description: staticContentList
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async staticContentList(req, res, next) {
    try {
      var result = await staticContentList({ status: { $ne: status.DELETE } });
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /static/deletestaticContent:
   *   delete:
   *     summary: deletestaticContent
   *     tags:
   *       - STATIC
   *     description: deletestaticContent
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
  async deletestaticContent(req, res, next) {
    var validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      const result = await deleteStaticContent({ _id: validatedBody._id });
      if (!result) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);

      return res.json(new response({}, responseMessage.DELETED_SUCCESSFULLY));
    } catch (error) {
      return next(error);
    }
  }
}

export default new staticController();
