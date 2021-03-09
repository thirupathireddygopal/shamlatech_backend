const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true
    },
    lastName: {
      type: String,
      trim: true,
      required: true
    },
    countryCode: {
      type: Number,
      required: true
    },
    phoneNumber: {
      type: Number,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      trim: true,
      required: true
    },
    hash: {
      type: String,
      trim: true,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin