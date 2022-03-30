const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  isAdmin: {
    type: Boolean,
    default: false,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 40,
  },

  password: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 30,
  },

  address: {
    type: String,
    required: true,
  },

  developer: {
    type: String,
    required: true,
  },

  grade: {
    type: Array,
    default: [],
  },

  evaluation: {
    type: Array,
    default: [],
  },

  warning: {
    type: Number,
    default: 0,
  },

  mystudy: {
    type: Array,
    default: [],
  },
  token: {
    type: String,
  },
});

module.exports = mongoose.model("users", userSchema);
