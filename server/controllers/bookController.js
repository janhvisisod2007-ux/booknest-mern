const mongoose = require("mongoose");
const Book = require("../models/Book");
const Review = require("../models/Review");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /api/books  (protected)
exports.createBook = async (req, res) => {
  try {
    const { title, author, description, genre, coverImage } = req.body;
    if (!title || !author) {
      return res.status(400).json({ message: "Title and author are required" });
    }
    const book = await Book.create({
      title, author, description, genre, coverImage,
      addedBy: req.user._id,
    });
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/books?search=&genre=&page=&limit=  (public)
exports.getBooks = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const filter = {};
    if (req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), "i");
      filter.$or = [{ title: regex }, { author: regex }];
    }
    if (req.query.genre) filter.genre = req.query.genre;

    const total = await Book.countDocuments(filter);
    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // average rating for just these books, in one query
    const stats = await Review.aggregate([
      { $match: { book: { $in: books.map((b) => b._id) } } },
      { $group: { _id: "$book", avgRating: { $avg: "$rating" }, numReviews: { $sum: 1 } } },
    ]);
    const statMap = new Map(stats.map((s) => [s._id.toString(), s]));

    const result = books.map((b) => {
      const s = statMap.get(b._id.toString());
      return {
        ...b,
        avgRating: s ? Math.round(s.avgRating * 10) / 10 : 0,
        numReviews: s ? s.numReviews : 0,
      };
    });

    res.json({ books: result, page, pages: Math.ceil(total / limit), total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/books/:id  (public)
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await Book.findById(id).populate("addedBy", "name").lean();
    if (!book) return res.status(404).json({ message: "Book not found" });

    const reviews = await Review.find({ book: id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    const numReviews = reviews.length;
    const avgRating = numReviews
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews) * 10) / 10
      : 0;

    res.json({ ...book, avgRating, numReviews, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/books/:id  (protected, owner only)
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own books" });
    }

    const { title, author, description, genre, coverImage } = req.body;
    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (description !== undefined) book.description = description;
    if (genre !== undefined) book.genre = genre;
    if (coverImage !== undefined) book.coverImage = coverImage;

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/books/:id  (protected, owner only)
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own books" });
    }

    await Review.deleteMany({ book: id }); // no orphan reviews
    await book.deleteOne();
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};