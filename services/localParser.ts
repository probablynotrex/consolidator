import * as XLSX from 'xlsx';
import { ExcelData } from '../types';

/**
 * Parses a File object (Excel/CSV) locally in the browser.
 */
export const parseFileLocally = (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON (Array of objects)
        // defval: "" ensures empty cells aren't skipped, helping structure retention
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          throw new Error("The file appears to be empty.");
        }

        // Extract headers from the first row keys
        // We assume the first row of the parsed JSON keys are the headers
        const headers = Object.keys(rawJson[0] as object);

        resolve({
          headers,
          rows: rawJson,
          fileName: file.name
        });
      } catch (err) {
        reject(new Error("Failed to parse file. Please ensure it is a valid Excel or CSV file."));
      }
    };

    reader.onerror = () => reject(new Error("Error reading file."));
    reader.readAsArrayBuffer(file);
  });
};