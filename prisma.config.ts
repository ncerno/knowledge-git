import path from "node:path";
import { defineConfig } from "prisma/config";

const dbPath = path.resolve(process.cwd(), "darkshore", "darkshore.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `file:${dbPath}`,
  },
});
