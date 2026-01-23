const { getEmbedding } = require("./embedding.client");
const { cosineSimilarity } = require("./semanticMatch.service");


// Build a single text blob from all resume projects
const buildResumeContentText = (projects = []) => {
  return projects
    .map(p =>
      [
        p.title,
        p.description,
        ...(p.tech || [])
      ]
        .filter(Boolean)
        .join(" ")
    )
    .join(" ");
};

// Keyword-based JD coverage score (non-embedding)
const keywordCoverageScore = (resumeText = "", jd = {}) => {
  const keywords = [
    ...(jd.requiredSkills || []),
    ...(jd.preferredSkills || []),
    ...(jd.responsibilities || [])
  ]
    .map(k => k.toLowerCase())
    .filter(Boolean);

  if (!keywords.length || !resumeText) return 0;

  const resumeLower = resumeText.toLowerCase();

  const matched = keywords.filter(k =>
    resumeLower.includes(k)
  ).length;

  return Math.round((matched / keywords.length) * 100);
};

//Project Similarity Engine

const scoreProjectSimilarity = async (projects = [], jd = {}) => {
  if (!projects.length) {
    return {
      score: 0,
      semanticScore: 0,
      keywordScore: 0,
      relevantProjects: []
    };
  }

  // Build texts
  const resumeText = buildResumeContentText(projects);

  const jdText = [
    jd.title,
    ...(jd.requiredSkills || []),
    ...(jd.preferredSkills || []),
    ...(jd.responsibilities || [])
  ]
    .filter(Boolean)
    .join(" ");

  //Semantic Score (Embeddings)
  let semanticScore = 0;
  let relevantProjects = [];

  try {
    const jdEmbedding = await getEmbedding(jdText);

    for (const project of projects) {
      const projectText = [
        project.title,
        project.description,
        ...(project.tech || [])
      ]
        .filter(Boolean)
        .join(" ");

      try {
        const projectEmbedding = await getEmbedding(projectText);
        const similarity = cosineSimilarity(jdEmbedding, projectEmbedding);

        if (similarity >= 0.55) {
          relevantProjects.push({
            title: project.title,
            similarity: Number((similarity * 100).toFixed(1))
          });
        }
      } catch {
        continue;
      }
    }

    semanticScore = Math.round(
      (relevantProjects.length / projects.length) * 100
    );
  } catch {
    semanticScore = 0;
  }

  //Keyword Coverage Score
  const keywordScore = keywordCoverageScore(resumeText, jd);

  //Final Hybrid Content Score
  const finalScore = Math.round(
    (0.6 * semanticScore) + (0.4 * keywordScore)
  );

  return {
    score: finalScore,
    semanticScore,
    keywordScore,
    relevantProjects
  };
};

module.exports = { scoreProjectSimilarity };


