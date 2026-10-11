const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { updateReview, deleteReview } = require("../controllers/reviewController");

router.route("/:id").put(protect, updateReview).delete(protect, deleteReview);

module.exports = router;