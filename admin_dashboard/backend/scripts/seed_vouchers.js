const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const vouchers = [
  {
    ma_voucher: 'WELCOME10',
    mo_ta: 'Chào mừng khách hàng mới giảm 10%',
    phan_tram_giam: 10,
    so_tien_giam_toida: 50000,
    gia_tri_don_toithieu: 200000,
    ngay_bat_dau: new Date('2024-01-01'),
    ngay_het_han: new Date('2025-12-31'),
    so_luong_phat_hanh: 1000,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'SUMMER20',
    mo_ta: 'Khuyến mãi mùa hè giảm 20%',
    phan_tram_giam: 20,
    so_tien_giam_toida: 100000,
    gia_tri_don_toithieu: 500000,
    ngay_bat_dau: new Date('2024-06-01'),
    ngay_het_han: new Date('2024-08-31'),
    so_luong_phat_hanh: 500,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'HALLOWEEN',
    mo_ta: 'Lễ hội Halloween giảm 15%',
    phan_tram_giam: 15,
    so_tien_giam_toida: 75000,
    gia_tri_don_toithieu: 300000,
    ngay_bat_dau: new Date('2024-10-25'),
    ngay_het_han: new Date('2024-11-01'),
    so_luong_phat_hanh: 300,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'BLACKFRIDAY',
    mo_ta: 'Siêu sale Black Friday giảm 50%',
    phan_tram_giam: 50,
    so_tien_giam_toida: 500000,
    gia_tri_don_toithieu: 1000000,
    ngay_bat_dau: new Date('2024-11-20'),
    ngay_het_han: new Date('2024-11-30'),
    so_luong_phat_hanh: 100,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'XMAS2024',
    mo_ta: 'Giáng sinh an lành giảm 25%',
    phan_tram_giam: 25,
    so_tien_giam_toida: 200000,
    gia_tri_don_toithieu: 800000,
    ngay_bat_dau: new Date('2024-12-20'),
    ngay_het_han: new Date('2024-12-26'),
    so_luong_phat_hanh: 200,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'NEWYEAR2025',
    mo_ta: 'Chào năm mới 2025 giảm 30%',
    phan_tram_giam: 30,
    so_tien_giam_toida: 300000,
    gia_tri_don_toithieu: 1000000,
    ngay_bat_dau: new Date('2025-01-01'),
    ngay_het_han: new Date('2025-01-15'),
    so_luong_phat_hanh: 150,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'FREESHIP',
    mo_ta: 'Miễn phí vận chuyển (giảm tối đa 30k)',
    phan_tram_giam: 100,
    so_tien_giam_toida: 30000,
    gia_tri_don_toithieu: 150000,
    ngay_bat_dau: new Date('2024-01-01'),
    ngay_het_han: new Date('2025-12-31'),
    so_luong_phat_hanh: 5000,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'VALENTINE',
    mo_ta: 'Lễ tình nhân ngọt ngào giảm 14%',
    phan_tram_giam: 14,
    so_tien_giam_toida: 60000,
    gia_tri_don_toithieu: 400000,
    ngay_bat_dau: new Date('2025-02-10'),
    ngay_het_han: new Date('2025-02-16'),
    so_luong_phat_hanh: 214,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'WOMENDAY',
    mo_ta: 'Quốc tế phụ nữ giảm 20%',
    phan_tram_giam: 20,
    so_tien_giam_toida: 80000,
    gia_tri_don_toithieu: 350000,
    ngay_bat_dau: new Date('2025-03-01'),
    ngay_het_han: new Date('2025-03-10'),
    so_luong_phat_hanh: 308,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'BIRTHDAY',
    mo_ta: 'Chúc mừng sinh nhật giảm 15%',
    phan_tram_giam: 15,
    so_tien_giam_toida: 100000,
    gia_tri_don_toithieu: 0,
    ngay_bat_dau: new Date('2024-01-01'),
    ngay_het_han: new Date('2025-12-31'),
    so_luong_phat_hanh: 10000,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'MEMBERSHIP',
    mo_ta: 'Ưu đãi thành viên giảm 5%',
    phan_tram_giam: 5,
    so_tien_giam_toida: 20000,
    gia_tri_don_toithieu: 100000,
    ngay_bat_dau: new Date('2024-01-01'),
    ngay_het_han: new Date('2025-12-31'),
    so_luong_phat_hanh: 99999,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'VIP100',
    mo_ta: 'Voucher VIP giảm 100k',
    phan_tram_giam: 10,
    so_tien_giam_toida: 100000,
    gia_tri_don_toithieu: 1000000,
    ngay_bat_dau: new Date('2024-01-01'),
    ngay_het_han: new Date('2025-12-31'),
    so_luong_phat_hanh: 50,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'FASHION50',
    mo_ta: 'Tín đồ thời trang giảm 50k',
    phan_tram_giam: 5,
    so_tien_giam_toida: 50000,
    gia_tri_don_toithieu: 500000,
    ngay_bat_dau: new Date('2024-01-01'),
    ngay_het_han: new Date('2025-12-31'),
    so_luong_phat_hanh: 1000,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'SALEOFF',
    mo_ta: 'Xả kho cuối năm giảm 40%',
    phan_tram_giam: 40,
    so_tien_giam_toida: 400000,
    gia_tri_don_toithieu: 800000,
    ngay_bat_dau: new Date('2024-12-15'),
    ngay_het_han: new Date('2024-12-31'),
    so_luong_phat_hanh: 100,
    so_luong_da_dung: 0
  },
  {
    ma_voucher: 'HAPPYWEEKEND',
    mo_ta: 'Cuối tuần vui vẻ giảm 12%',
    phan_tram_giam: 12,
    so_tien_giam_toida: 60000,
    gia_tri_don_toithieu: 300000,
    ngay_bat_dau: new Date('2024-01-01'),
    ngay_het_han: new Date('2025-12-31'),
    so_luong_phat_hanh: 2000,
    so_luong_da_dung: 0
  }
];

async function seed() {
  console.log('Đang seeding voucher...');
  let created = 0;
  for (const v of vouchers) {
    try {
      await prisma.voucher.upsert({
        where: { ma_voucher: v.ma_voucher },
        update: v,
        create: v,
      });
      created++;
      console.log(`Đã upsert voucher: ${v.ma_voucher}`);
    } catch (error) {
      console.error(`Lỗi khi upsert voucher ${v.ma_voucher}:`, error);
    }
  }
  console.log(`Hoàn thành! Đã seed thành công ${created} voucher.`);
  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
