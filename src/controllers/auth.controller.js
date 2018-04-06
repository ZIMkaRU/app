'use strict';

const {
  authService,
  passportStrategiesService,
  helpers
} = require('../services');
const passport = passportStrategiesService.passport;
const { responses, coreHelpers, ALLOWED_FIELDS } = helpers;
const { success, failureUnauthorized } = responses;

const login = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return success(401, info, res);
      // return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      const token = authService.issueToken(req.user);
      req.session.token = token;
      return success(
        200,
        Object.assign(
          coreHelpers.filterObjectToCriteria(
            req.user,
            ALLOWED_FIELDS.ALLOWED_USER_FIELDS
          ),
          {
            token
          }
        ),
        res
      );
    });
  })(req, res, next);
};

const logout = function(req, res) {
  res.clearCookie('token');
  req.session.destroy(function(err) {
    req.logout();
    res.redirect('/');
  });
  // req.logout();
  req.session = null;
  // res.redirect('/');
};

const getUserSession = function(req, res) {
  if (!req.user) return failureUnauthorized(res);
  success(
    200,
    Object.assign(
      coreHelpers.filterObjectToCriteria(
        req.user,
        ALLOWED_FIELDS.ALLOWED_USER_FIELDS
      ),
      {
        token: req.session.token ? req.session.token : ''
      }
    ),
    res
  );
};

module.exports = {
  login,
  logout,
  getUserSession,
};
