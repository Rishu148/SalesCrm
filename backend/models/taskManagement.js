const mongoose = require("mongoose");

const taskManagementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    relatedTo: {
      name: String,
      company: String,
    },

    dueDate: Date,

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },

    owner: {
      type: String,
      default: "Alex Morgan",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskManagement", taskManagementSchema);
