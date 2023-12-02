const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  step: {
    type: String,
    default: 0,
  },
  from: String,
  to: String,
});
const users = mongoose.model("users", UserSchema);
module.exports = users;
