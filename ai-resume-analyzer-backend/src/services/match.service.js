//Imports
   const {
    semanticMatchSkills,
  } = require("./semanticMatch.service");
  
  const {
    scoreProjectSimilarity,
  } = require("./projectSimilarity.service");
  
 //Skill Scoring Helper
  const scoreSkills = (resumeSkills = [], jdSkills = []) => {
    if (!jdSkills.length) {
      return {
        score: 0,        // IMPORTANT: no JD skills → no contribution
        matched: [],
        missing: [],
      };
    }
  
    const { matched, missing } = semanticMatchSkills(
      resumeSkills,
      jdSkills
    );
  
    return {
      score: Math.round((matched.length / jdSkills.length) * 100),
      matched,
      missing,
    };
  };
  
  // the Experience Heuristic
  const extractExperienceYears = (experience = []) => {
    // Simple heuristic: number of roles
    return Array.isArray(experience) ? experience.length : 0;
  };
  
//this is the final matching function
  const matchResumeToJD = async (resumeInput, jd) => {
    // Normalize resume input defensively
    const parsedResume =
      resumeInput?.parsedData || resumeInput || {};
  
    const resumeSkills = parsedResume.skills || [];
    const resumeProjects = parsedResume.projects || [];
    const resumeExperience = parsedResume.experience || [];
  
    //Skill matching logic for required and preferred skills
    const required = scoreSkills(
      resumeSkills,
      jd.requiredSkills || []
    );
  
    const preferred = scoreSkills(
      resumeSkills,
      jd.preferredSkills || []
    );
  
    //Experience penalty logic
    const resumeYears = extractExperienceYears(resumeExperience);
  
    const jdYears = jd.experienceLevel
      ? parseInt(jd.experienceLevel, 10)
      : null;
  
    let experiencePenalty = 0;
  
    if (Number.isFinite(jdYears) && resumeYears < jdYears) {
      experiencePenalty = 15;
    }
  
    //Project semantic similarity logic
    const projectSemantic = await scoreProjectSimilarity(
      resumeProjects,
      jd
    );
  
    //Final score logic
    let finalScore =
      required.score * 0.6 +              // core signal
      preferred.score * 0.15 +             // bonus signal
      projectSemantic.score * 0.25 -        // semantic depth
      experiencePenalty;
  
    finalScore = Math.max(
      0,
      Math.min(100, Math.round(finalScore))
    );
  
    return {
      finalScore,
      breakdown: {
        required,
        preferred,
        projectSemantic,
        experiencePenalty,
      },
    };
  };
  
  module.exports = { matchResumeToJD };
  

