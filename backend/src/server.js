import app from "./app.js";
import { port } from "./config/index.js";
import { connectDb, disconnectDb } from "./db/prisma.js";

async function main() {
  await connectDb();
  const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

  const shutdown = async () => {
    server.close();
    await disconnectDb();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
