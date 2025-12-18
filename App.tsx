
import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { HistorySidebar } from './components/HistorySidebar';
import { SettingsPage } from './components/SettingsPage';
import { HelpPage } from './components/HelpPage';
import { MainPage } from './components/MainPage';
import { CalendarPage } from './components/CalendarPage';
import { BenchmarksPage } from './components/BenchmarksPage'; 
import { ActivityBar } from './components/ActivityBar';
import { CommandPalette } from './components/CommandPalette';
import { ProjectModal } from './components/ProjectModal';
import { SaveTemplateModal } from './components/SaveTemplateModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/Toast';
import { publishContent } from './services/publishService';
import { GitBranch, Radio, Cloud, CloudOff, Loader2, Globe } from 'lucide-react';

const AutoPostApp: React.FC = () => {
  const { 
      currentView, 
      uiLanguage, 
      setUiLanguage, 
      apiConfig, 
      modelConfig, 
      user, 
      isAuthModalOpen, 
      setIsAuthModalOpen,
      history,
      updateDraftStatus,
      integrations,
      telegramConfig,
      showToast,
      t
  } = useAppContext();
  
  const [showPalette, setShowPalette] = useState(false);
  const [isSchedulerRunning, setIsSchedulerRunning] = useState(false);

  const toggleLanguage = () => {
    setUiLanguage(uiLanguage === 'en' ? 'ru' : 'en');
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setShowPalette(prev => !prev);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- CLIENT SIDE SCHEDULER ---
  useEffect(() => {
      const checkSchedule = async () => {
          if (isSchedulerRunning) return;
          
          const now = Date.now();
          const duePosts = history.filter(h => 
              h.status === 'scheduled' && 
              h.scheduledAt && 
              h.scheduledAt <= now
          );

          if (duePosts.length === 0) return;

          setIsSchedulerRunning(true);
          
          let activeIntegrations = integrations.filter(i => i.isActive);
          if (activeIntegrations.length === 0 && telegramConfig.botToken) {
              activeIntegrations.push({
                  id: 'legacy',
                  provider: 'telegram',
                  name: 'Legacy Telegram',
                  credentials: telegramConfig,
                  isActive: true
              });
          }

          if (activeIntegrations.length === 0) {
              setIsSchedulerRunning(false);
              return;
          }

          for (const post of duePosts) {
              try {
                  const parts = post.content.split("\n\n===SPLIT===\n\n");
                  let success = false;

                  for (const integration of activeIntegrations) {
                      for (let i = 0; i < parts.length; i++) {
                          const partText = parts[i].trim();
                          if (!partText) continue;
                          const isFirst = i === 0;
                          const imageToUse = isFirst ? (post.imageUrl || post.imageBase64) : null;
                          await publishContent(integration, partText, imageToUse, { isSilent: false });
                          if (i < parts.length - 1) await new Promise(r => setTimeout(r, 1000));
                      }
                      success = true;
                  }

                  if (success) {
                      await updateDraftStatus(post.id, 'published');
                                            const title = post.title || (uiLanguage === 'ru' ? 'Тема' : 'Topic');
                                            showToast(
                                                uiLanguage === 'ru'
                                                    ? `Запланированный пост "${title}" опубликован!`
                                                    : `Scheduled post "${title}" published!`,
                                                'success'
                                            );
                  }
              } catch (e: any) {
                                    const title = post.title || (uiLanguage === 'ru' ? 'Тема' : 'Topic');
                                    showToast(
                                        uiLanguage === 'ru'
                                            ? `Не удалось автоопубликовать "${title}": ${e.message}`
                                            : `Failed to auto-publish "${title}": ${e.message}`,
                                        'error'
                                    );
              }
          }
          setIsSchedulerRunning(false);
      };

      const intervalId = setInterval(checkSchedule, 30000); 
      checkSchedule(); 

      return () => clearInterval(intervalId);
  }, [history, integrations, telegramConfig, isSchedulerRunning]);

  const activeProviderName = modelConfig.textProvider.charAt(0).toUpperCase() + modelConfig.textProvider.slice(1);

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-slate-300 overflow-hidden font-sans select-none">
      
      <ActivityBar />

      {currentView === 'main' && <HistorySidebar />}

      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#1e1e1e]">
        
        <div className="flex-1 overflow-hidden relative">
           {currentView === 'main' && <MainPage />}
           {currentView === 'calendar' && <CalendarPage />}
           {currentView === 'benchmarks' && <BenchmarksPage />}
           {currentView === 'settings' && <SettingsPage />}
           {currentView === 'help' && <HelpPage />}
        </div>

        {/* 4. Status Bar (Bottom) - Enhanced UI */}
        <footer className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] select-none shrink-0 z-50 cursor-default">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 hover:bg-white/10 px-1 rounded transition-colors" title={user ? t('statusCloudSyncActiveTitle') : t('statusLocalModeTitle')}>
                    {user ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3 text-white/70" />}
                    <span>{user ? t('statusSyncOn') : t('statusLocal')}</span>
                </div>
                {isSchedulerRunning ? (
                    <div className="flex items-center gap-1 text-yellow-300 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{t('statusPublishing')}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 hover:bg-white/10 px-1 rounded transition-colors opacity-70">
                        <Radio className="w-3 h-3" />
                        <span>{t('statusSchedulerReady')}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 h-full">
                 <div className="hidden md:flex items-center gap-1 border-l border-white/20 pl-3">
                          <span className="opacity-70">{t('statusProviderLabel')}</span>
                    <span className="font-bold">{activeProviderName}</span>
                 </div>
                 <div className="flex items-center gap-1 border-l border-white/20 pl-3">
                          <span className="opacity-70">{t('statusModelLabel')}</span>
                    <span className="font-bold">{modelConfig.textModel}</span>
                 </div>
                 
                 {/* STYLISH LANGUAGE SWITCHER */}
                 <div className="flex items-center h-full border-l border-white/20 ml-2">
                     <button 
                        onClick={toggleLanguage}
                        className="flex items-center gap-1.5 px-2 hover:bg-white/20 h-full transition-all group font-bold"
                                title={t('statusSwitchLanguageTitle')}
                     >
                        <Globe className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                        <span className={uiLanguage === 'ru' ? 'text-white underline decoration-2 underline-offset-2' : 'opacity-60'}>RU</span>
                        <span className="opacity-40">|</span>
                        <span className={uiLanguage === 'en' ? 'text-white underline decoration-2 underline-offset-2' : 'opacity-60'}>EN</span>
                     </button>
                 </div>

                 <div className="hover:bg-white/20 px-2 h-full flex items-center border-l border-white/20 hidden md:flex">
                    UTF-8
                 </div>
            </div>
        </footer>

      </div>

      <CommandPalette 
          isOpen={showPalette} 
          onClose={() => setShowPalette(false)} 
          onToggleLang={toggleLanguage}
      />
      
      <ProjectModal />
      <SaveTemplateModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AutoPostApp />
    </AppProvider>
  );
};

export default App;
