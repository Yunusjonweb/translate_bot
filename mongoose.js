const mongoose = require("mongoose");
const { MONGO_URL } = require("./config");

// import models ...

require("./src/Model/users");

module.exports = async function () {
  try {
    await mongoose.connect(MONGO_URL);
  } catch (err) {
    console.log("Mongoose connection error: " + err);
  }
};
