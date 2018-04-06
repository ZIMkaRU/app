'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');
const beautifyUnique = require('../../services/util/mongoose-beautiful-unique-validation'); //TODO:
// const beautifyUnique = require('mongoose-beautiful-unique-validation');//TODO:
const connection = require('../../databases').appMongodb.connection;
const validator = require('validator');
const validate = require('mongoose-validator');
const { ROLE_CONST } = require('../../services/helpers');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    role: {
      type: String,
      required: 'Field is required',
      enum: [ROLE_CONST.ADMIN, ROLE_CONST.MANAGER, ROLE_CONST.USER]
    },
    username: {
      type: String,
      required: 'Field is required',
      unique: true,
      trim: true
    },
    passwordHash: String,
    salt: String,
    email: {
      type: String,
      required: 'Field is required',
      validate: [
        validate({
          validator: 'isEmail',
          message: 'Field should contain email'
        })
      ],
      trim: true
    },
    firstName: {
      type: String,
      required: 'Field is required',
      trim: true
    },
    lastName: {
      type: String,
      required: 'Field is required',
      trim: true
    },
    homeownerCellNumber: String,
    homeownerLandLine: String,
    idNanogrid: {
      type: Number,
      default: null,
      index: {
        unique: true,
        partialFilterExpression: {
          idNanogrid: {
            $type: 'number'
          }
        }
      }
    }
  },
  {
    timestamps: true,
    usePushEach: true
  }
);

userSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    if (password) {
      this.salt = crypto.randomBytes(128).toString('base64');
      this.passwordHash = crypto
        .pbkdf2Sync(password, this.salt, 1, 128, 'sha1')
        .toString('base64');
    } else {
      this.salt = undefined;
      this.passwordHash = undefined;
    }
  })
  .get(function() {
    return this._password;
  });

userSchema
  .virtual('passwordConfirmation')
  .get(function() {
    return this._passwordConfirmation;
  })
  .set(function(value) {
    this._passwordConfirmation = value;
  });

userSchema.methods.checkPassword = function(password) {
  if (!password) return false;
  if (!this.passwordHash) return false;
  return (
    crypto
      .pbkdf2Sync(password, this.salt, 1, 128, 'sha1')
      .toString('base64') === this.passwordHash
  );
};

userSchema.path('passwordHash').validate(function(v) {
  if (this.isNew && !this._password) {
    this.invalidate('password', 'Field is required');
  }
  if (this._password || this._passwordConfirmation) {
    if (
      !validator.isLength(this._password, {
        min: 6
      })
    ) {
      this.invalidate('password', 'Must be at least 6 characters.');
    }
    if (this._password !== this._passwordConfirmation) {
      this.invalidate('passwordConfirmation', 'Must match confirmation.');
    }
  }
}, null);

userSchema.path('idNanogrid').validate(function(v) {
  if (this.role === ROLE_CONST.user) {
    if (!v) this.invalidate('idNanogrid', 'Field is required');
    if (!Number.isInteger(v))
      this.invalidate('idNanogrid', 'Field must be integer');
  }
  if (
    (this.role === ROLE_CONST.manager || this.role === ROLE_CONST.admin) &&
    v !== null
  ) {
    this.invalidate('idNanogrid', 'Field must be null');
  }
}, null);

userSchema.pre('findOneAndUpdate', function(done) {
  if (
    this._update.role &&
    (this._update.role === ROLE_CONST.manager ||
      this._update.role === ROLE_CONST.admin)
  ) {
    this._update.idNanogrid = null;
  }
  done();
});

userSchema.pre('save', function(done) {
  if (
    this.role &&
    (this.role === ROLE_CONST.manager || this.role === ROLE_CONST.admin)
  ) {
    this.idNanogrid = null;
  }
  done();
});

userSchema.plugin(beautifyUnique);
const userModel = connection.model('User', userSchema);
userModel.ensureIndexes();

module.exports = userModel;
