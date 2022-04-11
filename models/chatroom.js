const mongoose = require("mongoose");

const chatroomSchema = mongoose.Schema(
  {
    type: {
      type: String,
      require: true,
    },
    title: {
      type: String,
      require: true,
    },
    projectId: {
      type: String,
      require: true,
    },
    members: {
      type: Array,
      default: [],
    },
    chat: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("chatroom", chatroomSchema);
