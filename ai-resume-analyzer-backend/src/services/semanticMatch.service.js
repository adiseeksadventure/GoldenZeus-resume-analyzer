//Skill Alias Map
const SKILL_ALIASES = {
  react: ["reactjs", "react.js"],
  javascript: ["js", "ecmascript"],
  nodejs: ["node", "node.js"],
  sql: ["mysql", "postgresql", "sqlite"],
  cpp: ["c++"],
  csharp: ["c#", "dotnet"],
};

//Normalization
const normalize = (str = "") =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9+.#]/g, "")
    .trim();

//Deterministic Semantic Match
const isSemanticMatch = (resumeSkill, jdSkill) => {
  const r = normalize(resumeSkill);
  const j = normalize(jdSkill);

  if (!r || !j) return false;
  if (r === j) return true;

  // Alias resolution
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    const all = [canonical, ...aliases].map(normalize);
    if (all.includes(r) && all.includes(j)) {
      return true;
    }
  }

  // Partial containment fallback
  if (r.includes(j) || j.includes(r)) {
    return true;
  }

  return false;
};

//Skill-Level Semantic Matching Engine
const semanticMatchSkills = (resumeSkills = [], jdSkills = []) => {
  const matched = [];
  const missing = [];

  for (const jdSkill of jdSkills) {
    const found = resumeSkills.some((resumeSkill) =>
      isSemanticMatch(resumeSkill, jdSkill)
    );

    if (found) matched.push(jdSkill);
    else missing.push(jdSkill);
  }

  return { matched, missing };
};

//Cosine Similarity (Embedding Layer)
const cosineSimilarity = (a = [], b = []) => {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

module.exports = {
  normalize,
  isSemanticMatch,
  semanticMatchSkills,
  cosineSimilarity, // used by embedding-based services
};
