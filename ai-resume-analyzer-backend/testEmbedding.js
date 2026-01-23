require("dotenv").config();
const { getEmbedding } = require("./src/services/embedding.service");

async function run() {
  const v = await getEmbedding(
    "Built a Node backend using Prisma and PostgreSQL"
  );
  console.log("Vector length:", v.length);
}

run().catch(console.error);

