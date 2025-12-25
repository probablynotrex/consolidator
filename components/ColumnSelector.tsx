import React, { useState, useEffect } from 'react';
import { ColumnMapping } from '../types';

interface ColumnSelectorProps {
  headers: string[];
  onConfirm: (mapping: ColumnMapping) => void;
  onCancel: () => void;
  fileName: string;
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({ headers, onConfirm, onCancel, fileName }) => {
  const [descriptionCol, setDescriptionCol] = useState<string>('');
  const [quantityCol, setQuantityCol] = useState<string>('');
  const [unitCol, setUnitCol] = useState<string>('none');

  // Auto-guess columns based on common names
  useEffect(() => {
    const lowerHeaders = headers.map(h => h.toLowerCase());
    
    const descIndex = lowerHeaders.findIndex(h => h.includes('desc') || h.includes('item') || h.includes('name') || h.includes('product'));
    if (descIndex >= 0) setDescriptionCol(headers[descIndex]);
    else if (headers.length > 0) setDescriptionCol(headers[0]);

    const qtyIndex = lowerHeaders.findIndex(h => h.includes('qty') || h.includes('quantity') || h.includes('count') || h.includes('amount'));
    if (qtyIndex >= 0) setQuantityCol(headers[qtyIndex]);
    else if (headers.length > 1) setQuantityCol(headers[1]);
    
    const unitIndex = lowerHeaders.findIndex(h => h.includes('unit') || h.includes('uom'));
    if (unitIndex >= 0) setUnitCol(headers[unitIndex]);

  }, [headers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descriptionCol || !quantityCol) return;
    onConfirm({ descriptionCol, quantityCol, unitCol });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200 animate-fade-in-up">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold text-slate-800">Map Columns</h3>
        <p className="text-slate-500 text-sm mt-1">File: {fileName}</p>
        <p className="text-slate-500 text-sm">Select which columns contain the item details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Item Name / Description Column <span className="text-red-500">*</span></label>
          <select 
            value={descriptionCol} 
            onChange={(e) => setDescriptionCol(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            required
          >
            <option value="" disabled>-- Select Column --</option>
            {headers.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Quantity Column <span className="text-red-500">*</span></label>
          <select 
            value={quantityCol} 
            onChange={(e) => setQuantityCol(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            required
          >
            <option value="" disabled>-- Select Column --</option>
            {headers.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Unit Column (Optional)</label>
          <select 
            value={unitCol} 
            onChange={(e) => setUnitCol(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="none">-- None (Skip) --</option>
            {headers.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={!descriptionCol || !quantityCol}
            className="flex-1 py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Process Data
          </button>
        </div>
      </form>
    </div>
  );
};