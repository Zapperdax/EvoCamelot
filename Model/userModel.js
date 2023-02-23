const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  registeredUsers: [
    {
      name: {
        type: String,
      },
      donated: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
