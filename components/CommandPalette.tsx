
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
    Search, 
    FileText, 
    Settings, 
    CircleHelp, 
    FolderPlus, 
    Languages, 
    Terminal,
    Clock
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleLang: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onToggleLang }) => {
  const { 
      history, 
      loadDraftToEditor, 
      setCurrentView, 
      setIsProjectModalOpen,
      setEditorState,
      editorState,
      t 
  } = useAppContext();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Command Definitions
  const commands = [
      {
          id: 'new_draft',
          label: t('cmdNewDraft'),
          icon: FileText,
          action: () => {
             // Reset editor state
             setEditorState({
                 ...editorState,
                 currentDraftId: null,
                 generatedText: '',
                 generatedImage: null,
                 topic: ''
             });
             setCurrentView('main');
          }
      },
      {
          id: 'new_project',
          label: t('cmdNewProject'),
          icon: FolderPlus,
          action: () => {
              setIsProjectModalOpen(true);
          }
      },
      {
          id: 'settings',
          label: t('cmdSettings'),
          icon: Settings,
          action: () => setCurrentView('settings')
      },
      {
          id: 'help',
          label: t('cmdHelp'),
          icon: CircleHelp,
          action: () => setCurrentView('help')
      },
      {
          id: 'toggle_lang',
          label: t('cmdToggleLang'),
          icon: Languages,
          action: onToggleLang
      }
  ];

  // Filter Logic
  const filteredCommands = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));
  
  const filteredHistory = history
        .filter(h => (h.title || h.topic).toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5); // Limit to top 5

  const allItems = [
      ...filteredCommands.map(c => ({ ...c, type: 'command' })),
      ...filteredHistory.map(h => ({ 
          id: h.id, 
          label: h.title || h.topic, 
          icon: Clock, 
          type: 'file', 
          action: () => loadDraftToEditor(h) 
      }))
  ];

  // Reset index on query change
  useEffect(() => {
      setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
      if (isOpen && inputRef.current) {
          setTimeout(() => inputRef.current?.focus(), 50);
      }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % allItems.length);
      } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
      } else if (e.key === 'Enter') {
          e.preventDefault();
          if (allItems[selectedIndex]) {
              allItems[selectedIndex].action();
              onClose();
          }
      } else if (e.key === 'Escape') {
          onClose();
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh]" onClick={onClose}>
        <div 
            className="w-full max-w-xl bg-[#252526] border border-[#3e3e42] shadow-2xl rounded-lg overflow-hidden animate-fade-in flex flex-col"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3e3e42]">
                <Search className="w-5 h-5 text-[#858585]" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={t('cmdPlaceholder')}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none text-white placeholder-[#666]"
                />
                <span className="text-[10px] bg-[#333] px-1.5 py-0.5 rounded text-[#858585] border border-[#444]">ESC</span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto py-2">
                {allItems.length === 0 ? (
                    <div className="px-4 py-8 text-center text-[#666] italic">No results found</div>
                ) : (
                    <>
                        {/* Group labels are tricky in flat list, simplistic approach */}
                        {filteredCommands.length > 0 && <div className="px-3 py-1 text-[10px] font-bold text-[#666] uppercase">{t('cmdCommands')}</div>}
                        {allItems.map((item, idx) => {
                            // Insert header for files if we transition from commands to files
                            const showFileHeader = idx === filteredCommands.length && filteredHistory.length > 0;
                            
                            return (
                                <React.Fragment key={item.id}>
                                    {showFileHeader && <div className="px-3 py-1 text-[10px] font-bold text-[#666] uppercase mt-1">{t('cmdRecent')}</div>}
                                    <div
                                        onClick={() => { item.action(); onClose(); }}
                                        className={`px-3 py-2 flex items-center gap-3 cursor-pointer ${idx === selectedIndex ? 'bg-[#094771] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]'}`}
                                    >
                                        <item.icon className={`w-4 h-4 ${idx === selectedIndex ? 'text-white' : 'text-[#858585]'}`} />
                                        <div className="flex-1 truncate text-sm">
                                            {item.label}
                                        </div>
                                        {item.type === 'command' && (
                                            <span className="text-[10px] opacity-50">Command</span>
                                        )}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </>
                )}
            </div>
            <div className="bg-[#1e1e1e] px-3 py-1 border-t border-[#3e3e42] flex justify-between items-center text-[10px] text-[#666]">
                <div className="flex gap-2">
                    <span>Select: ↵</span>
                    <span>Navigate: ↑↓</span>
                </div>
                <div>AutoPost Command Palette</div>
            </div>
        </div>
    </div>
  );
};
