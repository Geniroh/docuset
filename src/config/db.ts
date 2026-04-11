import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Prisma resolves "file:./dev.db" relative to the schema file (prisma/),
// so the database lives at prisma/dev.db relative to the project root.
const dbPath = path.join(process.cwd(), "prisma", "dev.db");

const adapter = new PrismaBetterSqlite3({ url: dbPath });

export const prisma = new PrismaClient({ adapter });
