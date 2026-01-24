const { prisma } = require("../prisma");
const supabase = require("../services/supabase.storage");
const { v4: uuidv4 } = require("uuid");

const { extractTextFromPDF } = require("../services/resumeParser.service");
const { parseResumeWithAI } = require("../services/resumeAiParser.service");
const { cleanResumeText } = require("../utils/cleanResumeText");
const { saveAnalysisRecord } = require("../services/db.service");

// JD parser + orchestration layer
const { parseJDWithAI } = require("../services/jdAiParser.service");
const { analyzeResumeAgainstJD } = require("../services/resumeAnalysis.service");

// upload resume-> supabase storage
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const fileBuffer = req.file.buffer;
    const fileName = `${uuidv4()}.pdf`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("resumes")
      .upload(fileName, fileBuffer, {
        contentType: "application/pdf",
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({ message: "Storage upload failed" });
    }

    // Save metadata in DB
    const resume = await prisma.resume.create({
      data: {
        userId: req.user.userId,
        fileUrl: data.path,     // storage path in bucket
        storage: "supabase",
        status: "uploaded"
      }
    });

    return res.status(201).json({
      message: "Resume uploaded successfully",
      resumeId: resume.id,
      filePath: data.path,
      storage: "supabase"
    });

  } catch (error) {
    console.error("Resume upload error:", error);
    return res.status(500).json({ message: "Resume upload failed" });
  }
};

// test pdf extraction from supabase storage
const testExtractResumeText = async (req, res) => {
  try {
    const resumeId = req.params.id;

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId }
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Download PDF from Supabase
    const { data, error } = await supabase.storage
      .from("resumes")
      .download(resume.fileUrl);

    if (error) {
      throw new Error("Failed to download resume from storage");
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    const text = await extractTextFromPDF(buffer);

    return res.json({
      message: "PDF text extracted",
      preview: text.slice(0, 1000)
    });

  } catch (err) {
    console.error("PDF extraction failed:", err);
    return res.status(500).json({
      message: "PDF extraction failed",
      error: err.message
    });
  }
};

//PARSE RESUME (SUPABASE → BUFFER → AI)
const parseResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.user.userId
      }
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Download PDF from Supabase
    const { data, error } = await supabase.storage
      .from("resumes")
      .download(resume.fileUrl);

    if (error) {
      throw new Error("Failed to download resume from storage");
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    const rawText = await extractTextFromPDF(buffer);
    const cleanedText = cleanResumeText(rawText);

    const parsedData = await parseResumeWithAI(cleanedText);

    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        rawText: cleanedText,
        parsedData
      }
    });

    return res.json({
      message: "Resume parsed successfully",
      data: parsedData
    });

  } catch (err) {
    console.error("Resume parsing failed:", err);
    return res.status(500).json({
      message: "Resume parsing failed",
      error: err.message
    });
  }
};

//MATCH RESUME WITH JD (FULL PIPELINE)
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
        userId: req.user.userId
      }
    });

    if (!resume || !resume.parsedData) {
      return res.status(404).json({ message: "Parsed resume not found" });
    }

    // 1) Parse JD
    const parsedJD = await parseJDWithAI(jdText);
    parsedJD.rawText = jdText;

    // 2) Run orchestration layer
    const analysisResult = await analyzeResumeAgainstJD({
      resume: {
        ...resume.parsedData,
        rawText: resume.rawText
      },
      parsedJD
    });

    // canonical data model
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

    // DB persistence 
    const analysisId = await saveAnalysisRecord(analysisPayload);

    // response
    return res.json({
      message: "JD matched successfully",
      analysis_id: analysisId,
      parsedJD,
      analysisResult
    });

  } catch (err) {
    console.error("Resume-JD match failed:", err);
    return res.status(500).json({
      message: "Resume-JD match failed",
      error: err.message
    });
  }
};

// exports
module.exports = {
  uploadResume,
  testExtractResumeText,
  parseResume,
  matchResumeWithJD
};
