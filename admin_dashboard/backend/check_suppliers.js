const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSuppliers() {
  try {
    // Check all suppliers
    const suppliers = await prisma.nhaCungCap.findMany();
    
    console.log('=== SUPPLIERS IN DATABASE ===');
    if (suppliers.length === 0) {
      console.log('❌ No suppliers found!');
      console.log('\nYou need to create a supplier first. Run: node create-supplier.js');
    } else {
      console.log(`✅ Found ${suppliers.length} supplier(s):\n`);
      suppliers.forEach(s => {
        console.log(`  ma_ncc: ${s.ma_ncc}`);
        console.log(`  ten_ncc: ${s.ten_ncc}`);
        console.log(`  email: ${s.email}`);
        console.log('  ---');
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuppliers();