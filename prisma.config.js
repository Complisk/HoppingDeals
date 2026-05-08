// Prisma 7 config. The datasource URL must live here (not in schema.prisma).
// Loaded automatically by Prisma CLI and tooling.
import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
  },
});
