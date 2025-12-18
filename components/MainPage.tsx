import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { getModelLimits } from '../services/geminiService';
import { LoadingState, GenerationStats, InlineButton, SourceType, PostMode } from '../types';
import { WelcomeScreen } from './WelcomeScreen';
import { usePostGeneration } from '../hooks/usePostGeneration';
import { usePublishing } from '../hooks/usePublishing';

// Add missing Activity import
import { 
  Play, Send, RefreshCw, Copy, Globe, Terminal, Eye, AlertTriangle, Bold, Italic, Underline, 
  MicOff, EyeOff, ImagePlus, Trash2, Plus, Edit2, X, Sparkles, Check, Save, FileText, 
  GripVertical, FileCode, Smartphone, ArrowRight, Zap, Wand2, Maximize2, Minimize2, 
  Scissors, ZoomIn, Youtube, BookOpen, Link, Square, Cpu, CheckSquare, 
  Square as SquareIcon, CloudUpload, Clock, Info, RotateCcw,
  Activity
} from 'lucide-react';

const LANGUAGES = [
  "English", "Russian", "Ukrainian", "Spanish", "German", 
  "French", "Italian", "Portuguese", "Chinese", "Japanese", "Turkish"
];

const SPLIT_DELIMITER = "\n\n===SPLIT===\n\n";
const TG_CAPTION_LIMIT = 1024;
const TG_TEXT_LIMIT = 4096;

// === PROGRESS COMPONENT ===
const GenerationProgress = ({ state }: { state: LoadingState }) => {
    const { t } = useAppContext();
    const [log, setLog] = useState(t('logInitializing'));
    
    useEffect(() => {
        if (state === LoadingState.IDLE) return;
        const logs = [
            t('logParsing'), t('logOptimizing'), t('logApplying'),
            t('logSynthesizing'), t('logRendering'), t('logFinalizing')
        ];
        let i = 0;
        const interval = setInterval(() => { setLog(logs[i % logs.length]); i++; }, 1200);
        return () => clearInterval(interval);
    }, [state, t]);

    if (state === LoadingState.IDLE || state === LoadingState.SUCCESS || state === LoadingState.ERROR || state === LoadingState.CANCELLED) return null;
    
    const isUpload = state === LoadingState.UPLOADING;
    
    return (
        <div className="absolute inset-x-0 top-0 h-1 bg-[#252526] z-50 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-[#007acc] to-transparent w-1/2 animate-[shimmer_1.5s_infinite] absolute top-0" />
            <div className="absolute top-10 right-4 bg-black/80 backdrop-blur border border-[#007acc]/50 px-3 py-2 rounded font-mono text-[10px] text-[#007acc] shadow-[0_0_15px_rgba(0,122,204,0.3)] flex flex-col gap-1 z-50 animate-fade-in-up pointer-events-none">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider"><Cpu className="w-3 h-3 animate-spin" />{isUpload ? t('logUploading').toUpperCase() : t('logProcessing').toUpperCase()}</div>
                    <div className="text-[#cccccc] opacity-80">&gt; {isUpload ? t('logUploading') : log}</div>
                <div className="h-0.5 w-full bg-[#333] mt-1 overflow-hidden rounded-full"><div className="h-full bg-[#007acc] animate-[load_2s_ease-in-out_infinite] w-full origin-left scale-x-0"></div></div>
            </div>
        </div>
    );
};

export const MainPage: React.FC = () => {
  const { 
      modelConfig, apiConfig, integrations, telegramConfig,
      addToHistory, updateDraftStatus, setIsSaveTemplateModalOpen,
      t, setCurrentView, editorState, setEditorState,
      dailyUsage, resetQuota, createFolder, history, showToast
  } = useAppContext();

  const TONES = [t('toneProfessional'), t('toneFriendly'), t('toneSarcastic'), t('toneClickbait'), t('toneNeutral')];

  // === HOOKS ===
  const { 
      generate, regenerateImage, stopGeneration, runMagicTool, 
      processImage, uploadImage, loadingState: genLoading, errorMsg 
  } = usePostGeneration();
  
  const { publish, loadingState: pubLoading } = usePublishing();

  // === STATE ===
  const [topic, setTopic] = useState(editorState.topic);
  const [sourceType, setSourceType] = useState<SourceType>(editorState.sourceType); 
  const [postMode, setPostMode] = useState<PostMode>(editorState.postMode); 
  const [includeLongRead, setIncludeLongRead] = useState(editorState.includeLongRead); 
  const [isTextEnabled, setIsTextEnabled] = useState(editorState.isTextEnabled ?? true);
  const [isImageEnabled, setIsImageEnabled] = useState(editorState.isImageEnabled ?? true);
  const [language, setLanguage] = useState(editorState.language);
  const [tone, setTone] = useState(editorState.tone || t('toneProfessional'));
  const [imageStyle, setImageStyle] = useState(editorState.imageStyle || t('styleRealistic'));
  const [postCount, setPostCount] = useState(editorState.postCount || 1);
  const [customSystemPrompt, setCustomSystemPrompt] = useState(editorState.customSystemPrompt || modelConfig.systemPrompt || '');
  
  const [generatedText, setGeneratedText] = useState(editorState.generatedText);
  const [generatedImage, setGeneratedImage] = useState<string | null>(editorState.generatedImage);
  const [currentImagePrompt, setCurrentImagePrompt] = useState(editorState.currentImagePrompt || '');
  
  const [isSilent, setIsSilent] = useState(editorState.isSilent);
  const [inlineButtons, setInlineButtons] = useState<InlineButton[]>(editorState.inlineButtons || []);
  const [showButtonInput, setShowButtonInput] = useState(false);
  const [newButtonText, setNewButtonText] = useState('');
  const [newButtonUrl, setNewButtonUrl] = useState('');
  
  const [scheduledAt, setScheduledAt] = useState(editorState.scheduledAt || '');
  const [showScheduleInput, setShowScheduleInput] = useState(false);

  const [isEditingImagePrompt, setIsEditingImagePrompt] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showMagicMenu, setShowMagicMenu] = useState(false);
  const [showImageMagicMenu, setShowImageMagicMenu] = useState(false);
  const [imageProcessingType, setImageProcessingType] = useState<'rembg' | 'upscale' | null>(null);
  
  const [previewWidth, setPreviewWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  
  const [textStats, setTextStats] = useState<GenerationStats | null>(editorState.textStats);
  const [imageStats, setImageStats] = useState<GenerationStats | null>(editorState.imageStats);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(editorState.currentDraftId);
  const [activeBottomTab, setActiveBottomTab] = useState<'output' | 'quota'>('output');

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const magicMenuRef = useRef<HTMLDivElement>(null);
  const imageMagicMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
        setEditorState({
            topic, sourceType, language, tone, imageStyle, postCount, customSystemPrompt,
            postMode, includeLongRead, isTextEnabled, isImageEnabled,
            generatedText, generatedImage, currentImagePrompt,
            isSilent, hasSpoiler: false, inlineButtons,
            textStats, imageStats, currentDraftId,
            activeFolderId: editorState.activeFolderId,
            scheduledAt 
        });
    }, 500); 
    return () => clearTimeout(timer);
  }, [topic, sourceType, language, tone, imageStyle, postCount, customSystemPrompt, postMode, includeLongRead, isTextEnabled, isImageEnabled, generatedText, generatedImage, currentImagePrompt, isSilent, inlineButtons, textStats, imageStats, currentDraftId, editorState.activeFolderId, scheduledAt, setEditorState]);

  useEffect(() => {
    if (editorState.currentDraftId !== currentDraftId) {
        setTopic(editorState.topic);
        setSourceType(editorState.sourceType);
        setPostMode(editorState.postMode);
        setIncludeLongRead(editorState.includeLongRead);
        setIsTextEnabled(editorState.isTextEnabled ?? true);
        setIsImageEnabled(editorState.isImageEnabled ?? true);
        setLanguage(editorState.language);
        setTone(editorState.tone || t('toneProfessional'));
        setImageStyle(editorState.imageStyle || t('styleRealistic'));
        setPostCount(editorState.postCount || 1);
        setCustomSystemPrompt(editorState.customSystemPrompt || modelConfig.systemPrompt || '');
        setGeneratedText(editorState.generatedText);
        setGeneratedImage(editorState.generatedImage);
        setCurrentImagePrompt(editorState.currentImagePrompt);
        setIsSilent(editorState.isSilent);
        setInlineButtons(editorState.inlineButtons || []);
        setTextStats(editorState.textStats);
        setImageStats(editorState.imageStats);
        setCurrentDraftId(editorState.currentDraftId);
        setScheduledAt(editorState.scheduledAt || '');
    }
  }, [editorState, currentDraftId, modelConfig.systemPrompt, t]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = document.body.clientWidth - e.clientX;
      if (newWidth > 300 && newWidth < 800) setPreviewWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) { document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp); document.body.style.cursor = 'col-resize'; } 
    else { document.body.style.cursor = 'default'; }
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isResizing]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (magicMenuRef.current && !magicMenuRef.current.contains(event.target as Node)) setShowMagicMenu(false);
          if (imageMagicMenuRef.current && !imageMagicMenuRef.current.contains(event.target as Node)) setShowImageMagicMenu(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { if (previewScrollRef.current) previewScrollRef.current.scrollTop = previewScrollRef.current.scrollHeight; }, [generatedText, generatedImage]);

  const postsArray = generatedText.split(SPLIT_DELIMITER);
  const previewList = (postsArray.length === 0 || (postsArray.length === 1 && !postsArray[0].trim())) && generatedImage ? [''] : postsArray;
  const charCount = postsArray[0]?.length || 0;
  const wordCount = postsArray[0]?.trim().split(/\s+/).filter(w => w.length > 0).length || 0;
  const currentLimit = generatedImage ? TG_CAPTION_LIMIT : TG_TEXT_LIMIT;
  const charsRemaining = currentLimit - charCount;
  const isOverLimit = charsRemaining < 0;
  const isNearLimit = charsRemaining < 200 && charsRemaining >= 0;
  const willAutoSplit = generatedImage && isOverLimit && charCount < 4000;
  const currentLimits = getModelLimits(modelConfig.textModel);
  const remainingToday = Math.max(0, currentLimits.rpd - dailyUsage);
  const usagePercent = Math.min(100, (dailyUsage / currentLimits.rpd) * 100);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    if (!isTextEnabled && !isImageEnabled) { showToast(t('errorGen'), 'warning'); return; }
    
    if (isTextEnabled) { setGeneratedText(''); setTextStats(null); }
    if (isImageEnabled) { setGeneratedImage(null); setImageStats(null); }
    setCurrentImagePrompt('');
    setActiveBottomTab('output');
    setIsEditingImagePrompt(false);
    setShowPromptEditor(false);

    const result = await generate({
        topic, sourceType, language, tone, imageStyle, postCount, postMode, includeLongRead,
        isTextEnabled, isImageEnabled, customSystemPrompt, currentImagePrompt, scheduledAt,
        activeFolderId: editorState.activeFolderId
    });

    if (result) {
        if (result.generatedText) setGeneratedText(result.generatedText);
        if (result.generatedImage) setGeneratedImage(result.generatedImage);
        if (result.imagePrompt) setCurrentImagePrompt(result.imagePrompt);
        if (result.textStats) setTextStats(result.textStats);
        if (result.imageStats) setImageStats(result.imageStats);
        if (result.newDraftId) setCurrentDraftId(result.newDraftId);
    }
  };

  const handleRegenerateImage = async () => {
      setIsEditingImagePrompt(false);
      const res = await regenerateImage(currentImagePrompt, topic, imageStyle);
      if (res) {
          setGeneratedImage(res.image);
          setImageStats(res.stats);
      }
  };

  const handleImageAction = async (action: 'rembg' | 'upscale') => {
      setShowImageMagicMenu(false);
      setImageProcessingType(action);
      const newImg = await processImage(generatedImage, action);
      if (newImg) {
          setGeneratedImage(newImg);
          setImageStats({ modelName: `Replicate: ${action}`, latencyMs: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0 });
      }
      setImageProcessingType(null);
  };

  const handleMagicAction = async (action: string) => {
      if (!editorRef.current) return;
      const { selectionStart, selectionEnd, value } = editorRef.current;
      setShowMagicMenu(false);
      const res = await runMagicTool(value, selectionStart, selectionEnd, action);
      if (res) setGeneratedText(res.before + res.rewritten + res.after);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const res = await uploadImage(file);
          if (res) {
              setGeneratedImage(res.image);
              setImageStats(res.stats);
              setIsEditingImagePrompt(false);
          }
      }
  };

  const handlePublish = async () => {
      await publish({
          text: generatedText,
          image: generatedImage,
          draftId: currentDraftId,
          charCount,
          isSilent,
          inlineButtons
      });
  };

  const handleStartNew = (newTopic: string) => {
      setTopic(newTopic);
      const id = newTopic ? "temp-" + Date.now() : "new-" + Date.now();
      setCurrentDraftId(id);
      if (newTopic) setTimeout(() => handleGenerate(), 100);
      else { setGeneratedText(''); setGeneratedImage(null); setScheduledAt(''); }
  };

  const handleScheduleSave = () => {
      if (!currentDraftId || !scheduledAt) return;
      const ts = new Date(scheduledAt).getTime();
      updateDraftStatus(currentDraftId, 'scheduled', ts);
      setShowScheduleInput(false);
      showToast(`${t('calScheduled')}: ${new Date(ts).toLocaleString()}`, 'success');
  };

  const insertTag = (tag: string) => {
    if (!editorRef.current) return;
    const { selectionStart: start, selectionEnd: end, value: text } = editorRef.current;
    const newText = text.substring(0, start) + `<${tag}>` + (text.substring(start, end) || 'text') + `</${tag}>` + text.substring(end);
    setGeneratedText(newText);
    setTimeout(() => {
        editorRef.current?.focus();
        editorRef.current?.setSelectionRange(start + tag.length + 2, start + tag.length + 2 + (end - start || 4));
    }, 0);
  };

  const renderHtmlPreview = (text: string) => {
    if (!text) return null;
    let safeHtml = text.replace(/\n/g, '<br/>')
        .replace(/<tg-spoiler>(.*?)<\/tg-spoiler>/g, '<span class="blur-sm hover:blur-none transition-all cursor-pointer bg-white/10 px-1 rounded">$1</span>')
        .replace(/<blockquote>/g, '<blockquote style="border-left: 3px solid #64b5f6; padding-left: 10px; color: #d1d5db; margin: 4px 0; background: rgba(100, 181, 246, 0.1); border-radius: 0 4px 4px 0; padding: 4px 10px;">');
    return <span dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  };

  const isGenActive = [LoadingState.GENERATING_TEXT, LoadingState.GENERATING_IMAGE, LoadingState.UPLOADING].includes(genLoading);
  const isPubActive = pubLoading === LoadingState.PUBLISHING;
  const isLoading = isGenActive || isPubActive;
  const activeIntegrationsCount = integrations.filter(i => i.isActive).length + (integrations.length === 0 && telegramConfig.botToken ? 1 : 0);

  if (!currentDraftId) return <WelcomeScreen onStartNew={handleStartNew} onOpenSettings={() => setCurrentView('settings')} onCreateFolder={() => { const name = prompt(t('phProjectName')); if(name) createFolder(name); }} />;

  const tabTitle = history.find(h => h.id === currentDraftId)?.title || topic || "Untitled";

  return (
    <div className={`flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] relative transition-all duration-300 ${isFocusMode ? 'fixed inset-0 z-[100]' : ''}`}>
        <div className="h-9 bg-[#252526] flex items-end px-0 select-none overflow-x-auto no-scrollbar border-b border-[#252526] shrink-0">
             <div className="bg-[#1e1e1e] text-white px-3 py-1.5 min-w-[150px] max-w-[250px] flex items-center justify-between gap-2 border-t border-[#007acc] text-xs h-full">
                 <div className="flex items-center gap-2 truncate"><FileText className="w-3.5 h-3.5 text-[#e0e0e0]" /><span className="truncate">{tabTitle}</span></div>
                 <button onClick={() => { setCurrentDraftId(null); setTopic(''); setGeneratedText(''); setGeneratedImage(null); setScheduledAt(''); }} className="hover:bg-[#333] rounded p-0.5"><X className="w-3 h-3 text-[#cccccc]" /></button>
             </div>
             <div className="flex-1 flex items-center justify-end px-4 gap-3 h-full pb-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#858585] bg-[#2d2d2d] px-2 py-0.5 rounded-full border border-[#3e3e42]"><Activity className="w-3 h-3 text-blue-400" /><span>{modelConfig.textModel.split(/[-/]/).pop()}</span></div>
                  <button onClick={() => setIsFocusMode(!isFocusMode)} className={`p-1 rounded hover:bg-[#333] transition-colors ${isFocusMode ? 'text-[#007acc]' : 'text-[#858585]'}`}>{isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}</button>
             </div>
        </div>

        <div className="bg-[#1e1e1e] border-b border-[#252526] flex flex-col shadow-sm z-20 relative">
            <div className="h-10 flex items-center gap-0">
                <div className="flex items-center h-full border-r border-[#252526]">
                    <button onClick={() => setSourceType('text')} className={`h-full px-3 flex items-center justify-center transition-colors ${sourceType === 'text' ? 'bg-[#2d2d2d] text-[#007acc]' : 'hover:bg-[#2d2d2d] text-[#666]'}`}><FileCode className="w-4 h-4" /></button>
                    <button onClick={() => setSourceType('youtube')} className={`h-full px-3 flex items-center justify-center transition-colors ${sourceType === 'youtube' ? 'bg-[#2d2d2d] text-red-500' : 'hover:bg-[#2d2d2d] text-[#666]'}`}><Youtube className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 flex items-center px-4 gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap ${sourceType === 'youtube' ? 'text-red-500' : 'text-[#007acc]'}`}>{sourceType === 'youtube' ? t('sourceYoutube') : t('sourceInput')}</span>
                    <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()} placeholder={sourceType === 'youtube' ? "https://youtube.com/watch?v=..." : t('placeholder')} className="w-full bg-transparent border-none text-sm text-[#cccccc] placeholder-[#666] outline-none font-mono" disabled={isLoading} />
                </div>
                <div className="flex items-center pr-2 gap-2">
                    <button onClick={() => setIsSaveTemplateModalOpen(true)} disabled={isLoading} className="p-2 hover:bg-[#333] rounded text-[#cccccc]"><Save className="w-4 h-4" /></button>
                    {isLoading ? (
                        <button onClick={stopGeneration} className="flex items-center gap-2 bg-red-900/80 hover:bg-red-800 text-white px-4 py-1.5 rounded-sm text-xs font-medium uppercase tracking-wide ml-2 animate-pulse border border-red-500/50"><Square className="w-3.5 h-3.5 fill-current" /><span>{t('btnCancel')}</span></button>
                    ) : (
                        <button onClick={handleGenerate} disabled={!topic.trim()} className="flex items-center gap-2 bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#333] disabled:text-[#666] text-white px-4 py-1.5 rounded-sm text-xs font-medium uppercase tracking-wide ml-2 transition-all"><Play className="w-3.5 h-3.5 fill-current" /><span>{t('run')}</span></button>
                    )}
                </div>
            </div>

            <div className="h-8 px-4 flex items-center gap-4 bg-[#252526] text-xs border-t border-[#1e1e1e]">
                 <div className="flex items-center gap-3 border-r border-[#3e3e42] pr-4 mr-2">
                    <button onClick={() => setIsTextEnabled(!isTextEnabled)} className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all ${isTextEnabled ? 'bg-[#0e639c]/20 text-blue-400 font-bold' : 'text-[#666] hover:text-[#999]'}`}>{isTextEnabled ? <CheckSquare className="w-3 h-3" /> : <SquareIcon className="w-3 h-3" />}<span>{t('toggleText')}</span></button>
                    <button onClick={() => setIsImageEnabled(!isImageEnabled)} className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all ${isImageEnabled ? 'bg-purple-500/20 text-purple-400 font-bold' : 'text-[#666] hover:text-[#999]'}`}>{isImageEnabled ? <CheckSquare className="w-3 h-3" /> : <SquareIcon className="w-3 h-3" />}<span>{t('toggleImage')}</span></button>
                 </div>
                 <div className="flex items-center gap-2 hover:bg-[#333] px-2 py-0.5 rounded cursor-pointer"><Globe className="w-3 h-3 text-[#858585]" /><select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent outline-none text-[#cccccc] cursor-pointer appearance-none">{LANGUAGES.map(l => <option key={l} value={l} className="bg-[#252526]">{l}</option>)}</select></div>
                 <div className="flex items-center gap-2 hover:bg-[#333] px-2 py-0.5 rounded cursor-pointer"><span className="text-[#858585]">{t('lblTone')}:</span><select value={tone} onChange={(e) => setTone(e.target.value)} className="bg-transparent outline-none text-[#007acc] font-medium cursor-pointer appearance-none">{TONES.map(t => <option key={t} value={t} className="bg-[#252526] text-[#cccccc]">{t}</option>)}</select></div>
                 <div className="flex items-center gap-2 hover:bg-[#333] px-2 py-0.5 rounded cursor-pointer border-l border-[#3e3e42] pl-3">{postMode === 'short' ? <Zap className="w-3 h-3 text-yellow-500" /> : <BookOpen className="w-3 h-3 text-purple-400" />}<select value={postMode} onChange={(e) => setPostMode(e.target.value as PostMode)} className="bg-transparent outline-none text-[#cccccc] font-medium cursor-pointer appearance-none"><option value="short" className="bg-[#252526]">{t('modeShort')}</option><option value="deep" className="bg-[#252526]">{t('modeDeep')}</option></select></div>
                 <div onClick={() => setIncludeLongRead(!includeLongRead)} className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer transition-all ${includeLongRead ? 'bg-[#333] text-green-400' : 'text-[#666] hover:text-[#999]'}`}><Link className="w-3 h-3" /><span className="font-bold">{t('modeLongRead')}</span></div>
                 <div className="ml-auto"><button onClick={() => setShowPromptEditor(!showPromptEditor)} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${showPromptEditor ? 'bg-[#3c3c3c] text-white' : 'bg-transparent text-[#858585] hover:bg-[#3c3c3c] hover:text-[#cccccc]'}`}><Sparkles className="w-3 h-3" />{t('lblPrompt')}</button></div>
            </div>

            {showPromptEditor && (
                <div className="absolute top-[72px] right-0 left-0 bg-[#1e1e1e] border-b border-[#3e3e42] p-4 shadow-2xl z-30 animate-fade-in flex flex-col gap-2">
                     <div className="flex justify-between items-center text-xs text-[#858585] uppercase font-bold tracking-wider mb-1">
                        <span>{t('promptEditorTitle')}</span>
                        <div className="flex gap-2"><button onClick={() => setCustomSystemPrompt(modelConfig.systemPrompt || '')} className="hover:text-white flex items-center gap-1"><RotateCcw className="w-3 h-3" /> {t('promptReset')}</button><button onClick={() => setShowPromptEditor(false)} className="hover:text-white"><X className="w-4 h-4" /></button></div>
                     </div>
                     <textarea value={customSystemPrompt} onChange={(e) => setCustomSystemPrompt(e.target.value)} className="w-full h-32 bg-[#252526] border border-[#3e3e42] focus:border-[#007acc] rounded-sm p-3 text-xs text-[#cccccc] font-mono outline-none resize-none" placeholder={t('promptPlaceholder')} />
                     <div className="flex justify-end pt-2"><button onClick={() => setShowPromptEditor(false)} className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-4 py-1.5 rounded-sm text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"><Check className="w-3.5 h-3.5" /> {t('btnSavePrompt')}</button></div>
                </div>
            )}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
            <div className="flex-1 flex flex-col min-w-[300px] bg-[#1e1e1e] relative">
                <GenerationProgress state={genLoading !== LoadingState.IDLE ? genLoading : pubLoading} />
                <div className="h-9 px-3 flex items-center justify-between bg-[#1e1e1e] select-none shrink-0 border-b border-[#252526]">
                    <div className="flex items-center gap-2 mr-4 border-r border-[#3e3e42] pr-4 h-full"><FileCode className="w-3.5 h-3.5 text-yellow-500" /><span className="text-[10px] font-bold text-[#858585] uppercase tracking-wider">{t('editorAreaLabel')}</span></div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => insertTag('b')} className="p-1 rounded hover:bg-[#3c3c3c] text-[#858585]"><Bold className="w-3.5 h-3.5" /></button>
                        <button onClick={() => insertTag('i')} className="p-1 rounded hover:bg-[#3c3c3c] text-[#858585]"><Italic className="w-3.5 h-3.5" /></button>
                        <button onClick={() => insertTag('u')} className="p-1 rounded hover:bg-[#3c3c3c] text-[#858585]"><Underline className="w-3.5 h-3.5" /></button>
                        <button onClick={() => insertTag('tg-spoiler')} className="p-1 rounded hover:bg-[#3c3c3c] text-[#858585]"><EyeOff className="w-3.5 h-3.5" /></button>
                        <div className="w-[1px] h-3 bg-[#3e3e42] mx-1"></div>
                        <div className="relative" ref={magicMenuRef}>
                            <button onClick={() => setShowMagicMenu(!showMagicMenu)} className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${showMagicMenu ? 'bg-purple-900/50 text-purple-400' : 'text-[#858585] hover:text-purple-400 hover:bg-[#2d2d2d]'}`}><Wand2 className="w-3 h-3" /> {t('magicTitle').split(' ')[1]}</button>
                            {showMagicMenu && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-[#252526] border border-[#3e3e42] rounded shadow-2xl z-50 animate-fade-in flex flex-col p-1">
                                    {[{ id: 'shorten', label: t('magicShorten') }, { id: 'expand', label: t('magicExpand') }, { id: 'emojify', label: t('magicEmojify') }, { id: 'fix_grammar', label: t('magicFix') }, { id: 'rewrite_variations', label: t('magicRewrite') }].map(action => (
                                        <button key={action.id} onClick={() => handleMagicAction(action.id)} className="text-left px-2 py-1.5 hover:bg-[#094771] text-xs text-[#cccccc] rounded-sm flex items-center gap-2"><Zap className="w-3 h-3 text-purple-400" />{action.label}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {generatedText && <button onClick={() => { navigator.clipboard.writeText(generatedText); showToast(t('copy'), 'info'); }} className="text-[#858585] hover:text-white flex items-center gap-1 text-[10px] ml-auto"><Copy className="w-3 h-3" /> {t('copy')}</button>}
                </div>
                <div className="flex-1 relative min-h-0 bg-[#1e1e1e]">
                    <textarea ref={editorRef} value={generatedText} onChange={(e) => setGeneratedText(e.target.value)} className="w-full h-full bg-[#1e1e1e] p-4 text-sm font-mono text-[#d4d4d4] resize-none outline-none leading-relaxed selection:bg-[#264f78]" spellCheck={false} placeholder="// Generated HTML..." />
                    {!generatedText && <div className="absolute top-16 left-4 right-4 pointer-events-none opacity-30 select-none"><div className="text-xs text-[#666] flex flex-col gap-2"><span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> {t('editorAreaHint')}</span></div></div>}
                </div>
                <div className={`h-6 px-4 flex items-center justify-between border-t border-[#252526] text-[10px] font-mono select-none shrink-0 ${isOverLimit && !willAutoSplit ? 'bg-red-900/30' : (isOverLimit && willAutoSplit ? 'bg-blue-900/30' : (isNearLimit ? 'bg-yellow-900/20' : 'bg-[#007acc]'))}`}>
                    <div className="flex items-center gap-4 text-white"><span>{generatedImage ? t('limitCaption') : t('limitText')}</span><div className={`flex items-center gap-1.5 font-bold`}>{isOverLimit && !willAutoSplit && <AlertTriangle className="w-3 h-3 text-white" />}{isOverLimit && willAutoSplit && <Info className="w-3 h-3 text-white" />}<span>{charCount} / {currentLimit}</span></div></div>
                    <div className="text-white/80">{willAutoSplit ? (<span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Smart Split Active</span>) : (<span>{t('words')}: <strong>{wordCount}</strong></span>)}</div>
                </div>
            </div>

            <div className="w-1 bg-[#1e1e1e] hover:bg-[#007acc] cursor-col-resize z-20 flex flex-col justify-center items-center group transition-colors select-none" onMouseDown={() => setIsResizing(true)}><GripVertical className="w-3 h-3 text-[#444] group-hover:text-white" /></div>

            <div className="flex flex-col bg-[#0e1621] relative border-l border-black/50 shadow-2xl min-h-0" style={{ width: previewWidth, minWidth: '320px', maxWidth: '800px' }}>
                 <div className="h-10 px-4 flex items-center justify-between bg-[#17212b] border-b border-black/20 z-10 shrink-0 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#f5f5f5]">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0088cc] to-[#32a8dd] flex items-center justify-center text-[10px] text-white">AP</div>
                        <div className="flex flex-col"><span className="flex items-center gap-1">{t('previewAreaLabel')} <span className="px-1 bg-[#2b5278] rounded text-[8px] opacity-70">LIVE</span></span><span className="text-[9px] text-[#6c7883] font-normal leading-none">{t('tgSubscribers')}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="flex items-center mr-2"><button onClick={() => setIsSilent(!isSilent)} className={`${isSilent ? 'text-[#54a0f8]' : 'text-[#6c7883]'}`}><MicOff className="w-3.5 h-3.5" /></button></div>
                         <div className="relative">
                             <button onClick={() => setShowMagicMenu(!showMagicMenu)} className={`p-1.5 rounded transition-all hover:bg-[#33618d] ${scheduledAt ? 'text-orange-400 bg-orange-900/20' : 'text-[#6c7883] hover:text-white'}`}><Clock className="w-3.5 h-3.5" /></button>
                             {showScheduleInput && (<div className="absolute top-full right-0 mt-2 bg-[#252526] border border-[#3e3e42] p-3 rounded shadow-xl z-50 flex flex-col gap-2 w-48 animate-fade-in"><div className="text-[10px] uppercase font-bold text-[#858585]">{t('calTime')}</div><input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="bg-[#1e1e1e] border border-[#3e3e42] text-white text-xs rounded px-2 py-1 outline-none" /><div className="flex justify-end gap-1"><button onClick={() => { setScheduledAt(''); handleScheduleSave(); }} className="text-[10px] text-[#666] hover:text-white px-2 py-1">{t('promptReset').split(' ')[0]}</button><button onClick={handleScheduleSave} className="bg-[#0e639c] text-white text-[10px] px-2 py-1 rounded hover:bg-[#1177bb]">{t('btnSave')}</button></div></div>)}
                         </div>
                         <button onClick={handlePublish} disabled={pubLoading === LoadingState.PUBLISHING || !generatedText || (isOverLimit && !willAutoSplit && charCount > 5000)} className="flex items-center gap-1.5 bg-[#2b5278] hover:bg-[#33618d] text-white px-3 py-1 rounded text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm group relative"><Send className="w-3.5 h-3.5" /><span>{pubLoading === LoadingState.PUBLISHING ? t('btnPublishing') : t('btnPublish')}</span>{activeIntegrationsCount > 1 && (<span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[9px] px-1.5 rounded-full border border-[#17212b]">{activeIntegrationsCount}</span>)}</button>
                    </div>
                </div>

                <div ref={previewScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col relative custom-scrollbar-tg items-center" style={{ backgroundColor: '#0e1621' }}>
                     {generatedText || generatedImage || isEditingImagePrompt ? (
                        <div className="flex flex-col gap-4 w-full max-w-md">
                            {previewList.map((partText, index) => {
                                const showImage = index === 0 && (generatedImage || isEditingImagePrompt || genLoading === LoadingState.GENERATING_IMAGE);
                                if (!partText.trim() && !showImage) return null;
                                return (
                                    <div key={index} className="self-start bg-[#182533] rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-none shadow-sm flex flex-col border border-black/5 w-full">
                                        {showImage && (
                                            <div className="relative group/image">
                                                {isEditingImagePrompt ? (
                                                    <div className="w-full bg-[#182533] p-3 border-b border-white/5 animate-fade-in">
                                                        <div className="flex justify-between items-center mb-2"><span className="text-[10px] uppercase font-bold text-[#8696a5]">{t('imagePromptLabel')}</span><button onClick={() => setIsEditingImagePrompt(false)} className="text-[#6c7883] hover:text-white"><Trash2 className="w-3 h-3" /></button></div>
                                                        <textarea value={currentImagePrompt} onChange={e => setCurrentImagePrompt(e.target.value)} className="w-full h-24 bg-[#0e1621] text-xs text-[#cccccc] p-2 rounded border border-[#2b5278] outline-none resize-none mb-2 font-mono" />
                                                        <div className="flex gap-2"><button onClick={handleRegenerateImage} className="flex-1 bg-[#2b5278] hover:bg-[#33618d] text-white text-xs py-1.5 rounded font-medium flex items-center justify-center gap-1"><RefreshCw className="w-3 h-3" /> {t('btnApply')}</button><button onClick={() => setIsEditingImagePrompt(false)} className="flex-1 bg-[#1f2c3a] hover:bg-[#2c3945] text-[#8696a5] text-xs py-1.5 rounded font-medium">{t('btnCancel')}</button></div>
                                                    </div>
                                                ) : genLoading === LoadingState.GENERATING_IMAGE ? (
                                                    <div className="aspect-video w-full bg-[#1f2c3a] flex flex-col items-center justify-center animate-pulse gap-2 p-8 rounded-tl-xl rounded-tr-xl">
                                                        {imageProcessingType ? (<div className="flex flex-col items-center gap-2"><Wand2 className="w-6 h-6 text-purple-400 animate-spin" /><span className="text-xs text-[#6c7883]">Processing...</span></div>) : (<><RefreshCw className="w-6 h-6 text-[#54a0f8] animate-spin" /><span className="text-xs text-[#6c7883]">{t('imageLoading')}</span></>)}
                                                    </div>
                                                ) : generatedImage ? (
                                                    <div className="w-full cursor-pointer relative block group/preview">
                                                        <img src={generatedImage.startsWith('http') ? generatedImage : `data:image/png;base64,${generatedImage}`} alt="Post" className="w-full h-auto object-cover block rounded-tl-xl rounded-tr-xl" />
                                                        {generatedImage.startsWith('http') && (<div className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white/80"><CloudUpload className="w-3 h-3" /></div>)}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                            <div className="flex items-center gap-3 bg-black/30 p-2 rounded-full backdrop-blur-md border border-white/10">
                                                                <button onClick={handleRegenerateImage} className="text-white hover:text-blue-400 p-2 rounded-full hover:bg-white/10" title={t('btnRegenerateImage')}><RefreshCw className="w-4 h-4" /></button>
                                                                <div className="relative" ref={imageMagicMenuRef}>
                                                                    <button onClick={() => setShowImageMagicMenu(!showImageMagicMenu)} className="p-2 rounded-full hover:bg-white/10 text-white hover:text-purple-400"><Wand2 className="w-4 h-4" /></button>
                                                                    {showImageMagicMenu && (<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-44 bg-[#252526] border border-[#3e3e42] rounded shadow-2xl z-50 animate-fade-in flex flex-col p-1"><button onClick={() => handleImageAction('rembg')} className="text-left px-2 py-1.5 hover:bg-[#094771] text-xs text-[#cccccc] rounded-sm flex items-center gap-2"><Scissors className="w-3 h-3 text-orange-400" /> Remove BG</button><button onClick={() => handleImageAction('upscale')} className="text-left px-2 py-1.5 hover:bg-[#094771] text-xs text-[#cccccc] rounded-sm flex items-center gap-2"><ZoomIn className="w-3 h-3 text-blue-400" /> Upscale (2x)</button></div>)}
                                                                </div>
                                                                <button onClick={() => setIsEditingImagePrompt(true)} className="text-white hover:text-green-400 p-2 rounded-full hover:bg-white/10"><Edit2 className="w-4 h-4" /></button>
                                                                <button onClick={() => fileInputRef.current?.click()} className="text-white hover:text-yellow-400 p-2 rounded-full hover:bg-white/10"><ImagePlus className="w-4 h-4" /></button>
                                                            </div>
                                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                        {partText.trim() && (
                                            <div className="px-3 py-2 pb-1 relative min-w-[120px] break-words">
                                                <div className="text-[15px] leading-relaxed text-white whitespace-pre-wrap break-words font-sans">{renderHtmlPreview(partText)}</div>
                                                <div className="flex justify-end items-center gap-1 mt-1 select-none pt-1"><span className="text-[#6c7883] text-[11px] hover:underline cursor-pointer">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span><Eye className="w-3 h-3 text-[#6c7883]" /></div>
                                            </div>
                                        )}
                                        {index === 0 && inlineButtons.length > 0 && (<div className="p-1 space-y-1">{inlineButtons.map((btn, idx) => (<div key={idx} className="bg-[#1f2c3a]/50 border border-transparent rounded flex items-center justify-center py-2 px-4"><span className="text-[#54a0f8] text-xs font-bold">{btn.text}</span></div>))}</div>)}
                                    </div>
                                );
                            })}
                        </div>
                     ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-80 animate-fade-in">
                             <div className="bg-[#182533] p-6 rounded-2xl flex flex-col items-center max-w-[250px] text-center shadow-2xl border border-[#2b2b2b]">
                                 <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0088cc] to-[#00aaff] flex items-center justify-center mb-4 shadow-lg"><Smartphone className="w-8 h-8 text-white" /></div>
                                 <h4 className="text-sm font-bold text-[#e0e0e0] mb-2">{t('emptyStateTitle')}</h4>
                                 <p className="text-xs text-[#8696a5] leading-relaxed">{t('emptyStateDesc')}</p>
                             </div>
                        </div>
                     )}
                     {(generatedText || generatedImage) && (
                         <div className="mt-4 self-start max-w-md w-full flex justify-center">
                            {!showButtonInput ? (
                                <button onClick={() => setShowButtonInput(true)} className="text-[10px] text-[#54a0f8] hover:underline flex items-center gap-1 bg-[#182533] px-3 py-1 rounded-full border border-[#54a0f8]/20"><Plus className="w-3 h-3" /> {t('btnAddButton')}</button>
                            ) : (
                                <div className="bg-[#182533] p-2 rounded-lg border border-[#0e1621] w-full animate-fade-in shadow-lg">
                                    <div className="flex flex-col gap-2"><input autoFocus type="text" placeholder={t('btnText')} value={newButtonText} onChange={e => setNewButtonText(e.target.value)} className="bg-[#0e1621] text-xs text-white p-1.5 rounded outline-none border border-[#2b5278]" /><input type="text" placeholder={t('btnUrl')} value={newButtonUrl} onChange={e => setNewButtonUrl(e.target.value)} className="bg-[#0e1621] text-xs text-white p-1.5 rounded outline-none border border-[#2b5278]" /><div className="flex gap-2"><button onClick={() => { if (newButtonText && newButtonUrl) { setInlineButtons([...inlineButtons, { text: newButtonText, url: newButtonUrl }]); setNewButtonText(''); setNewButtonUrl(''); setShowButtonInput(false); }}} className="flex-1 bg-[#2b5278] text-white text-[10px] py-1 rounded hover:bg-[#33618d]">{t('btnApply').split(' ')[0]}</button><button onClick={() => setShowButtonInput(false)} className="flex-1 bg-[#1f2c3a] text-[#858585] text-[10px] py-1 rounded hover:text-white">{t('btnCancel')}</button></div></div>
                                </div>
                            )}
                         </div>
                     )}
                </div>
            </div>
        </div>

        <div className="h-40 bg-[#1e1e1e] border-t border-[#3e3e42] flex flex-col shrink-0">
             <div className="flex items-center px-4 py-1 bg-[#1e1e1e] border-b border-[#252526] gap-6 text-[11px] uppercase font-bold text-[#858585]">
                <span onClick={() => setActiveBottomTab('output')} className={`flex items-center gap-1 cursor-pointer hover:text-white pb-1 pt-1 -mb-[1px] transition-colors ${activeBottomTab === 'output' ? 'text-white border-b border-[#007acc]' : ''}`}><Terminal className="w-3 h-3" /> {t('output')}</span>
                <span onClick={() => setActiveBottomTab('quota')} className={`flex items-center gap-1 cursor-pointer hover:text-white pb-1 pt-1 -mb-[1px] transition-colors ${activeBottomTab === 'quota' ? 'text-white border-b border-[#007acc]' : ''}`}><Activity className="w-3 h-3" /> {t('quotaTitle')}</span>
             </div>
             
             <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-[#cccccc] space-y-1 relative">
                {activeBottomTab === 'output' && (
                    <>
                        <div className="text-[#858585]">{t('serviceReady')}</div>
                        {errorMsg && (<div className="text-[#f14c4c]"><span className="font-bold">{t('lblError')}:</span> {errorMsg}</div>)}
                        {isLoading && (<div className="text-[#007acc]"><span className="animate-pulse">▶ {pubLoading !== LoadingState.IDLE ? t('btnPublishing') : t('btnWriting')}...</span></div>)}
                        {genLoading === LoadingState.CANCELLED && (<div className="text-yellow-500 font-bold">⚠ {t('btnCancel').toUpperCase()}</div>)}
                        {textStats && (<div className="text-[#73c991]">[SUCCESS] {t('statusDraft')}: {textStats.modelName} | {t('testLatency')}: {textStats.latencyMs}ms | {t('testTokens')}: {textStats.totalTokens}</div>)}
                        {imageStats && (<div className="text-[#b180d7]">[SUCCESS] {t('assignImage')}: {imageStats.modelName} | {t('testLatency')}: {imageStats.latencyMs}ms</div>)}
                    </>
                )}
                {activeBottomTab === 'quota' && (
                    <div className="flex flex-col gap-4 max-w-2xl">
                        <div className="flex items-start gap-4 p-3 bg-[#252526] border border-[#3e3e42] rounded">
                            <div className="w-10 h-10 rounded bg-blue-900/30 border border-blue-500/30 flex items-center justify-center"><Activity className="w-5 h-5 text-blue-400" /></div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-white mb-1">{modelConfig.textModel}</h4>
                                <div className="flex gap-6 text-[#858585]">
                                    <div className="flex flex-col"><span className="text-[10px] uppercase">{t('quotaRPM')}</span><span className="text-white font-bold">{currentLimits.rpm}</span></div>
                                    <div className="flex flex-col"><span className="text-[10px] uppercase">{t('quotaRPD')}</span><span className="text-white font-bold">{currentLimits.rpd}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                             <div className="flex justify-between text-[11px]"><span className="text-[#cccccc]">{t('quotaUsed')}: <span className="text-white font-bold">{dailyUsage}</span></span><span className="text-[#858585]">{t('quotaLeft')}: <span className={remainingToday < 10 ? 'text-red-400' : 'text-green-400'}>{remainingToday}</span></span></div>
                             <div className="h-2 w-full bg-[#333333] rounded overflow-hidden"><div className={`h-full transition-all duration-500 ${usagePercent > 90 ? 'bg-red-500' : (usagePercent > 75 ? 'bg-yellow-500' : 'bg-blue-500')}`} style={{ width: `${usagePercent}%` }}></div></div>
                             <div className="flex justify-between items-center"><p className="text-[10px] text-[#666666] italic">{t('quotaNote')}</p><button onClick={resetQuota} className="flex items-center gap-1 text-[10px] text-[#858585] hover:text-white transition-colors"><RotateCcw className="w-3 h-3" /> {t('quotaReset')}</button></div>
                        </div>
                    </div>
                )}
             </div>
        </div>
    </div>
  );
};