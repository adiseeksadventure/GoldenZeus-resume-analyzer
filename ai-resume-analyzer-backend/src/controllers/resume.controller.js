const { prisma } = require("../prisma");
const { extractTextFromPDF } = require("../services/resumeParser.service");
const { parseResumeWithAI } = require("../services/resumeAiParser.service");
const { cleanResumeText } = require("../utils/cleanResumeText");
const { saveAnalysisRecord } = require("../services/db.service");


// JD parser + orchestration layer
const { parseJDWithAI } = require("../services/jdAiParser.service");
const { analyzeResumeAgainstJD } = require("../services/resumeAnalysis.service");

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.user.userId,
        fileUrl: req.file.path,
      },
    });

    return res.status(201).json({
      message: "Resume uploaded successfully",
      resumeId: resume.id,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return res.status(500).json({ message: "Resume upload failed" });
  }
};

const testExtractResumeText = async (req, res) => {
  try {
    const resumeId = req.params.id;

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const text = await extractTextFromPDF(resume.fileUrl);

    return res.json({
      message: "PDF text extracted",
      preview: text.slice(0, 1000),
    });
  } catch (err) {
    console.error("PDF extraction failed:", err);
    return res.status(500).json({
      message: "PDF extraction failed",
      error: err.message,
    });
  }
};


const parseResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.user.userId,
      },
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const rawText = await extractTextFromPDF(resume.fileUrl);
    const cleanedText = cleanResumeText(rawText);

    const parsedData = await parseResumeWithAI(cleanedText);

    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        rawText: cleanedText,
        parsedData,
      },
    });

    return res.json({
      message: "Resume parsed successfully",
      data: parsedData,
    });
  } catch (err) {
    console.error("Resume parsing failed:", err);
    return res.status(500).json({
      message: "Resume parsing failed",
      error: err.message,
    });
  }
};

const matchResumeWithJD = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { jdText } = req.body;

    if (!jdText) {
      return res.status(400).json({ message: "jdText is required in request body" });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.user.userId,
      },
    });

    if (!resume || !resume.parsedData) {
      return res.status(404).json({ message: "Parsed resume not found" });
    }

    // 1 Parse JD
    const parsedJD = await parseJDWithAI(jdText);
    parsedJD.rawText = jdText;

    // 2. Run orchestration layer 
const analysisResult = await analyzeResumeAgainstJD({ 
  resume: { 
    ...resume.parsedData, 
    rawText: resume.rawText, 
  }, 
  parsedJD, 
}); 

// =========================
// CANONICAL DATA MODEL
// =========================
const analysisPayload = {
  parsed_resume: {
    ...resume.parsedData,
    rawText: resume.rawText
  },
  parsed_jd: parsedJD,
  scores: analysisResult.scores || null,
  breakdown: analysisResult.breakdown || null,
  ats: analysisResult.ats || null,
  embeddings: analysisResult.embeddings || null,
  system_meta: {
    model_versions: {
      embedding: "text-embedding-3-large",
      scoring: "hybrid-v1",
      parsing: "resume-parser-v1",
      jd_parsing: "jd-parser-v1"
    },
    timestamp: new Date().toISOString(),
    pipeline_version: "v2.0"
  }
};

// =========================
// DB PERSISTENCE
// =========================
const analysisId = await saveAnalysisRecord(analysisPayload);

// =========================
// RESPONSE
// =========================
return res.json({ 
  message: "JD matched successfully", 
  analysis_id: analysisId,
  parsedJD, 
  analysisResult, 
});

  } catch (err) {
    console.error("Resume-JD match failed:", err);
    return res.status(500).json({
      message: "Resume-JD match failed",
      error: err.message,
    });
  }
};

module.exports = {
  uploadResume,
  testExtractResumeText,
  parseResume,
  matchResumeWithJD,
};
