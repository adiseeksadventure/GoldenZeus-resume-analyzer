
const axios = require("axios");

const EMBEDDING_DIM = 384;

const getEmbedding = async (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("getEmbedding: invalid text input");
  }

  try {
    const response = await axios.post(
      process.env.EMBEDDING_API_URL,
      { input: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.EMBEDDING_API_KEY}`,
        },
        timeout: 15000,
      }
    );

    const vector = response.data?.data?.[0]?.embedding;

    if (!Array.isArray(vector) || vector.length !== EMBEDDING_DIM) {
      throw new Error("Invalid embedding vector shape");
    }

    return vector;
  } catch (err) {
    console.error("Embedding failed:", err.message);
    throw err;
  }
};

module.exports = { getEmbedding, EMBEDDING_DIM };

