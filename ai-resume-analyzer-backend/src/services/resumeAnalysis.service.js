const { matchResumeToJD } = require("./match.service");

//Orchestrates resume vs JD analysis.
const analyzeResumeAgainstJD = async ({ resume, parsedJD }) => {
  //  Run the authoritative matching engine
  // resume here is ALREADY parsed resume data
  const matchResult = await matchResumeToJD(
    resume,
    parsedJD
  );

  const {
    finalScore,
    breakdown: {
      required,
      preferred,
      projectSemantic,
      experiencePenalty,
    },
  } = matchResult;

  //  Derive deterministic category scores for UI
  const skillsScore = required.score;
  const contentScore = projectSemantic.score;
  const structureScore = 100; // guaranteed by parser
  const toneScore = Math.round(
    skillsScore * 0.4 + contentScore * 0.6
  );

  // Overall score (single source of truth)
  const overallScore = finalScore;

  return {
    overallScore,
    breakdown: {
      tone: toneScore,
      content: contentScore,
      structure: structureScore,
      skills: skillsScore,
    },
    atsScore: Math.round(
      skillsScore * 0.5 +
      structureScore * 0.3 +
      contentScore * 0.2
    ),
    breakdownMeta: {
      required,
      preferred,
      projectSemantic,
      experiencePenalty,
    },
  };
};

module.exports = { analyzeResumeAgainstJD };




