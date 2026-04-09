import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Set it in .env (PostgreSQL connection string for Prisma)."
  );
}

/* ✅ SINGLE INSTANCE (fixes P2024) */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ✅ OPTIONAL CONNECT (keep if you want fail-fast) */
export async function connectDb() {
  await prisma.$connect();
}

/* ✅ DISCONNECT (call only on shutdown) */
export async function disconnectDb() {
  await prisma.$disconnect();
}