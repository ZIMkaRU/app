'use strict';

const jwt = require('jsonwebtoken');
const config = require('config');
const UserService = require('../api/services/user.service');
const { responses } = require('./helpers');
const { failureUnauthorized, failureAccessDenied } = responses;
const { logger } = require('./log.service');

const sharedSecret = config.get('app.jwt.sharedSecret');
const issuer = config.get('app.jwt.issuer');

const verifyToken = function(req, authOrSecDef, token, callback) {
  // these are the scopes/roles defined for the current endpoint
  const currentScopes = req.swagger.operation['x-security-scopes'];

  const checkJWT = tokenString => {
    jwt.verify(
      tokenString,
      sharedSecret,
      async (verificationError, decodedToken) => {
        // check if the JWT was verified correctly
        if (
          verificationError === null &&
          Array.isArray(currentScopes) &&
          decodedToken &&
          decodedToken.role &&
          decodedToken.issuer &&
          decodedToken.id
        ) {
          const roleMatch = currentScopes.indexOf(decodedToken.role) !== -1;
          const issuerMatch = decodedToken.issuer === issuer;

          if (roleMatch && issuerMatch) {
            req.auth = decodedToken;

            try {
              const user = await UserService.getUser(decodedToken.id);

              logger.debug('authService, User:', { ...user.toObject() });
              req.user = user;

              return callback(null);
            } catch (err) {
              return callback(failureAccessDenied(req.res));
            }
          } else {
            logger.debug(
              'authService, Access Denied, false === (roleMatch && issuerMatch)'
            );
            return callback(failureAccessDenied(req.res));
          }
        } else {
          logger.debug('authService, Access Denied');
          return callback(failureAccessDenied(req.res));
        }
      }
    );
  };

  if (req.session && req.session.token) {
    const tokenString = req.session.token;

    checkJWT(tokenString);
  } else if (token && token.indexOf('Bearer ') === 0) {
    const tokenString = token.split(' ')[1];

    checkJWT(tokenString);
  } else {
    logger.debug('authService, Unauthorized');

    return callback(failureUnauthorized(req.res));
    // return callback(req.res.redirect("/"));
    // return callback(failureAccessDenied(req.res));
  }
};

const issueToken = function(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      issuer,
      role: user.role
    },
    sharedSecret
  );
};

module.exports = {
  verifyToken,
  issueToken
};
