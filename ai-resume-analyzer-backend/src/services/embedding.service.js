const { fetchEmbeddings } = require("./embedding.client");

async function getEmbedding(text) {
  const vectors = await fetchEmbeddings([text]);
  return vectors[0];
}

module.exports = {
  getEmbedding
};
