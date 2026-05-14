const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const skus = [
  // SP07
  { ma_sku: 'SP07-TRG-S',  ma_sp: 'SP07', mau_sac: 'Trắng',    kich_co: 'S',  gia_ban: 180000, so_luong_ton: 20 },
  { ma_sku: 'SP07-TRG-M',  ma_sp: 'SP07', mau_sac: 'Trắng',    kich_co: 'M',  gia_ban: 180000, so_luong_ton: 25 },
  { ma_sku: 'SP07-DEN-L',  ma_sp: 'SP07', mau_sac: 'Đen',      kich_co: 'L',  gia_ban: 185000, so_luong_ton: 15 },
  // SP08
  { ma_sku: 'SP08-DO-M',   ma_sp: 'SP08', mau_sac: 'Đỏ',       kich_co: 'M',  gia_ban: 220000, so_luong_ton: 18 },
  { ma_sku: 'SP08-DO-L',   ma_sp: 'SP08', mau_sac: 'Đỏ',       kich_co: 'L',  gia_ban: 220000, so_luong_ton: 12 },
  { ma_sku: 'SP08-XAM-XL', ma_sp: 'SP08', mau_sac: 'Xám',      kich_co: 'XL', gia_ban: 225000, so_luong_ton: 10 },
  // SP09
  { ma_sku: 'SP09-XD-S',   ma_sp: 'SP09', mau_sac: 'Xanh đậm', kich_co: 'S',  gia_ban: 250000, so_luong_ton: 22 },
  { ma_sku: 'SP09-XD-M',   ma_sp: 'SP09', mau_sac: 'Xanh đậm', kich_co: 'M',  gia_ban: 250000, so_luong_ton: 30 },
  // SP10
  { ma_sku: 'SP10-VG-M',   ma_sp: 'SP10', mau_sac: 'Vàng',     kich_co: 'M',  gia_ban: 195000, so_luong_ton: 14 },
  { ma_sku: 'SP10-VG-L',   ma_sp: 'SP10', mau_sac: 'Vàng',     kich_co: 'L',  gia_ban: 195000, so_luong_ton: 9  },
  { ma_sku: 'SP10-HTI-M',  ma_sp: 'SP10', mau_sac: 'Hồng tím', kich_co: 'M',  gia_ban: 200000, so_luong_ton: 11 },
  // SP11
  { ma_sku: 'SP11-KG-S',   ma_sp: 'SP11', mau_sac: 'Kaki',     kich_co: 'S',  gia_ban: 280000, so_luong_ton: 16 },
  { ma_sku: 'SP11-KG-M',   ma_sp: 'SP11', mau_sac: 'Kaki',     kich_co: 'M',  gia_ban: 280000, so_luong_ton: 20 },
  { ma_sku: 'SP11-KG-L',   ma_sp: 'SP11', mau_sac: 'Kaki',     kich_co: 'L',  gia_ban: 285000, so_luong_ton: 8  },
  // SP12
  { ma_sku: 'SP12-XL-S',   ma_sp: 'SP12', mau_sac: 'Xanh lá',  kich_co: 'S',  gia_ban: 165000, so_luong_ton: 25 },
  { ma_sku: 'SP12-XL-M',   ma_sp: 'SP12', mau_sac: 'Xanh lá',  kich_co: 'M',  gia_ban: 165000, so_luong_ton: 30 },
  // SP13
  { ma_sku: 'SP13-CAM-M',  ma_sp: 'SP13', mau_sac: 'Cam',      kich_co: 'M',  gia_ban: 310000, so_luong_ton: 13 },
  { ma_sku: 'SP13-CAM-L',  ma_sp: 'SP13', mau_sac: 'Cam',      kich_co: 'L',  gia_ban: 310000, so_luong_ton: 7  },
  { ma_sku: 'SP13-TIM-XL', ma_sp: 'SP13', mau_sac: 'Tím',      kich_co: 'XL', gia_ban: 315000, so_luong_ton: 5  },
  // SP14
  { ma_sku: 'SP14-XN-M',   ma_sp: 'SP14', mau_sac: 'Xanh navy',kich_co: 'M',  gia_ban: 240000, so_luong_ton: 19 },
  { ma_sku: 'SP14-XN-L',   ma_sp: 'SP14', mau_sac: 'Xanh navy',kich_co: 'L',  gia_ban: 245000, so_luong_ton: 15 },
  // SP15
  { ma_sku: 'SP15-BE-S',   ma_sp: 'SP15', mau_sac: 'Be',       kich_co: 'S',  gia_ban: 175000, so_luong_ton: 22 },
  { ma_sku: 'SP15-BE-M',   ma_sp: 'SP15', mau_sac: 'Be',       kich_co: 'M',  gia_ban: 175000, so_luong_ton: 28 },
  { ma_sku: 'SP15-NHT-L',  ma_sp: 'SP15', mau_sac: 'Nâu đất',  kich_co: 'L',  gia_ban: 180000, so_luong_ton: 10 },
];

async function seed() {
  let created = 0, skipped = 0;
  for (const sku of skus) {
    const sp = await prisma.sanPham.findUnique({ where: { ma_sp: sku.ma_sp } });
    if (!sp) {
      console.log('SKIP (SP not found):', sku.ma_sp);
      skipped++;
      continue;
    }
    await prisma.bienTheSKU.upsert({
      where: { ma_sku: sku.ma_sku },
      update: { mau_sac: sku.mau_sac, kich_co: sku.kich_co, gia_ban: sku.gia_ban, so_luong_ton: sku.so_luong_ton },
      create: sku,
    });
    created++;
    console.log('Upserted:', sku.ma_sku);
  }
  console.log(`\nDone! Created/updated: ${created} | Skipped (SP missing): ${skipped}`);
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
