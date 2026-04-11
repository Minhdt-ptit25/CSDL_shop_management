const { PrismaClient } = require("@prisma/client");

let prisma = global.__prismaClient;
if (!prisma) {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
  if (process.env.NODE_ENV !== "production") {
    global.__prismaClient = prisma;
  }
}

module.exports = { prisma };

