import * as XLSX from 'xlsx';

/**
 * Export data array to Excel (.xlsx) file
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Desired file name without extension
 */
export function exportToExcel(data, fileName = 'Business_Analytics_Report') {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // Create worksheet & workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics Data');

  // Trigger download
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Parse uploaded Excel (.xlsx or .csv) file to JSON
 * @param {File} file - Uploaded File object
 * @returns {Promise<Array>} - Parsed JSON rows
 */
export function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
