const express = require("express");
const upload = require("../utils/multer");
const authMiddleware = require("../middleware/auth.middleware");

const {
  uploadResume,
  parseResume,
  matchResumeWithJD //IMPORT ORCHESTRATION CONTROLLER
} = require("../controllers/resume.controller");

const router = express.Router();

//Upload resume PDF
router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

//Parse resume (PDF text → GROQ → structured JSON)
router.post(
  "/parse/:resumeId",
  authMiddleware,
  parseResume
);

// MATCH RESUME WITH JD
router.post(
  "/match/:resumeId",
  authMiddleware,
  matchResumeWithJD
);

module.exports = router;



