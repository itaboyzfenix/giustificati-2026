import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { generateFormalSummary } from '../services/geminiService';
import { Copy, Loader2, Sparkles } from 'lucide-react';

interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  justifiedNames: string[];
  permanentNames: string[];
}

export const AIReportModal: React.FC<AIReportModalProps> = ({ isOpen, onClose, dateStr, justifiedNames, permanentNames }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (isOpen && !generated) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleGenerate = async () => {
    setLoading(true);
    const text = await generateFormalSummary(dateStr, justifiedNames, permanentNames);
    setReport(text);
    setLoading(false);
    setGenerated(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(report);
    alert("Testo copiato negli appunti!");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scriba Virtuale (AI)">
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-lodge-gold">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="font-serif">Redazione del verbale in corso...</p>
          </div>
        ) : (
          <>
            <div className="bg-lodge-800 p-4 rounded-md border border-lodge-700 text-slate-300 font-serif leading-relaxed whitespace-pre-wrap">
              {report}
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                onClick={copyToClipboard}
                className="flex-1 bg-lodge-gold text-lodge-900 font-bold py-3 px-4 rounded hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
              >
                <Copy size={18} /> Copia Testo
              </button>
              <button 
                onClick={handleGenerate}
                className="flex-1 bg-lodge-700 text-white font-medium py-3 px-4 rounded hover:bg-lodge-600 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={18} /> Rigenera
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};