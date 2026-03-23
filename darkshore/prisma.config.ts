import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

const _dbPath = path.resolve(process.cwd(), "darkshore.db");

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});

