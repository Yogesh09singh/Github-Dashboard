import { useState } from 'react';
import { Download, Loader } from 'lucide-react';
import { exportPDF } from '../api';

interface PDFExportButtonProps {
  owner: string;
  repo: string;
}

export function PDFExportButton({ owner, repo }: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await exportPDF(owner, repo);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis_${owner}_${repo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 rounded-lg transition-colors flex-shrink-0"
    >
      {isExporting ? (
        <Loader className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      {isExporting ? 'Exporting…' : 'Export PDF'}
    </button>
  );
}
