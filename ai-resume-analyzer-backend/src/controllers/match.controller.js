const { prisma } = require("../prisma");
const { parseJDWithAI } = require("../services/jdAiParser.service");
const { jdParsedSchema } = require("../validators/jdParsed.schema");
const { matchResumeToJD } = require("../services/match.service");


const parseAndMatchJD = async (req, res) => {
  try {
  
    if (!req.body || typeof req.body.jdText !== "string") {
      return res.status(400).json({
        message: "jdText is required in request body",
      });
    }

    const { jdText } = req.body;


    const { resumeId } = req.params;
    console.log(resumeId);

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.user.userId,
      },
    });

    if (!resume || !resume.parsedData) {
      return res.status(404).json({
        message: "Parsed resume not found",
      });
    }


    const parsedJDFromAI = await parseJDWithAI(jdText);

    const validatedJD = jdParsedSchema.parse(parsedJDFromAI);

    const matchResult = matchResumeToJD(resume, validatedJD);

    return res.json({
      message: "JD matched successfully",
      score: matchResult.finalScore,
      breakdown: matchResult.breakdown,
      parsedJD: validatedJD,
    });
  } catch (err) {
    console.error("❌ JD MATCH ERROR:", err);

    return res.status(500).json({
      message: "JD matching failed",
      error: err.message,
    });
  }
};

module.exports = { parseAndMatchJD };
