import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getAvailableModels } from '../services/geminiService';
import { ApiProvider, Model } from '../types';
import { X, Save, Lock, Server, Key, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'telegram' | 'models';

const GEMINI_IMAGE_MODELS = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image (Standard)' },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3.0 Pro Image (High Quality)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    telegramConfig, setTelegramConfig, 
    modelConfig, setModelConfig, 
    apiConfig, setApiConfig,
    availableModels, setAvailableModels,
    showToast,
    t 
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<Tab>('telegram');
  
  // Telegram State
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  
  // API & Model State
  const [provider, setProvider] = useState<ApiProvider>('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  
  const [textModel, setTextModel] = useState('');
  const [imageModel, setImageModel] = useState('');
  
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBotToken(telegramConfig.botToken);
      setChannelId(telegramConfig.channelId);
      
      setProvider(apiConfig.provider);
      setGeminiKey(apiConfig.geminiKey || '');
      setOpenRouterKey(apiConfig.openRouterKey || '');
      
      setTextModel(modelConfig.textModel);
      setImageModel(modelConfig.imageModel);
      
      // Initial fetch if list is empty and using Gemini (default list)
      if (apiConfig.provider === 'gemini' && availableModels.length === 0) {
        handleFetchModels('gemini', apiConfig.geminiKey);
      }
    }
  }, [isOpen]);

  const handleFetchModels = async (p: ApiProvider, key: string) => {
    setIsFetchingModels(true);
    try {
      const models = await getAvailableModels({ 
        ...apiConfig,
        provider: p, 
        geminiKey: p === 'gemini' ? key : apiConfig.geminiKey, 
        openRouterKey: p === 'openrouter' ? key : apiConfig.openRouterKey 
      });
      setAvailableModels(models);
      
      // Auto-select first model if current selection is invalid or empty
      if (models.length > 0) {
        // If current model isn't in the new list, pick the first one
        if (!models.find(m => m.id === textModel)) {
          setTextModel(models[0].id);
        }
      }
    } catch (e) {
      showToast(
        t('toastFetchModelsFailed').replace(
          '{message}',
          (e as any)?.message || ''
        ),
        'error'
      );
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleSave = () => {
    setTelegramConfig({ ...telegramConfig, botToken, channelId });
    setApiConfig({ 
        ...apiConfig,
        provider, 
        geminiKey, 
        openRouterKey 
    });
    setModelConfig({ 
        ...modelConfig,
        textModel, 
        imageModel 
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl transform transition-all flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            {t('configTitle')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'telegram' 
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {t('tabTelegram')}
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'models' 
                ? 'text-purple-400 border-b-2 border-purple-400 bg-slate-800' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {t('tabModels')}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {activeTab === 'telegram' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('botTokenLabel')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder={t('botTokenPlaceholder')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{t('botTokenHint')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('channelIdLabel')}
                </label>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder={t('channelIdPlaceholder')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">{t('channelIdHint')}</p>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
             <div className="space-y-5 animate-fade-in">
                
                {/* Provider Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('providerLabel')}
                  </label>
                  <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                    <button 
                      onClick={() => { setProvider('gemini'); handleFetchModels('gemini', geminiKey); }}
                      className={`flex-1 py-1.5 text-sm rounded-md transition-all ${provider === 'gemini' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Google Gemini
                    </button>
                    <button 
                      onClick={() => { setProvider('openrouter'); setAvailableModels([]); }}
                      className={`flex-1 py-1.5 text-sm rounded-md transition-all ${provider === 'openrouter' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      OpenRouter
                    </button>
                  </div>
                </div>

                {/* Gemini Key Input */}
                {provider === 'gemini' && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      {t('apiKeyLabel')}
                    </label>
                    <div className="relative">
                        <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          value={geminiKey}
                          onChange={(e) => setGeminiKey(e.target.value)}
                          placeholder={t('geminiKeyPlaceholder')}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{t('geminiHint')}</p>
                  </div>
                )}

                {/* OpenRouter Key Input */}
                {provider === 'openrouter' && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      {t('apiKeyLabel')}
                    </label>
                    <div className="flex gap-2">
                       <div className="relative flex-1">
                        <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          value={openRouterKey}
                          onChange={(e) => setOpenRouterKey(e.target.value)}
                          placeholder={t('openRouterKeyPlaceholder')}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                      <button 
                        onClick={() => handleFetchModels('openrouter', openRouterKey)}
                        disabled={isFetchingModels || !openRouterKey}
                        className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-3 rounded-lg"
                        title={t('fetchModels')}
                      >
                        <RefreshCw className={`w-4 h-4 ${isFetchingModels ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{t('openRouterHint')}</p>
                  </div>
                )}

                {/* Text Model Selector */}
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">
                      {t('textModelLabel')}
                   </label>
                   <select 
                      value={textModel}
                      onChange={(e) => setTextModel(e.target.value)}
                      disabled={availableModels.length === 0}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                   >
                      <option value="" disabled>Select a model...</option>
                      {availableModels.map(m => (
                         <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                   </select>
                </div>

                {/* Image Model Selector (Always Gemini for now) */}
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">
                      {t('imageModelLabel')}
                   </label>
                   <select 
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                   >
                      {GEMINI_IMAGE_MODELS.map(m => (
                         <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                   </select>
                </div>
             </div>
          )}

        </div>

        <div className="p-6 pt-0 mt-auto flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {t('saveConfig')}
          </button>
        </div>
      </div>
    </div>
  );
};