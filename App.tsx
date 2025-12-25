import React, { useState, useCallback } from 'react';
import { parseFileLocally } from './services/localParser';
import { FileUploader } from './components/FileUploader';
import { ResultsView } from './components/ResultsView';
import { ColumnSelector } from './components/ColumnSelector';
import { AggregatedItem, AppStatus, RawItem, ExcelData, ColumnMapping } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [aggregatedData, setAggregatedData] = useState<AggregatedItem[]>([]);
  const [originalRowCount, setOriginalRowCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // State for Local Parsing flow
  const [excelData, setExcelData] = useState<ExcelData | null>(null);

  const normalizeString = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');

  const aggregateItems = (items: RawItem[]): AggregatedItem[] => {
    const map = new Map<string, AggregatedItem>();

    items.forEach(item => {
      // Create a normalized key for comparison (case insensitive, trimmed)
      const key = normalizeString(item.description);
      
      // Clean display name (Capitalize words)
      const displayDesc = item.description.trim();

      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.totalQuantity += item.quantity;
        existing.occurrenceCount += 1;
        // Prefer the unit that exists
        if (!existing.unit && item.unit) existing.unit = item.unit;
      } else {
        map.set(key, {
          id: key,
          description: displayDesc,
          totalQuantity: item.quantity,
          unit: item.unit || '',
          occurrenceCount: 1
        });
      }
    });

    return Array.from(map.values());
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setStatus(AppStatus.MAPPING);
    setErrorMsg('');
    
    try {
      // 1. Parse Excel/CSV locally
      const data = await parseFileLocally(file);
      setExcelData(data);
      // Wait for user to select columns in the next view
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to read file.");
      setStatus(AppStatus.ERROR);
    }
  }, []);

  const handleColumnMapping = (mapping: ColumnMapping) => {
    if (!excelData) return;

    setStatus(AppStatus.PROCESSING);

    try {
      const { descriptionCol, quantityCol, unitCol } = mapping;
      
      // Map raw Excel rows to strictly typed RawItem[]
      const mappedItems: RawItem[] = [];
      
      excelData.rows.forEach(row => {
        const desc = row[descriptionCol];
        const qty = row[quantityCol];
        const unit = unitCol !== 'none' ? row[unitCol] : undefined;

        // Validation: Must have a description and a valid number for quantity
        if (desc && (typeof qty === 'number' || !isNaN(parseFloat(qty)))) {
            mappedItems.push({
                description: String(desc),
                quantity: Number(qty),
                unit: unit ? String(unit) : undefined
            });
        }
      });

      if (mappedItems.length === 0) {
        throw new Error("Could not extract any valid items using the selected columns.");
      }

      setOriginalRowCount(mappedItems.length);

      // 2. Client-side Aggregation
      const processed = aggregateItems(mappedItems);
      setAggregatedData(processed);
      setStatus(AppStatus.SUCCESS);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error processing data.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setAggregatedData([]);
    setOriginalRowCount(0);
    setErrorMsg('');
    setExcelData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Excel Consolidator</h1>
          </div>
          {status === AppStatus.SUCCESS && (
            <button 
              onClick={handleReset}
              className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Start New Analysis
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Intro Text */}
        {status === AppStatus.IDLE && (
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-4">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                100% Client-Side & Private
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4">
                Consolidate your Inventory Lists
              </h2>
              <p className="text-lg text-slate-600">
                Upload an Excel file or <strong>paste your list data</strong> directly.
                Instantly identify duplicates and sum quantities right in your browser.
              </p>
            </div>
        )}

        {/* File Upload Phase */}
        {status === AppStatus.IDLE && (
          <FileUploader 
            onFileSelect={handleFileUpload} 
            isLoading={false} 
          />
        )}

        {/* Column Mapping Phase */}
        {status === AppStatus.MAPPING && excelData && (
          <ColumnSelector 
            headers={excelData.headers}
            fileName={excelData.fileName}
            onConfirm={handleColumnMapping}
            onCancel={handleReset}
          />
        )}

        {/* Loading State */}
        {status === AppStatus.PROCESSING && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-800">Processing Data...</h3>
          </div>
        )}

        {/* Error State */}
        {status === AppStatus.ERROR && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-10 h-10 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h3>
            <p className="text-red-600 mb-6">{errorMsg}</p>
            <button 
              onClick={() => setStatus(AppStatus.IDLE)}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Section */}
        {status === AppStatus.SUCCESS && (
          <ResultsView data={aggregatedData} originalCount={originalRowCount} />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-400">
          Secure Browser-Based Processing • No Data Sent to Servers
        </div>
      </footer>
    </div>
  );
};

export default App;