const mongoose = require("mongoose");

const studySchema = new mongoose.Schema(
  {
    headCount: {
      type: String,
    },
    language: {
      type: String,
    },
    member_id: {
      type: Array,
      default: [],
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
    area: {
      type: String,
    },
    success: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("study", studySchema);
