import React, { useCallback, useState } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isLoading }) => {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  const validateFile = (file: File) => {
    const validExtensions = ['xlsx', 'xls', 'csv', 'txt'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    return validExtensions.includes(extension || '');
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    // Create a temporary file object from the text content
    // We use .txt extension so the parser treats it as generic text/csv/tsv
    const file = new File([textInput], "pasted_data.txt", { type: "text/plain" });
    onFileSelect(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in-up">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 ${
            mode === 'upload' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode('paste')}
          className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 ${
            mode === 'paste' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Paste Text / Data
        </button>
      </div>

      {mode === 'upload' ? (
        <div 
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors 
            ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'}
            ${isLoading ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-100 cursor-pointer'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
              <svg className="w-10 h-10 mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-slate-500">Excel (.xlsx, .xls) or CSV</p>
            </div>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept=".xlsx,.xls,.csv,.txt" 
              onChange={handleChange} 
              disabled={isLoading} 
            />
          </label>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isLoading}
            placeholder="Paste your Excel data, CSV content, or list here..."
            className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-sm font-mono"
          />
          <div className="flex justify-end">
             <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isLoading}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Process Text
             </button>
          </div>
        </div>
      )}
    </div>
  );
};