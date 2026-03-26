// ──────────────────────────────────────────────
//  黑海岸·守望站 — Prisma 7 配置
//  数据库连接 URL 统一在这里配置
// ──────────────────────────────────────────────
import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

const dbPath = path.resolve(process.cwd(), "darkshore.db");

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: `file:${dbPath}`,
  },
});

