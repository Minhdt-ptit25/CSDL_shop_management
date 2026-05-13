const { prisma } = require("../db/prisma");

/**
 * Xác định tên hạng thành viên dựa trên số điểm tích lũy.
 * Lấy dữ liệu từ bảng hang_thanh_vien để đảm bảo tính đồng bộ.
 */
async function determineTier(points, tx = prisma) {
  const tiers = await tx.hangThanhVien.findMany({
    orderBy: { diem_toithieu: 'desc' }
  });
  
  for (const tier of tiers) {
    if (points >= tier.diem_toithieu) {
      return tier.ten_hang;
    }
  }
  return "Vô hạng";
}

module.exports = { determineTier };
