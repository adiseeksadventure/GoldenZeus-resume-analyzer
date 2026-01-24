const pdfParse = require("pdf-parse");

/**
 * Extract text from PDF buffer (cloud-native)
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
const extractTextFromPDF = async (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid PDF buffer provided to extractTextFromPDF");
  }

  const data = await pdfParse(buffer);
  return data.text;
};

module.exports = { extractTextFromPDF };

