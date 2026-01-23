const { z } = require("zod");

const jdParsedSchema = z.object({
  title: z.string().nullable(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  experienceLevel: z.string().nullable(),
  responsibilities: z.array(z.string()),
});

module.exports = { jdParsedSchema };
