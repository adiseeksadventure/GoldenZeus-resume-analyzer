const { getEmbedding } = require("./embedding.service");

//Existing Utils
const normalize = (str) =>
  str.toLowerCase().replace(/[^a-z0-9+.#]/g, "").trim();

//Added Utility: Cosine Similarity
function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }

  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

//Project Relevance Engine
const scoreProjectRelevance = async (projects = [], jd) => {
  if (!projects.length) {
    return {
      score: 0,
      matchedProjects: [],
    };
  }

  //KEYWORD LOgic

  const jdKeywords = [
    ...(jd.requiredSkills || []),
    ...(jd.preferredSkills || []),
    ...(jd.title ? jd.title.split(" ") : []),
  ].map(normalize);

  let relevantProjects = [];

  for (const project of projects) {
    const textBlob = [
      project.title,
      project.description,
      ...(project.tech || []),
    ]
      .join(" ")
      .toLowerCase();

    const matchCount = jdKeywords.filter((kw) =>
      textBlob.includes(kw)
    ).length;

    if (matchCount > 0) {
      relevantProjects.push({
        title: project.title,
        matches: matchCount,
      });
    }
  }

  const keywordScore = Math.min(
    100,
    Math.round((relevantProjects.length / projects.length) * 100)
  );

  //SEMANTIC BOOST

  let semanticBoost = 0;

  try {
    const jdText = [
      jd.title,
      ...(jd.requiredSkills || []),
      ...(jd.preferredSkills || []),
      ...(jd.responsibilities || []),
    ]
      .filter(Boolean)
      .join(" ");

    const jdEmbedding = await getEmbedding(jdText);

    let bestSimilarity = 0;

    for (const project of projects) {
      const projectText = [
        project.title,
        project.description,
        ...(project.tech || []),
      ]
        .filter(Boolean)
        .join(" ");

      const projectEmbedding = await getEmbedding(projectText);

      const similarity = cosineSimilarity(
        projectEmbedding,
        jdEmbedding
      );

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
      }
    }

    // Convert semantic similarity → percentage (0–20 max boost)
    semanticBoost = Math.round(
      Math.min(1, bestSimilarity) * 20
    );
  } catch (err) {
    // HARD FAIL SAFE — keyword logic remains intact
    semanticBoost = 0;
  }

  //FINAL SCORE (keyword + semantic)

  const finalScore = Math.min(100, keywordScore + semanticBoost);

  return {
    score: finalScore,
    matchedProjects: relevantProjects,
  };
};

module.exports = { scoreProjectRelevance };

