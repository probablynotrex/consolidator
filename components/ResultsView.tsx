import React, { useState } from 'react';
import { AggregatedItem } from '../types';

interface ResultsViewProps {
  data: AggregatedItem[];
  originalCount: number;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data, originalCount }) => {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleDownloadCsv = () => {
    const headers = ['Description', 'Total Quantity', 'Unit', 'Occurrences'];
    const rows = data.map(item => [
      `"${item.description.replace(/"/g, '""')}"`,
      item.totalQuantity,
      item.unit,
      item.occurrenceCount
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'aggregated_inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyTable = () => {
    // Construct TSV (Tab Separated Values) for easy Excel pasting
    const headers = ['Item Description', 'Total Quantity', 'Unit', 'Occurrences'];
    const rows = data.map(item => 
      `${item.description}\t${item.totalQuantity}\t${item.unit || ''}\t${item.occurrenceCount}`
    );
    const text = [headers.join('\t'), ...rows].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      
      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Results</h2>
          <p className="text-sm text-slate-500">
             Combined <span className="font-semibold text-slate-900">{originalCount}</span> raw rows into <span className="font-semibold text-indigo-600">{data.length}</span> unique items.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <button 
                onClick={handleCopyTable}
                className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
                {copyFeedback ? (
                  <>
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                    Copy for Excel
                  </>
                )}
            </button>
            <button 
                onClick={handleDownloadCsv}
                className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Export CSV
            </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Occurrences</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-normal text-sm font-medium text-slate-900">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold">{item.totalQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.unit || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {item.occurrenceCount}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};