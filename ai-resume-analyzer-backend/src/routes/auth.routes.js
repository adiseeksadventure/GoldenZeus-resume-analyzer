const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const { uploadResume, testExtractResumeText } =
  require("../controllers/resume.controller");


const router = express.Router();

router.post(
  "/extract/:id",
  authMiddleware,
  testExtractResumeText
);

router.post("/register", register);
router.post("/login", login);

// protected route
router.get("/me", authMiddleware, (req, res) => {
  res.json({ userId: req.user.userId });
});

module.exports = router;

