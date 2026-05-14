const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDates() {
  const start = new Date('2026-05-01T00:00:00.000Z');
  const end = new Date('2026-06-30T23:59:59.999Z');
  
  const result = await prisma.voucher.updateMany({
    data: {
      ngay_bat_dau: start,
      ngay_het_han: end
    }
  });
  console.log(`Updated ${result.count} vouchers.`);
}
updateDates().finally(() => prisma.$disconnect());
