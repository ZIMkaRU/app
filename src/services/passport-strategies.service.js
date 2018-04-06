'use strict';

const config = require('config');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserService = require('../api/services/user.service');
const { logger } = require('./log.service');

const enableSession = config.get('app.session.enable');

const initPassportStrategies = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
        session: enableSession
      },
      async (username, password, done) => {
        try {
          const user = await UserService.getUserByUsername(username);

          if (!user || !user.checkPassword(password)) {
            done(null, false, {
              message: 'No such username or password is incorrect'
            });
          } else done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );

  passport.serializeUser(async (user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserService.getUser(id);

      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  return passport;
};

module.exports = {
  initPassportStrategies,
  passport,
};
