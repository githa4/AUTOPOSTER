
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ProjectConfig } from '../types';

export const ProjectModal: React.FC = () => {
  const { isProjectModalOpen, setIsProjectModalOpen, createFolder, t } = useAppContext();
  const [name, setName] = useState('');
  const [config, setConfig] = useState<ProjectConfig>({});

  useEffect(() => {
    if (isProjectModalOpen) {
        setName('');
        setConfig({});
    }
  }, [isProjectModalOpen]);

  const handleSave = () => {
      if (name.trim()) {
          createFolder(name, config);
          setIsProjectModalOpen(false);
      }
  };

  if (!isProjectModalOpen) return null;

  return (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-[#252526] border border-[#3e3e42] p-4 rounded shadow-2xl w-80 animate-fade-in">
                <h3 className="text-sm font-bold text-[#e0e0e0] mb-3">{t('mdlNewProject')}</h3>
                
                <label className="text-[10px] text-[#858585] uppercase font-bold mb-1 block">{t('phProjectName')}</label>
                <input 
                    className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007acc] text-xs px-2 py-1.5 rounded-sm text-white mb-3 outline-none"
                    placeholder="My Awesome Project"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                />
                
                <div className="text-[10px] text-[#858585] uppercase font-bold mb-1">{t('lblDefaults')}</div>
                <div className="space-y-2 mb-4">
                    <input 
                        className="w-full bg-[#3c3c3c] border border-transparent text-xs px-2 py-1.5 rounded-sm text-[#cccccc] outline-none placeholder-[#666]"
                        placeholder={t('phDefTone')}
                        value={config.defaultTone || ''}
                        onChange={e => setConfig({...config, defaultTone: e.target.value})}
                    />
                    <textarea 
                        className="w-full bg-[#3c3c3c] border border-transparent text-xs px-2 py-1.5 rounded-sm text-[#cccccc] outline-none placeholder-[#666] h-16 resize-none"
                        placeholder={t('phDefPrompt')}
                        value={config.defaultSystemPrompt || ''}
                        onChange={e => setConfig({...config, defaultSystemPrompt: e.target.value})}
                    />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setIsProjectModalOpen(false)} className="px-3 py-1 text-xs text-[#cccccc] hover:bg-[#3e3e42] rounded-sm">{t('btnCancel')}</button>
                    <button onClick={handleSave} className="px-3 py-1 text-xs bg-[#0e639c] text-white hover:bg-[#1177bb] rounded-sm">{t('btnSave')}</button>
                </div>
            </div>
        </div>
  );
};
