require("dotenv/config");

const { prisma } = require("../src/db/prisma");

(async () => {
  const rows = await prisma.$queryRawUnsafe(
    "SELECT ngay_nhap, typeof(ngay_nhap) AS t FROM phieunhap LIMIT 5",
  );
  console.log(rows);
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

