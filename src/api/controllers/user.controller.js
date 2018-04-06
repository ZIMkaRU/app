'use strict';

const UserService = require('../services/user.service');
const { logger } = require('../../services/log.service');
const {
  responses,
  ROLE_CONST,
  coreHelpers
} = require('../../services/helpers');
const { success, failureError, failureAccessDenied, failure } = responses;

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const createUser = async (req, res) => {
  const userData = req.swagger.params.user.value;

  // Prohibits the creation of an ADMIN
  // if (userData.role == ROLE_CONST.ADMIN) {
  //     failure(403, 'Creating a admin is prohibited', res);
  // }

  try {
    let result = await UserService.createUser(userData);
    success(200, result, res);
  } catch (err) {
    failureError(500, err, res);
  }
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const getUser = async (req, res) => {
  const userId = req.swagger.params.userId.value;

  if (req.user.role === ROLE_CONST.USER && req.user._id != userId) {
    return failureAccessDenied(res);
  }

  try {
    let result = await UserService.getUser(userId);

    if (
      result.role === ROLE_CONST.ADMIN &&
      req.user.role !== ROLE_CONST.ADMIN
    ) {
      return failureAccessDenied(res);
    }
    if (
      result.role === ROLE_CONST.MANAGER &&
      req.user.role === ROLE_CONST.MANAGER &&
      req.user._id != userId
    ) {
      return failureAccessDenied(res);
    }

    success(200, result, res);
  } catch (err) {
    failureError(500, err, res);
  }
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const getUsers = async (req, res) => {
  const offset = req.swagger.params.offset.value;
  const limit = req.swagger.params.limit.value;
  const sort = req.swagger.params.sort.value.join(' ');
  const filterReq = req.swagger.params.filter.value;
  const filter = coreHelpers.parseFilter(filterReq);

  try {
    let result = await UserService.getUsers(
      req.user.role,
      offset,
      limit,
      sort,
      filter
    );
    success(200, result, res);
  } catch (err) {
    failureError(500, err, res);
  }
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const updateUser = async (req, res) => {
  const userId = req.swagger.params.userId.value;
  const userData = req.swagger.params.user.value;

  if (req.user.role === ROLE_CONST.USER && req.user._id != userId) {
    return failureAccessDenied(res);
  }

  try {
    let result = await UserService.getUser(userId);
    if (
      result.role === ROLE_CONST.ADMIN &&
      req.user.role !== ROLE_CONST.ADMIN
    ) {
      return failureAccessDenied(res);
    }
    if (
      result.role === ROLE_CONST.MANAGER &&
      req.user.role === ROLE_CONST.MANAGER &&
      req.user._id != userId
    ) {
      return failureAccessDenied(res);
    }
    if (req.user._id == userId) delete userData.role;
    if (req.user.role === ROLE_CONST.USER) delete userData.idNanogrid;

    result = await UserService.updateUser(userId, userData);
    success(200, result, res);
  } catch (err) {
    failureError(500, err, res);
  }
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const deleteUser = async (req, res) => {
  const userId = req.swagger.params.userId.value;

  if (req.user._id == userId) return failureAccessDenied(res);

  try {
    let result = await UserService.deleteUser(userId);
    success(200, result, res);
  } catch (err) {
    failureError(500, err, res);
  }
};

module.exports = {
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
};
