import React from 'react';
import { X, BookOpen, Bot, PenTool, Send, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useAppContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            {t('helpTitle')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-500/30">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">{t('step1Title')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t('step1Desc')}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center shrink-0 border border-purple-500/30">
              <PenTool className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">{t('step2Title')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t('step2Desc')}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center shrink-0 border border-green-500/30">
              <Send className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">{t('step3Title')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t('step3Desc')}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-900/30 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {t('gotIt')}
          </button>
        </div>
      </div>
    </div>
  );
};