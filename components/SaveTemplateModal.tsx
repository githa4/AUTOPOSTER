
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { LayoutTemplate } from 'lucide-react';

export const SaveTemplateModal: React.FC = () => {
  const { isSaveTemplateModalOpen, setIsSaveTemplateModalOpen, saveTemplate, editorState, t } = useAppContext();
  const [name, setName] = useState('');

  useEffect(() => {
    if (isSaveTemplateModalOpen) {
        // Pre-fill with topic or default
        setName(editorState.topic || 'My New Template');
    }
  }, [isSaveTemplateModalOpen, editorState.topic]);

  const handleSave = () => {
      if (name.trim()) {
          saveTemplate(name, editorState);
          setIsSaveTemplateModalOpen(false);
      }
  };

  if (!isSaveTemplateModalOpen) return null;

  return (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-[#252526] border border-[#3e3e42] p-4 rounded shadow-2xl w-80 animate-fade-in">
                <h3 className="text-sm font-bold text-[#e0e0e0] mb-3 flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-purple-400" />
                    {t('btnSaveTemplate')}
                </h3>
                
                <label className="text-[10px] text-[#858585] uppercase font-bold mb-1 block">Template Name</label>
                <input 
                    className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007acc] text-xs px-2 py-1.5 rounded-sm text-white mb-3 outline-none"
                    placeholder="e.g. Daily News"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                />

                <div className="text-[10px] text-[#666] mb-4 bg-[#1e1e1e] p-2 rounded">
                    Saves current Tone, Style, Language, and System Prompt.
                </div>
                
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setIsSaveTemplateModalOpen(false)} className="px-3 py-1 text-xs text-[#cccccc] hover:bg-[#3e3e42] rounded-sm">{t('btnCancel')}</button>
                    <button onClick={handleSave} className="px-3 py-1 text-xs bg-[#0e639c] text-white hover:bg-[#1177bb] rounded-sm">{t('btnSave')}</button>
                </div>
            </div>
        </div>
  );
};
