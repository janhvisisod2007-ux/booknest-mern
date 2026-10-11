const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createBook, getBooks, getBookById, updateBook, deleteBook,
} = require("../controllers/bookController");
const { addReview, getReviews } = require("../controllers/reviewController");

router.route("/").get(getBooks).post(protect, createBook);
router.route("/:id").get(getBookById).put(protect, updateBook).delete(protect, deleteBook);
router.route("/:id/reviews").get(getReviews).post(protect, addReview);

module.exports = router;