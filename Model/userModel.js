const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
  },
  amount: {
    type: Number,
    default: 0,
  },
  donated: {
    type: Boolean,
    default: false,
  },
  extraWeeks: {
    type: Number,
    default: 0,
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
