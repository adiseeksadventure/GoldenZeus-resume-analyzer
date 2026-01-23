const { getAnalysisById, getAllAnalyses } = require("../services/db.service");

//Get single analysis by id
async function getAnalysis(req, res) {
  try {
    const { id } = req.params;

    const data = await getAnalysisById(id);

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error("GET ANALYSIS ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

// =========================
// Get all analyses
// =========================
async function getAll(req, res) {
  try {
    const data = await getAllAnalyses();

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error("GET ALL ANALYSES ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

module.exports = {
  getAnalysis,
  getAll
};
