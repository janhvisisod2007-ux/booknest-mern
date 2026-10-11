const mongoose = require("mongoose");
const Book = require("../models/Book");
const Review = require("../models/Review");

// POST /api/books/:id/reviews  (protected)
exports.addReview = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { rating, comment } = req.body;

    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: "Rating must be a whole number from 1 to 5" });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const review = await Review.create({
      book: bookId,
      user: req.user._id,
      rating: r,
      comment,
    });
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this book" });
    }
    res.status(500).json({ message: err.message });
  }
};

// GET /api/books/:id/reviews  (public)
exports.getReviews = async (req, res) => {
  try {
    const bookId = req.params.id;
    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }
    const reviews = await Review.find({ book: bookId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/reviews/:id  (protected, owner only)
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own review" });
    }

    const { rating, comment } = req.body;
    if (rating !== undefined) {
      const r = Number(rating);
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return res.status(400).json({ message: "Rating must be a whole number from 1 to 5" });
      }
      review.rating = r;
    }
    if (comment !== undefined) review.comment = comment;

    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/reviews/:id  (protected, owner only)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own review" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};