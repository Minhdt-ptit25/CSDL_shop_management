const { PrismaClient } = require("@prisma/client");

let prisma = global.__prismaClient;

if (!prisma) {
  prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [{ level: "warn", emit: "stdout" }, { level: "error", emit: "event" }]
        : [{ level: "error", emit: "event" }],
  });

  prisma.$on("error", (err) => {
    // Bỏ qua lỗi unique constraint vì đã xử lý ở route
    if (err && err.code === "P2002") return;
    console.error(err);
  });

  if (process.env.NODE_ENV !== "production") {
    global.__prismaClient = prisma;
  }
}

module.exports = { prisma };
