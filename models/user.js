const mongoose = require('mongoose');
const { createHmac } = require('node:crypto');
const { v4: uuidv4 } = require('uuid');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    lastname: {
      type: String,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    userinfo: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    salt: String,
    role: {
      type: Number,
      default: 0,
    },
    purchases: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

userSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = uuidv4();
    this.passwordHash = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (plainpassword) {
    return this.encryptPassword(plainpassword) === this.passwordHash;
  },

  encryptPassword: function (plainpassword) {
    if (!plainpassword) return '';
    try {
      return createHmac('sha256', this.salt)
        .update(plainpassword)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },
};

module.exports = mongoose.model('User', userSchema);
