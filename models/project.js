const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    headCount: {
      type: Number,
    },
    language: {
      type: String,
    },
    area: {
      type: String,
    },
    desc: {
      type: String,
    },
    member_id: {
      type: Array,
      default: [],
    },
    url: {
      type: String,
      default: "",
    },
    deadline: {
      type: String,
    },
    meet: {
      type: String,
    },
    master: {
      type: String,
    },
    title: {
      type: String,
    },
    success: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("project", projectSchema);
