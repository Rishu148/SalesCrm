const router = require("express").Router();
const {
  getDeals,
  createDeal,
  updateStage,
} = require("../controllers/dealController");


router.get("/", getDeals);
router.post("/", createDeal);
router.put("/:id", updateStage);

module.exports = router;
