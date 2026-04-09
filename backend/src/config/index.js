import "dotenv/config";

const required = ["DATABASE_URL", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Warning: ${key} is not set. Set it in your .env file.`);
  }
}

export const port = Number(process.env.PORT) || 3000;
export const jwtSecret = process.env.JWT_SECRET || "change-me-in-production";
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
