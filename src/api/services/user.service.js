'use strict';

const User = require('../models/user.model');
const { logger } = require('../../services/log.service');
const {
  ROLE_CONST,
  coreHelpers,
  ALLOWED_FIELDS
} = require('../../services/helpers');
const { filterObjectToCriteria, createFilterQuery } = coreHelpers;

/**
 *
 * @param {Object} userData
 * @returns {Promise<User>}
 */
const createUser = async userData => {
  delete userData.passwordHash;
  delete userData.salt;
  const user = new User(userData);

  try {
    let result = await user.save();
    return Promise.resolve(
      filterObjectToCriteria(result, ALLOWED_FIELDS.ALLOWED_USER_FIELDS)
    );
  } catch (err) {
    logger.debug('Error creating user');
    logger.debug('Found %s at %s', 'error', err);
    throw err;
  }
};

/**
 *
 * @param {string} userId
 * @returns {Promise<User>}
 */
const getUser = async userId => {
  try {
    return await User.findById(
      userId,
      ALLOWED_FIELDS.ALLOWED_USER_FIELDS
    ).exec();
  } catch (err) {
    logger.debug('Error findById user');
    logger.debug('Found %s at %s', 'error', err);
    throw err;
  }
};

/**
 *
 * @param {string} username
 * @returns {Promise<User>}
 */
const getUserByUsername = async username => {
  try {
    return await User.findOne({ username }).exec();
  } catch (err) {
    logger.debug('Error findOne User by username');
    logger.debug('Found %s at %s', 'error', err);
    throw err;
  }
};

/**
 *
 * @param {string} role
 * @param {integer} offset
 * @param {integer} limit
 * @param {Object} sort
 * @param {Object} filter
 * @returns {Promise<[User]>}
 */
const getUsers = async (
  role,
  offset = 0,
  limit = 10,
  sort = 'username',
  _filter = {
    role: [ROLE_CONST.USER]
  }
) => {
  let filter = { ..._filter };
  if (role !== ROLE_CONST.ADMIN) {
    filter.role = [ROLE_CONST.USER];
  }

  try {
    const query = createFilterQuery(filter);
    let result = await User.find(query, ALLOWED_FIELDS.ALLOWED_USER_FIELDS)
      .skip(offset)
      .limit(limit)
      .sort(sort)
      .exec();
    let count = await User.count(query).exec();
    return Promise.resolve({
      users: result,
      count,
      page: Math.ceil(offset / limit) + 1,
      pages: Math.ceil(count / limit)
    });
  } catch (err) {
    logger.debug('Error find users');
    logger.debug('Found %s at %s', 'error', err);
    throw err;
  }
};

/**
 *
 * @param {string} userId
 * @param {Object} userData
 * @returns {Promise<User>}
 */
const updateUser = async (userId, userData) => {
  delete userData.passwordHash;
  delete userData.salt;
  delete userData._id;
  delete userData.createdAt;
  delete userData.updatedAt;

  try {
    let result = await User.findById(userId).exec();
    Object.assign(result, userData);
    if (
      result.role === ROLE_CONST.MANAGER ||
      result.role === ROLE_CONST.ADMIN
    ) {
      result.idNanogrid = null;
    }

    result = await result.save();
    return Promise.resolve(
      filterObjectToCriteria(result, ALLOWED_FIELDS.ALLOWED_USER_FIELDS)
    );
  } catch (err) {
    logger.debug('Error findById or save user');
    logger.debug('Found %s at %s', 'error', err);
    throw err;
  }
};

/**
 *
 * @param {string} userId
 * @returns {Promise<string>}
 */
const deleteUser = async userId => {
  try {
    let result = await User.findByIdAndRemove(userId).exec();
    return Promise.resolve(result._id);
  } catch (err) {
    logger.debug('Error remove user');
    logger.debug('Found %s at %s', 'error', err);
    throw err;
  }
};

/**
 *
 * @param {object} usersData
 * @returns {Promise}
 */
const deleteUsers = async (usersData = {}) => {
  try {
    let result = await User.remove({ ...usersData }).exec();
    return Promise.resolve(result);
  } catch (err) {
    logger.debug('Error remove users');
    logger.debug('Found %s at %s', 'error', err);
    throw err;
  }
};

module.exports = {
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  deleteUsers,
  getUserByUsername,
};
