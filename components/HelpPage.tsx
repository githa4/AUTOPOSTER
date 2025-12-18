

import React, { useState } from 'react';
import { Bot, PenTool, Send, Layers, Cpu, Globe, Database, Smartphone, Layout, Workflow, FileJson, CircleHelp, Folder, FileText, Lightbulb, Book, ArrowLeft, Code, Box, FileCode, Zap, Palette, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const HelpPage: React.FC = () => {
  const { t, setCurrentView } = useAppContext();
  const [activeTab, setActiveTab] = useState<'quick' | 'telegram' | 'stack'>('quick');

  const Step = ({ title, desc, icon: Icon, colorClass }: any) => (
      <div className="bg-[#252526] border border-[#3e3e42] p-5 rounded-md hover:border-[#505050] transition-colors flex gap-4 group">
          <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
              <Icon className="w-5 h-5 opacity-90" />
          </div>
          <div>
              <h3 className="text-sm font-bold text-[#e0e0e0] mb-2">{title}</h3>
              <p className="text-xs text-[#969696] leading-relaxed font-sans">{desc}</p>
          </div>
      </div>
  );

  const Concept = ({ title, desc, icon: Icon }: any) => (
      <div className="flex items-start gap-3 p-3 bg-[#2a2d2e] rounded-md border border-[#3e3e42]">
          <Icon className="w-4 h-4 text-[#007acc] mt-0.5" />
          <div>
              <div className="text-xs font-bold text-white mb-1">{title}</div>
              <div className="text-[11px] text-[#969696]">{desc}</div>
          </div>
      </div>
  );

  const TechBadge = ({ label, icon: Icon, color }: any) => (
      <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded text-xs font-mono text-[#cccccc]">
          <Icon className={`w-4 h-4 ${color}`} />
          {label}
      </div>
  );

  const FileNode = ({ name, desc, isFolder = false, depth = 0 }: any) => (
      <div className="flex items-start gap-3 py-1.5 hover:bg-[#2a2d2e] rounded px-2 transition-colors group" style={{ paddingLeft: `${depth * 20 + 8}px` }}>
          {isFolder ? <Folder className="w-4 h-4 text-[#dcb67a] shrink-0" /> : <FileCode className="w-4 h-4 text-[#519aba] shrink-0" />}
          <div className="flex flex-col">
              <span className={`text-xs font-mono ${isFolder ? 'font-bold text-[#e0e0e0]' : 'text-[#cccccc]'}`}>{name}</span>
              {desc && <span className="text-[10px] text-[#666] leading-tight mt-0.5 opacity-80 group-hover:opacity-100">{desc}</span>}
          </div>
      </div>
  );

  const NavItem = ({ id, icon: Icon, label }: { id: 'quick' | 'telegram' | 'stack', icon: any, label: string }) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`
            w-full text-left p-2.5 rounded-md mb-1.5 flex items-center gap-3 transition-all border
            ${activeTab === id 
                ? 'bg-[#37373d] text-white border-[#007acc] shadow-sm' 
                : 'text-[#969696] border-transparent hover:bg-[#2a2d2e] hover:text-[#e0e0e0]'
            }
        `}
      >
         <Icon className={`w-4 h-4 ${activeTab === id ? 'text-[#007acc]' : ''}`} />
         <span className="text-xs font-medium">{label}</span>
      </button>
  );

  return (
    <div className="flex h-full bg-[#1e1e1e] text-slate-300 overflow-hidden font-sans select-none animate-fade-in">
      
      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-[#252526] border-r border-[#1e1e1e] flex flex-col shrink-0">
          <div className="h-14 flex items-center px-6 border-b border-[#1e1e1e]">
              <span className="text-xs font-bold uppercase tracking-widest text-[#cccccc] flex items-center gap-2">
                  <CircleHelp className="w-4 h-4" /> {t('help')}
              </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
              <div className="text-[10px] font-bold text-[#666] uppercase mb-2 px-2">Documentation</div>
              <NavItem id="quick" icon={Bot} label={t('helpTabQuick')} />
              <NavItem id="telegram" icon={Smartphone} label={t('helpTabTg')} />
              <NavItem id="stack" icon={Layers} label={t('helpTabStack')} />
          </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-8 border-b border-[#252526] bg-[#1e1e1e]">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
                {activeTab === 'quick' && <><Lightbulb className="w-5 h-5 text-yellow-500" /> {t('helpTabQuick')}</>}
                {activeTab === 'telegram' && <><Smartphone className="w-5 h-5 text-blue-500" /> {t('helpTabTg')}</>}
                {activeTab === 'stack' && <><Layers className="w-5 h-5 text-purple-500" /> {t('helpTabStack')}</>}
            </h2>
            <button 
                onClick={() => setCurrentView('main')}
                className="flex items-center gap-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-[#cccccc] px-4 py-1.5 rounded-sm text-xs font-medium transition-colors border border-[#3e3e42]"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('returnDashboard')}
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#1e1e1e]">
            <div className="max-w-4xl mx-auto pb-20">
                
                {/* TAB 1: QUICK START */}
                {activeTab === 'quick' && (
                    <div className="space-y-8 animate-slide-up max-w-3xl">
                        
                        {/* Concepts Section */}
                        <div>
                            <h4 className="text-xs font-bold text-[#858585] uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Book className="w-3.5 h-3.5" /> {t('conceptTitle')}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Concept 
                                    title={t('conceptProject')}
                                    desc={t('conceptProjectDesc')}
                                    icon={Folder}
                                />
                                <Concept 
                                    title={t('conceptFile')}
                                    desc={t('conceptFileDesc')}
                                    icon={FileText}
                                />
                            </div>
                        </div>

                        <div className="h-px bg-[#3e3e42] w-full"></div>

                        {/* Steps */}
                        <div className="space-y-4">
                            <Step 
                                title={t('step1Title')} 
                                desc={t('step1Desc')} 
                                icon={Bot} 
                                colorClass="bg-blue-500 text-blue-400" 
                            />
                            <Step 
                                title={t('step2Title')} 
                                desc={t('step2Desc')} 
                                icon={PenTool} 
                                colorClass="bg-purple-500 text-purple-400" 
                            />
                            <Step 
                                title={t('step3Title')} 
                                desc={t('step3Desc')} 
                                icon={Send} 
                                colorClass="bg-green-500 text-green-400" 
                            />
                        </div>
                    </div>
                )}

                {/* TAB 2: TELEGRAM SETUP */}
                {activeTab === 'telegram' && (
                    <div className="animate-slide-up bg-[#252526] p-8 rounded-md border border-[#3e3e42] max-w-3xl shadow-sm">
                        <ol className="space-y-8 relative border-l border-[#3e3e42] ml-3 my-4">
                            <li className="ml-8 relative">
                                <span className="absolute -left-11 flex items-center justify-center w-6 h-6 bg-[#0e639c] rounded-full ring-4 ring-[#252526] text-white text-xs font-bold">1</span>
                                <h4 className="font-bold text-[#e0e0e0] mb-1 text-sm">BotFather</h4>
                                <p className="text-xs text-[#969696]">{t('tgSetupStep1')}</p>
                            </li>
                            <li className="ml-8 relative">
                                <span className="absolute -left-11 flex items-center justify-center w-6 h-6 bg-[#0e639c] rounded-full ring-4 ring-[#252526] text-white text-xs font-bold">2</span>
                                <h4 className="font-bold text-[#e0e0e0] mb-1 text-sm">Create</h4>
                                <p className="text-xs text-[#969696]">{t('tgSetupStep2')}</p>
                            </li>
                            <li className="ml-8 relative">
                                <span className="absolute -left-11 flex items-center justify-center w-6 h-6 bg-[#0e639c] rounded-full ring-4 ring-[#252526] text-white text-xs font-bold">3</span>
                                <h4 className="font-bold text-[#e0e0e0] mb-1 text-sm">Token</h4>
                                <p className="text-xs text-[#969696] mb-2">{t('tgSetupStep3')}</p>
                                <div className="bg-black/30 p-2 rounded-sm font-mono text-[11px] text-[#73c991] break-all border border-[#3e3e42]">
                                    123456789:ABCdefGHIjklMNOpqrsTUVwxyz
                                </div>
                            </li>
                            <li className="ml-8 relative">
                                <span className="absolute -left-11 flex items-center justify-center w-6 h-6 bg-[#0e639c] rounded-full ring-4 ring-[#252526] text-white text-xs font-bold">4</span>
                                <h4 className="font-bold text-[#e0e0e0] mb-1 text-sm">Admin Rights</h4>
                                <p className="text-xs text-[#969696]">{t('tgSetupStep5')}</p>
                                <p className="text-[10px] text-[#858585] mt-1 italic border-l-2 border-orange-500/50 pl-2">Important: If the bot is not an admin, it cannot post.</p>
                            </li>
                        </ol>
                    </div>
                )}

                {/* TAB 3: DETAILED STACK */}
                {activeTab === 'stack' && (
                    <div className="animate-slide-up space-y-12">
                        
                        {/* Intro */}
                        <div className="bg-gradient-to-r from-[#1e2a38] to-[#252526] p-6 rounded-md border border-[#2b3b4f]">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-blue-400" />
                                {t('stackTitle')}
                            </h3>
                            <p className="text-xs text-[#969696]">
                                AutoPost.ai — это <strong>Client-Side Single Page Application (SPA)</strong>. 
                                Это значит, что у нас нет собственного бэкенда. Весь код исполняется прямо в вашем браузере.
                                Приложение напрямую общается с API Google (Gemini), Replicate и Telegram.
                            </p>
                        </div>

                        {/* 1. Tech Stack Details */}
                        <div>
                            <h4 className="text-xs font-bold text-[#858585] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Code className="w-3.5 h-3.5" /> Technology Stack
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <TechBadge label="React 19" icon={Code} color="text-blue-400" />
                                <TechBadge label="TypeScript" icon={FileCode} color="text-blue-600" />
                                <TechBadge label="Tailwind CSS" icon={Palette} color="text-teal-400" />
                                <TechBadge label="Google GenAI SDK" icon={Sparkles} color="text-purple-400" />
                                <TechBadge label="Lucide React" icon={Layout} color="text-orange-400" />
                                <TechBadge label="LocalStorage" icon={Database} color="text-green-400" />
                                <TechBadge label="Fetch API" icon={Globe} color="text-yellow-400" />
                                <TechBadge label="Vite / ESM" icon={Zap} color="text-red-400" />
                            </div>
                        </div>

                        {/* 2. Project Map (Tree) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-[#252526] border border-[#3e3e42] rounded-md p-4 overflow-hidden">
                                <h4 className="text-xs font-bold text-[#858585] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#3e3e42] pb-2">
                                    <Folder className="w-3.5 h-3.5" /> Project Map (Source)
                                </h4>
                                <div className="space-y-1">
                                    <FileNode name="src" isFolder={true} depth={0} />
                                    
                                    <FileNode name="context" isFolder={true} depth={1} />
                                    <FileNode name="AppContext.tsx" desc="Глобальный 'Мозг'. Хранит ключи, историю, конфиг." depth={2} />
                                    
                                    <FileNode name="services" isFolder={true} depth={1} />
                                    <FileNode name="geminiService.ts" desc="Инженерия промптов, генерация JSON, запросы к AI." depth={2} />
                                    <FileNode name="replicateService.ts" desc="Работа с изображениями (Flux, SDXL, Upscale)." depth={2} />
                                    <FileNode name="telegramService.ts" desc="Отправка FormData (текст/фото) в Telegram API." depth={2} />
                                    
                                    <FileNode name="components" isFolder={true} depth={1} />
                                    <FileNode name="MainPage.tsx" desc="Главный экран: Редактор и Превью." depth={2} />
                                    <FileNode name="SettingsPage.tsx" desc="Управление API ключами и моделями." depth={2} />
                                    <FileNode name="HistorySidebar.tsx" desc="Файловый менеджер (слева)." depth={2} />
                                    
                                    <FileNode name="types.ts" desc="TypeScript интерфейсы для строгой типизации." depth={1} />
                                    <FileNode name="App.tsx" desc="Роутинг и общая структура (ActivityBar + Content)." depth={1} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-[#858585] uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Box className="w-3.5 h-3.5" /> Responsibility Zones
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-[#2a2d2e] rounded border border-[#3e3e42]">
                                            <div className="text-xs font-bold text-blue-400 mb-1">AppContext (State)</div>
                                            <p className="text-[11px] text-[#999]">
                                                Использует React Context API вместо Redux. Сохраняет все данные (черновики, настройки, токены) в <code>localStorage</code> браузера при каждом изменении. Обеспечивает персистентность данных между перезагрузками.
                                            </p>
                                        </div>
                                        <div className="p-3 bg-[#2a2d2e] rounded border border-[#3e3e42]">
                                            <div className="text-xs font-bold text-purple-400 mb-1">Gemini Service (Logic)</div>
                                            <p className="text-[11px] text-[#999]">
                                                Собирает сложный системный промпт (Persona + JSON Schema). Отправляет запрос в Google Cloud. Парсит полученный JSON ответ, обрабатывает ошибки и возвращает готовый объект <code>GeneratedContent</code>.
                                            </p>
                                        </div>
                                        <div className="p-3 bg-[#2a2d2e] rounded border border-[#3e3e42]">
                                            <div className="text-xs font-bold text-green-400 mb-1">Telegram Service (IO)</div>
                                            <p className="text-[11px] text-[#999]">
                                                Преобразует Base64 изображения в бинарные <code>Blob</code> объекты. Формирует <code>FormData</code> и отправляет POST запросы на сервера Telegram (`api.telegram.org`), обходя необходимость в промежуточном бэкенде.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Visual Data Flow */}
                        <div>
                            <h4 className="text-xs font-bold text-[#858585] uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Workflow className="w-3.5 h-3.5" /> {t('flowTitle')}
                            </h4>
                            
                            <div className="relative">
                                {/* Connecting Line */}
                                <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-900 via-purple-900 to-green-900 hidden md:block"></div>

                                <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative">
                                    
                                    {/* Step 1 */}
                                    <div className="flex flex-col items-center text-center w-full md:w-1/6 group">
                                        <div className="w-16 h-16 rounded-full bg-[#1e1e1e] border-2 border-blue-500 flex items-center justify-center z-10 mb-3 shadow-lg group-hover:scale-110 transition-transform">
                                            <PenTool className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <h6 className="text-xs font-bold text-[#e0e0e0] mb-1">{t('flowInput')}</h6>
                                        <span className="text-[10px] text-[#858585] bg-[#252526] px-2 py-0.5 rounded-full border border-[#333]">Input</span>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex flex-col items-center text-center w-full md:w-1/6 group">
                                        <div className="w-16 h-16 rounded-full bg-[#1e1e1e] border-2 border-purple-400 flex items-center justify-center z-10 mb-3 shadow-lg group-hover:scale-110 transition-transform">
                                            <FileJson className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <h6 className="text-xs font-bold text-[#e0e0e0] mb-1">{t('flowPrompt')}</h6>
                                        <span className="text-[10px] text-[#858585] bg-[#252526] px-2 py-0.5 rounded-full border border-[#333]">JSON Schema</span>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex flex-col items-center text-center w-full md:w-1/6 group">
                                        <div className="w-16 h-16 rounded-full bg-[#1e1e1e] border-2 border-purple-600 flex items-center justify-center z-10 mb-3 shadow-lg group-hover:scale-110 transition-transform">
                                            <Cpu className="w-6 h-6 text-purple-600 animate-pulse" />
                                        </div>
                                        <h6 className="text-xs font-bold text-[#e0e0e0] mb-1">{t('flowCloud')}</h6>
                                        <span className="text-[10px] text-[#858585] bg-[#252526] px-2 py-0.5 rounded-full border border-[#333]">Google Gemini</span>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="flex flex-col items-center text-center w-full md:w-1/6 group">
                                        <div className="w-16 h-16 rounded-full bg-[#1e1e1e] border-2 border-orange-400 flex items-center justify-center z-10 mb-3 shadow-lg group-hover:scale-110 transition-transform">
                                            <Layout className="w-6 h-6 text-orange-400" />
                                        </div>
                                        <h6 className="text-xs font-bold text-[#e0e0e0] mb-1">{t('flowResponse')}</h6>
                                        <span className="text-[10px] text-[#858585] bg-[#252526] px-2 py-0.5 rounded-full border border-[#333]">Markdown + Base64</span>
                                    </div>

                                    {/* Step 5 */}
                                    <div className="flex flex-col items-center text-center w-full md:w-1/6 group">
                                        <div className="w-16 h-16 rounded-full bg-[#1e1e1e] border-2 border-green-500 flex items-center justify-center z-10 mb-3 shadow-lg group-hover:scale-110 transition-transform">
                                            <Send className="w-6 h-6 text-green-500" />
                                        </div>
                                        <h6 className="text-xs font-bold text-[#e0e0e0] mb-1">{t('flowPublish')}</h6>
                                        <span className="text-[10px] text-[#858585] bg-[#252526] px-2 py-0.5 rounded-full border border-[#333]">Telegram API</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};