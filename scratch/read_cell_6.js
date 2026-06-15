const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, '../public/Master-List-2026.xlsx');
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  
  const cell = worksheet.getRow(1).getCell(6);
  console.log('Cell value:', cell.value);
  console.log('Cell text:', cell.text);
}

main().catch(console.error);
