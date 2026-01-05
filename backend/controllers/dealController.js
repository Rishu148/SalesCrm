const Deal = require("../models/Deal");

exports.getDeals = async (req, res) => {
  const deals = await Deal.find();
  res.json(deals);
};

exports.createDeal = async (req, res) => {
  const deal = await Deal.create(req.body);
  res.status(201).json(deal);
};

exports.updateStage = async (req, res) => {
  const { stage } = req.body;
  const deal = await Deal.findByIdAndUpdate(
    req.params.id,
    { stage },
    { new: true }
  );
  res.json(deal);
};
