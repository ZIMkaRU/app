"use strict";

/**
 *
 * @param {Object} object
 * @param {string} criteria
 * @returns {Object}
 */
const filterObjectToCriteria = function(object, criteria) {
  const result = {};

  criteria.split(' ').forEach(item => {
    item = item.trim();

    if (object[item]) result[item] = object[item];
  });

  return result;
};

/**
 *
 * @param {Object} object
 * @param {string} criteria
 * @returns {Object}
 */
const filterObjectToCriteriaExcluding = function(object, criteria) {
  const result = {};

  for (let key in object) {
    if (!object.hasOwnProperty(key)) continue;
    if (
      criteria.split(' ').every(item => (
        item.trim().replace(/^-/, '') !== key
      ))
    ) {
      result[key] = object[key];
    }
  }

  return result;
};

/**
 *
 * @param {Array} filterReq
 * @returns {Object|undefined}
 */
const parseFilter = function(filterReq) {
  let filter = {};

  if (filterReq) {
    let _isEmptyFilter = true;

    filterReq.forEach(element => {
      const _arr = element.match(/^([^:]*)[:](.*)$/);

      if (_arr && Array.isArray(_arr) && _arr[1] && _arr[2]) {
        if (!filter[_arr[1]] || !Array.isArray(filter[_arr[1]])) {
          filter[_arr[1]] = [];
        }

        filter[_arr[1]].push(_arr[2]);
        _isEmptyFilter = false;
      }
    });

    if (_isEmptyFilter) filter = undefined;
  } else filter = undefined;

  return filter;
};

/**
 *
 * @param {Object} filter
 * @returns {Object|TypeError}
 */
const createFilterQuery = function(filter) {
  let query = {};

  if (filter && typeof filter === 'object' && !Array.isArray(filter)) {
    for (let key in filter) {
      if (!filter.hasOwnProperty(key)) continue;
      if (!query.$and && !Array.isArray(query.$and)) query.$and = [];

      const _objFor$and = {};

      if (
        filter[key]
        && Array.isArray(filter[key])
        && filter[key].length > 0
      ) {
        filter[key].forEach(item => {
          const _objFor$or = {};

          if (/.+Gte$/.test(key) || /.+Lte$/.test(key)) {
            if (Number.isNaN(Date.parse(item))) {
              throw new TypeError('Invalid Date');
            }

            _objFor$and.createdAt = {};
            _objFor$and.createdAt[
              /.+Gte$/.test(key) ? '$gte' : '$lte'
            ] = new Date(item);
          } else {
            if (!_objFor$and.$or && !Array.isArray(_objFor$and.$or)) {
              _objFor$and.$or = [];
            }

            _objFor$or[key] = item;
            _objFor$and.$or.push(_objFor$or);
          }
        });

        query.$and.push(_objFor$and);
      } else if (
        filter[key] &&
        typeof filter[key] !== 'object' &&
        !Array.isArray(filter[key])
      ) {
        const _objFor$or = {};

        if (/.+Gte$/.test(key) || /.+Lte$/.test(key)) {
          if (Number.isNaN(Date.parse(filter[key]))) {
            throw new TypeError('Invalid Date');
          }

          _objFor$and.createdAt = {};
          _objFor$and.createdAt[
            /.+Gte$/.test(key) ? '$gte' : '$lte'
          ] = new Date(filter[key]);
        } else {
          if (!_objFor$and.$or && !Array.isArray(_objFor$and.$or)) {
            _objFor$and.$or = [];
          }

          _objFor$or[key] = filter[key];
          _objFor$and.$or.push(_objFor$or);
        }
      } else if (query.$and.length === 0) {
        delete query.$and;
      }
    }
  }

  return query;
};

module.exports = {
  filterObjectToCriteria,
  filterObjectToCriteriaExcluding,
  parseFilter,
  createFilterQuery,
};
