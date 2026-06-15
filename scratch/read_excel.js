const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, '../public/Master-List-2026.xlsx');
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  
  console.log('Worksheet name:', worksheet.name);
  
  // Read first 5 rows
  for (let i = 1; i <= 5; i++) {
    const row = worksheet.getRow(i);
    console.log(`Row ${i}:`, row.values);
  }
}

main().catch(console.error);
