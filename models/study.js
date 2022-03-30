const mongoose = require("mongoose");

const studySchema = new mongoose.Schema({
  headCount: {
    type: String,
  },
  language: {
    type: Array,
    default: [],
  },
  member_id: {
    type: Array,
    default: [],
  },
  url: {
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
});

module.exports = mongoose.model("study", studySchema);
