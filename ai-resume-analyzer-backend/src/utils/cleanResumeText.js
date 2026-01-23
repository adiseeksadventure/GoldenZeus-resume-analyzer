const cleanResumeText = (text) => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/Page \d+ of \d+/gi, "")
    .trim();
};

module.exports = { cleanResumeText };
