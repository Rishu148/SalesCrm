const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    company: { type: String },
    source: { type: String, default: "Manual" },
    status: {
      type: String,
      enum: ["New", "Contacted", "Interested", "Closed", "Lost"],
      default: "New",
    },
    
    // 👇 UPDATE: 'required: true' hata diya. Ab ye field khali (null) ho sakti hai.
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);