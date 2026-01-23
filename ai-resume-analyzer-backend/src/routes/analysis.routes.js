const express = require("express");
const router = express.Router();
const { getAnalysis, getAll } = require("../controllers/analysis.controller");

// Get all analyses
router.get("/all", getAll);

// Get analysis by ID
router.get("/:id", getAnalysis);

module.exports = router;
