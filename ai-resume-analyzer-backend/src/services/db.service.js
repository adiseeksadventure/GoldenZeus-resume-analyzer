const { prisma } = require("../prisma");

//Save full analysis payload
async function saveAnalysisRecord(analysisPayload) {
  try {
    const record = await prisma.analysis.create({
      data: {
        analysisJson: analysisPayload
      },
      select: {
        id: true
      }
    });

    console.log("DB WRITE OK");
    console.log("ANALYSIS_ID:", record.id);

    return record.id;
  } catch (err) {
    console.error("DB WRITE FAILED:", err);
    throw new Error("Database insert failed");
  }
}

// get single analysis by id
async function getAnalysisById(id) {
  try {
    const record = await prisma.analysis.findUnique({
      where: { id }
    });

    if (!record) {
      throw new Error("Analysis not found");
    }

    return record;
  } catch (err) {
    console.error("DB FETCH ERROR:", err);
    throw err;
  }
}

//get all analysis
async function getAllAnalyses() {
  try {
    const records = await prisma.analysis.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return records;
  } catch (err) {
    console.error("DB FETCH ALL ERROR:", err);
    throw err;
  }
}

module.exports = {
  saveAnalysisRecord,
  getAnalysisById,
  getAllAnalyses
};

