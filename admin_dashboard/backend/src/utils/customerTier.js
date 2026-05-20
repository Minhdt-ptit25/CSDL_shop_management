const { prisma } = require("../db/prisma");

/**
 * Tính số điểm tích lũy từ số tiền hóa đơn.
 * Quy đổi: 1.000.000 VNĐ = 100 điểm (tức 10.000 VNĐ = 1 điểm).
 * @param {number} soTien - Tổng tiền sau giảm của hóa đơn (VNĐ)
 * @returns {number} Số điểm được tích lũy
 */
function calcPoints(soTien) {
  // 1.000.000 VNĐ -> 100 điểm === 10.000 VNĐ -> 1 điểm
  return Math.floor(soTien / 10000);
}

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

module.exports = { calcPoints, determineTier };
