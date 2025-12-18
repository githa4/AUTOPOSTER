
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Hexagon, 
  FileText, 
  Plus, 
  FolderPlus, 
  Settings, 
  Clock, 
  ChevronRight, 
  Play,
  CalendarClock,
  Send
} from 'lucide-react';

interface WelcomeScreenProps {
  onStartNew: (topic: string) => void;
  onOpenSettings: () => void;
  onCreateFolder: () => void;
}

const ActionButton = ({ onClick, icon: Icon, title, desc }: any) => (
    <button 
        onClick={onClick}
        className="flex items-start gap-4 p-4 rounded-md border border-[#3e3e42] bg-[#252526] hover:bg-[#2a2d2e] hover:border-[#505050] transition-all group w-full text-left"
    >
        <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center shrink-0 border border-[#333] group-hover:border-[#007acc] transition-colors">
            <Icon className="w-5 h-5 text-[#cccccc] group-hover:text-[#007acc]" />
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-bold text-[#e0e0e0] group-hover:text-[#007acc] transition-colors">{title}</span>
            <span className="text-[11px] text-[#858585] mt-0.5 leading-tight">{desc}</span>
        </div>
    </button>
);

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartNew, onOpenSettings, onCreateFolder }) => {
  const { history, loadDraftToEditor, t, setIsProjectModalOpen } = useAppContext();
  const [topic, setTopic] = useState('');

  const recentFiles = history.filter(h => h.status !== 'scheduled').slice(0, 5);
  const scheduledFiles = history.filter(h => h.status === 'scheduled').sort((a, b) => (a.scheduledAt || 0) - (b.scheduledAt || 0));

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && topic.trim()) {
          onStartNew(topic);
      }
  }

  return (
    <div className="flex-1 h-full bg-[#1e1e1e] flex items-center justify-center p-8 select-none overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 py-10">
            
            {/* Left Column: Start */}
            <div className="space-y-8 animate-fade-in">
                 <div className="space-y-2">
                     <div className="flex items-center gap-3 text-[#cccccc] opacity-80 mb-4">
                         <Hexagon className="w-10 h-10 text-[#007acc]" />
                         <span className="text-2xl font-light tracking-tight">AutoPost.ai</span>
                     </div>
                     <h1 className="text-3xl font-bold text-white tracking-tight">{t('welTitle')}</h1>
                     <p className="text-[#858585] text-sm">{t('welSubtitle')}</p>
                 </div>

                 <div className="space-y-2">
                     <div className="relative">
                         <input 
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            placeholder={t('welNewDraft')}
                            className="w-full bg-[#252526] border border-[#3e3e42] focus:border-[#007acc] text-sm text-white px-4 py-3 pr-10 rounded-sm shadow-lg outline-none transition-all placeholder-[#666]"
                         />
                         <button 
                            onClick={() => topic.trim() && onStartNew(topic)}
                            className="absolute right-2 top-2 p-1 bg-[#0e639c] text-white rounded hover:bg-[#1177bb] transition-colors"
                         >
                            <Play className="w-4 h-4 fill-current" />
                         </button>
                     </div>
                 </div>

                 <div className="space-y-3 pt-2">
                     <h3 className="text-xs uppercase font-bold text-[#858585] mb-2">{t('welStart')}</h3>
                     
                     <ActionButton 
                        onClick={() => onStartNew('')}
                        icon={FileText}
                        title={t('welActionNew')}
                        desc={t('welActionNewDesc')}
                     />
                     
                     <ActionButton 
                        onClick={() => setIsProjectModalOpen(true)}
                        icon={FolderPlus}
                        title={t('welActionFolder')}
                        desc={t('welActionFolderDesc')}
                     />

                     <ActionButton 
                        onClick={onOpenSettings}
                        icon={Settings}
                        title={t('welActionSettings')}
                        desc={t('welActionSettingsDesc')}
                     />
                 </div>
            </div>

            {/* Right Column: Queues & Recent */}
            <div className="flex flex-col gap-8 md:pl-12 md:border-l border-[#3e3e42] animate-fade-in">
                 
                 {/* SCHEDULED QUEUE */}
                 <div className="space-y-4">
                     <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-orange-400" />
                        <h3 className="text-xs uppercase font-bold text-[#858585]">{t('welScheduledQueue')}</h3>
                     </div>
                     
                     <div className="space-y-1">
                         {scheduledFiles.length === 0 && (
                             <div className="text-sm text-[#666] italic bg-[#252526]/50 p-3 rounded border border-[#3e3e42] border-dashed">
                                 {t('welNoScheduled')}
                             </div>
                         )}
                         {scheduledFiles.map(file => {
                             const date = new Date(file.scheduledAt || Date.now());
                             const isSoon = date.getTime() - Date.now() < 3600000; // 1 hour
                             
                             return (
                                 <div 
                                    key={file.id}
                                    onClick={() => loadDraftToEditor(file)}
                                    className="group flex items-center justify-between py-2 px-3 bg-[#252526] border border-[#3e3e42] rounded hover:border-orange-500/50 cursor-pointer transition-all shadow-sm"
                                 >
                                     <div className="flex items-center gap-3 overflow-hidden">
                                         <div className={`w-8 h-8 rounded flex items-center justify-center border shrink-0 ${isSoon ? 'bg-orange-900/20 border-orange-500/30' : 'bg-[#1e1e1e] border-[#333]'}`}>
                                             <Clock className={`w-4 h-4 ${isSoon ? 'text-orange-400 animate-pulse' : 'text-[#666]'}`} />
                                         </div>
                                         <div className="flex flex-col min-w-0">
                                             <span className="text-sm text-[#e0e0e0] group-hover:text-orange-400 truncate font-medium">{file.title || file.topic}</span>
                                             <span className="text-[10px] text-[#858585] truncate flex items-center gap-1">
                                                {new Date(file.scheduledAt!).toLocaleString()}
                                             </span>
                                         </div>
                                     </div>
                                     <div className="text-[10px] bg-[#1e1e1e] px-2 py-1 rounded text-[#666] group-hover:text-white transition-colors">
                                         Edit
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                 </div>

                 {/* RECENT HISTORY */}
                 <div className="space-y-4 pt-4 border-t border-[#3e3e42]">
                     <h3 className="text-xs uppercase font-bold text-[#858585]">{t('welRecent')}</h3>
                     
                     <div className="space-y-1">
                         {recentFiles.length === 0 && (
                             <div className="text-sm text-[#666] italic">{t('welNoRecent')}</div>
                         )}
                         {recentFiles.map(file => (
                             <div 
                                key={file.id}
                                onClick={() => loadDraftToEditor(file)}
                                className="group flex items-center justify-between py-2 px-3 -mx-2 rounded hover:bg-[#2a2d2e] cursor-pointer transition-colors"
                             >
                                 <div className="flex items-center gap-3 overflow-hidden">
                                     <div className="w-8 h-8 rounded bg-[#1e1e1e] flex items-center justify-center border border-[#333] shrink-0">
                                         {file.status === 'published' ? <Send className="w-3.5 h-3.5 text-green-500" /> : <Clock className="w-4 h-4 text-[#666] group-hover:text-[#007acc]" />}
                                     </div>
                                     <div className="flex flex-col min-w-0">
                                         <span className="text-sm text-[#e0e0e0] group-hover:text-[#40a6ff] truncate font-medium">{file.title || file.topic}</span>
                                         <span className="text-[10px] text-[#666] truncate">
                                            {new Date(file.createdAt).toLocaleDateString()}
                                         </span>
                                     </div>
                                 </div>
                                 <ChevronRight className="w-4 h-4 text-[#666] opacity-0 group-hover:opacity-100 transition-opacity" />
                             </div>
                         ))}
                     </div>
                 </div>
            </div>

        </div>
    </div>
  );
};
