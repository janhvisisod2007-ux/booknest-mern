const express = require("express");
const { register, login } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, (req, res) => res.json(req.user)); // protect test karne ke liye

module.exports = router;