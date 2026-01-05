const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    price: String,
    stage: String,
    tag: String,
    color: String,
    action: String,
    icon: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deal", dealSchema);
