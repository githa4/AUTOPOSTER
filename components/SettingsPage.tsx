import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { getAvailableModels, testTextGeneration, generatePostImage } from '../services/geminiService';
import { testTelegramConnection } from '../services/telegramService';
import { testImageGeneration } from '../services/replicateService';
import { ApiProvider, Model, ImageProvider, IntegrationProvider, Integration, ApiKeyEntry } from '../types';
import { supabase } from '../lib/supabaseClient'; 
import { ModelManagerModal } from './ModelManager'; 
// Add missing Cpu and HardDrive imports
import { 
    Save, Server, RefreshCw, MessageSquare, 
    Sliders, Globe, Settings, Terminal, Activity, Database,
    ChevronDown, X, CheckCircle2, AlertCircle, Plus, Share2, Facebook, Trash2, Edit3, Star, Brain, Image as ImageIcon, Palette, Youtube, LayoutGrid, Clock, Coins, Hash as HashIcon, Eye,
    Cpu, HardDrive
} from 'lucide-react';

const GEMINI_IMAGE_MODELS = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image (Standard)', description: "Fast, efficient image generation." },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3.0 Pro Image (High Quality)', description: "High-fidelity, text-following image generation." },
];

const REPLICATE_IMAGE_MODELS = [
    { id: 'black-forest-labs/flux-schnell', name: 'FLUX.1 Schnell', description: "Fastest state-of-the-art open model." },
    { id: 'black-forest-labs/flux-dev', name: 'FLUX.1 Dev', description: "Professional grade, high detail." },
    { id: 'stability-ai/sdxl', name: 'Stable Diffusion XL (SDXL)', description: "Classic reliable high-res generation." },
    { id: 'recraft-ai/recraft-v3', name: 'Recraft V3', description: "Best for Vector Art and Illustrations." },
    { id: 'ai-forever/kandinsky-2.2', name: 'Kandinsky 2.2', description: "Russian-native artistic model." },
];

type SettingsTab = 'gemini' | 'kie' | 'openrouter' | 'replicate' | 'telegram';

// --- API WALLET COMPONENT ---
const ApiWallet = ({ provider, keys, onAdd, onUpdate, onDelete, onSetDefault, onFetch }: { 
    provider: ApiProvider, 
    keys: ApiKeyEntry[], 
    onAdd: (name: string, p: ApiProvider, k: string) => void,
    onUpdate: (id: string, name: string, k: string) => void,
    onDelete: (id: string) => void,
    onSetDefault: (id: string) => void,
    onFetch: (p: ApiProvider, k: string) => void
}) => {
    const [showAdd, setShowAdd] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const { t } = useAppContext();

    const providerKeys = keys.filter(k => k.provider === provider);

    const handleSubmit = () => {
        if (!key.trim()) return;
        if (editId) {
            onUpdate(editId, name, key);
            setEditId(null);
        } else {
            onAdd(name, provider, key);
        }
        setShowAdd(false);
        setName('');
        setKey('');
    };

    const handleEdit = (k: ApiKeyEntry) => {
        setName(k.name);
        setKey(k.key);
        setEditId(k.id);
        setShowAdd(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-[10px] font-bold text-[#666] uppercase tracking-wider">{t('walletKeysTitle')} ({providerKeys.length})</h4>
                {!showAdd && (
                    <button 
                        onClick={() => setShowAdd(true)}
                        className="text-[10px] bg-[#3e3e42] hover:bg-[#4e4e55] text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" /> {t('btnAddKey')}
                    </button>
                )}
            </div>

            {showAdd && (
                <div className="bg-[#1e1e1e] p-4 rounded border border-[#3e3e42] animate-fade-in mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-[10px] font-bold text-[#666] uppercase mb-1 block">{t('keyNameLabel')}</label>
                            <input 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-[#252526] border border-[#3e3e42] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#007acc]"
                                placeholder={t('keyNamePlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[#666] uppercase mb-1 block">{t('keyValueLabel')}</label>
                            <input 
                                type="password"
                                value={key}
                                onChange={e => setKey(e.target.value)}
                                className="w-full bg-[#252526] border border-[#3e3e42] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#007acc]"
                                placeholder={t('keyValuePlaceholder')}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => { setShowAdd(false); setEditId(null); setName(''); setKey(''); }} className="px-3 py-1.5 text-xs text-[#858585] hover:text-white">{t('btnCancel')}</button>
                        <button onClick={handleSubmit} className="bg-[#007acc] hover:bg-[#1177bb] text-white px-4 py-1.5 rounded text-xs font-bold">{editId ? t('btnUpdateKey') : t('btnSaveKey')}</button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {providerKeys.length === 0 ? (
                    <div className="p-8 text-center bg-[#1e1e1e] border border-dashed border-[#333] rounded text-xs text-[#666]">
                        {t('noKeysMessage')}
                    </div>
                ) : (
                    providerKeys.map(k => (
                        <div key={k.id} className={`flex items-center justify-between p-3 bg-[#1e1e1e] border rounded-md transition-all ${k.isDefault ? 'border-[#007acc]/50 bg-[#007acc]/5' : 'border-[#333]'}`}>
                            <div className="flex items-center gap-3">
                                <div onClick={() => onSetDefault(k.id)} className={`p-1.5 rounded cursor-pointer transition-colors ${k.isDefault ? 'text-yellow-400' : 'text-[#444] hover:text-[#888]'}`} title={t('ctxSetActive')}>
                                    <Star className={`w-4 h-4 ${k.isDefault ? 'fill-current' : ''}`} />
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                        {k.name}
                                        {k.isDefault && <span className="text-[8px] bg-[#007acc] px-1.5 py-0.5 rounded uppercase text-white font-black">{t('activeKeyBadge')}</span>}
                                    </div>
                                    <div className="text-[10px] font-mono text-[#555] truncate max-w-[150px]">
                                        ••••{k.key.slice(-6)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => onFetch(provider, k.key)}
                                    className="p-2 hover:bg-[#333] text-[#858585] hover:text-[#54a0f8] rounded transition-colors"
                                    title={t('btnSyncModels')}
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                    onClick={() => handleEdit(k)}
                                    className="p-2 hover:bg-[#333] text-[#858585] hover:text-white rounded transition-colors"
                                    title={t('ctxRename')}
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                    onClick={() => onDelete(k.id)}
                                    className="p-2 hover:bg-[#333] text-[#858585] hover:text-red-400 rounded transition-colors"
                                    title={t('ctxDelete')}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const SearchableSelect = ({ value, onChange, options, placeholder, favorites }: any) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { t } = useAppContext();

    const filtered = options.filter((opt: any) => 
        (opt.name || '').toLowerCase().includes(search.toLowerCase()) || 
        (opt.id || '').toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find((opt: any) => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2.5 text-xs text-white cursor-pointer flex justify-between items-center group hover:border-[#555] transition-colors"
            >
                <span className={selectedOption ? 'text-white' : 'text-[#666]'}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown className={`w-3 h-3 text-[#666] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-[#252526] border border-[#3e3e42] rounded shadow-2xl flex flex-col max-h-60 overflow-hidden animate-fade-in">
                    <div className="p-2 border-b border-[#3e3e42] bg-[#1e1e1e]">
                        <input 
                            autoFocus
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('hubSearch')}
                            className="w-full bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#007acc]"
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {filtered.length === 0 && <div className="p-3 text-xs text-[#666] italic text-center">{t('hubNoModels')}</div>}
                        {filtered.map((opt: any) => {
                            const isFav = favorites?.includes(opt.id);
                            return (
                                <div 
                                    key={opt.id}
                                    onClick={() => { onChange(opt.id); setIsOpen(false); setSearch(''); }}
                                    className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer hover:bg-[#007acc] hover:text-white transition-colors ${value === opt.id ? 'bg-[#37373d] text-white' : 'text-[#ccc]'}`}
                                >
                                    <span className="truncate flex-1">{opt.name}</span>
                                    {isFav && <Star className="w-3 h-3 text-yellow-500 fill-current ml-2 shrink-0" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const ModelDetailsCard = ({ modelId, allModels, fallbackModels }: any) => {
    const { t } = useAppContext();
    const model = allModels?.find((m: any) => m.id === modelId) || fallbackModels?.find((m: any) => m.id === modelId);
    if (!model) return null;

    return (
        <div className="flex flex-col gap-1.5 animate-fade-in">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#666] bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333]">{model.id}</span>
                {model.isFree && <span className="text-[9px] bg-green-900/30 text-green-400 px-1.5 rounded border border-green-500/20 font-bold uppercase tracking-tighter">{t('badgeFree')}</span>}
            </div>
            {model.description && <p className="text-[11px] text-[#858585] line-clamp-2 leading-relaxed opacity-90">{model.description}</p>}
            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#555] font-mono">
                {model.contextLength > 0 && <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-blue-500/50" /> {t('modelTokensK').replace('{k}', String(Math.round(model.contextLength / 1000)))}</span>}
                {model.pricing && <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-500/50" /> {model.pricing.prompt}</span>}
            </div>
        </div>
    );
};

interface TestResult {
    success: boolean;
    model: string;
    latency: number;
    timestamp: number;
    tokens?: number;
    message?: string;
    output?: string; 
}

const CloudInspectorModal = ({ isOpen, onClose, userId }: { isOpen: boolean, onClose: () => void, userId?: string }) => {
    const { t } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [integrationsData, setIntegrationsData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId) { fetchData(); }
    }, [isOpen, userId]);

    const fetchData = async () => {
        setLoading(true); setError(null);
        try {
            const { data: profile, error: profError } = await supabase.from('profiles').select('settings, updated_at').eq('id', userId).single();
            if (profError) throw profError;
            setProfileData(profile);
            const { data: integrations, error: intError } = await supabase
                .from('integrations')
                .select('*')
                .eq('user_id', userId);
            if (intError) throw intError;
            setIntegrationsData(integrations);
        } catch (e: any) { setError(e.message); } finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1e1e1e] border border-[#3e3e42] rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-[#3e3e42] flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2"><Database className="w-4 h-4 text-blue-400" /> {t('btnCloudViewer')}</h3>
                    <button onClick={onClose} className="text-[#858585] hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-[#111]">
                    {loading ? (<div className="p-8 text-center text-[#858585] flex flex-col items-center gap-2"><RefreshCw className="w-6 h-6 animate-spin" /> {t('fetching')}</div>) : error ? (<div className="p-4 text-red-400 font-mono text-xs bg-red-900/10 m-4 rounded border border-red-500/20"><span className="font-bold">{t('lblError')}:</span> {error}</div>) : (
                        <div className="divide-y divide-[#333]">
                            <div className="p-4">
                                <div className="text-[10px] uppercase font-bold text-[#666] mb-2 flex justify-between"><span>profiles</span>{profileData?.updated_at && <span>{t('benchUpdate')}: {new Date(profileData.updated_at).toLocaleTimeString()}</span>}</div>
                                <pre className="text-[10px] font-mono text-green-400 bg-[#0d0d0d] p-3 rounded border border-[#333] overflow-x-auto">{JSON.stringify(profileData?.settings || {}, null, 2)}</pre>
                            </div>
                            <div className="p-4">
                                <div className="text-[10px] uppercase font-bold text-[#666] mb-2">integrations</div>
                                <pre className="text-[10px] font-mono text-blue-400 bg-[#0d0d0d] p-3 rounded border border-[#333] overflow-x-auto">{JSON.stringify(integrationsData || [], null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-3 border-t border-[#3e3e42] bg-[#252526] flex justify-end">
                    <button onClick={fetchData} className="mr-auto text-xs text-[#858585] hover:text-white flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {t('refresh')}</button>
                    <button onClick={onClose} className="px-4 py-1.5 bg-[#3e3e42] hover:bg-[#4e4e55] text-white text-xs rounded font-bold">{t('promptClose')}</button>
                </div>
            </div>
        </div>
    );
};

const ModelAssignmentRow = ({
    title,
    description,
    icon: Icon,
    iconColor,
    provider,
    setProvider,
    getFirstModelId,
    providerOptions,
    model,
    setModel,
    modelOptions,
    type,
    availableModels,
    getKeys,
    onOpenWallet,
    onSyncModels,
    onOpenManager,
    onAddCustomModel,
}: any) => {
    const { favoriteModelIds, t } = useAppContext();
    const sortedOptions = useMemo(() => {
        return [...modelOptions].sort((a, b) => {
            const aFav = favoriteModelIds.includes(a.id);
            const bFav = favoriteModelIds.includes(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return 0;
        });
    }, [modelOptions, favoriteModelIds]);

    const keys = getKeys?.() || {};
    const activeKey = (keys as any)[provider] || '';
    const hasActiveKey = Boolean(activeKey);

    const [customIdInput, setCustomIdInput] = useState('');

    const handleAddClick = () => {
        if (customIdInput.trim() && onAddCustomModel) {
            onAddCustomModel(customIdInput.trim());
            setCustomIdInput('');
        }
    };

    return (
        <div className="bg-[#252526] border border-[#3e3e42] rounded-lg p-0 overflow-hidden shadow-sm hover:border-[#505050] transition-all flex flex-col">
            <div className="p-5 flex flex-col lg:flex-row lg:items-start gap-6 border-b border-[#3e3e42]">
                <div className="flex items-start gap-4 lg:w-1/3 shrink-0">
                    <div className={`p-3 rounded-lg bg-[#1e1e1e] border border-[#3e3e42] ${iconColor} bg-opacity-10 shrink-0`}><Icon className="w-6 h-6" /></div>
                    <div><h4 className="text-base font-bold text-white leading-tight">{title}</h4><p className="text-xs text-[#858585] mt-1 leading-relaxed">{description}</p></div>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div>
                        <label className="text-[10px] text-[#666] font-bold uppercase mb-1.5 block">{t('lblProvider')}</label>
                        <div className="relative">
                            <select
                                value={provider}
                                onChange={e => {
                                    const nextProvider = e.target.value;
                                    setProvider(nextProvider);
                                    const first = getFirstModelId?.(nextProvider) || '';
                                    setModel(first);
                                }}
                                className="w-full bg-[#1e1e1e] text-xs text-white border border-[#3e3e42] rounded px-3 py-2.5 outline-none appearance-none shadow-sm transition-colors"
                            >
                                {providerOptions.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-3 h-3 text-[#666] pointer-events-none" />
                        </div>
                        {!hasActiveKey && type !== 'image' && (
                            <div className="mt-2 rounded border border-yellow-500/20 bg-yellow-900/10 px-3 py-2 text-[10px] text-yellow-200">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono">{t('integrationsNoActiveKey')}</span>
                                    <button
                                        onClick={() => onOpenWallet?.(provider)}
                                        className="text-[10px] font-bold text-[#54a0f8] hover:underline"
                                    >
                                        {t('integrationsOpenWallet')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-[#666] font-bold uppercase mb-1.5 block flex justify-between"><span>{t('lblModel')}</span><span onClick={onOpenManager} className="text-[9px] text-[#007acc] hover:underline cursor-pointer flex items-center gap-1"><Settings className="w-3 h-3" /> {t('refresh').split(' ')[0]}</span></label>
                        <div className="flex gap-2"><div className="flex-1"><SearchableSelect value={model} onChange={setModel} options={sortedOptions} placeholder={t('selectModel')} favorites={favoriteModelIds} /></div></div>
                        {sortedOptions.length === 0 && (
                            <div className="mt-2 rounded border border-[#333] bg-[#1e1e1e] px-3 py-2 text-[10px] text-[#aaa]">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono">{t('integrationsNoModelsHint')}</span>
                                    <button
                                        onClick={() => {
                                            if (!hasActiveKey) onOpenWallet?.(provider);
                                            else onSyncModels?.(provider);
                                        }}
                                        className="text-[10px] font-bold text-[#54a0f8] hover:underline"
                                    >
                                        {hasActiveKey ? t('integrationsSyncModels') : t('integrationsOpenWallet')}
                                    </button>
                                </div>
                            </div>
                        )}
                        {onAddCustomModel && provider === 'replicate' && (<div className="mt-2 flex items-center gap-2"><input value={customIdInput} onChange={(e) => setCustomIdInput(e.target.value)} placeholder="Custom ID" className="flex-1 bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1.5 text-[10px] text-white outline-none focus:border-[#007acc]" onKeyDown={(e) => e.key === 'Enter' && handleAddClick()} /><button onClick={handleAddClick} disabled={!customIdInput.trim()} className="bg-[#3e3e42] hover:bg-[#4e4e55] text-white p-1.5 rounded disabled:opacity-50 transition-colors"><Plus className="w-3.5 h-3.5" /></button></div>)}
                    </div>
                </div>
            </div>
            <div className="bg-[#1e1e1e]/30 p-5 pt-2"><ModelDetailsCard modelId={model} allModels={availableModels} fallbackModels={modelOptions as any} /><ModelTestControl provider={provider} modelId={model} type={type} getKeys={getKeys} allModels={availableModels} fallbackModels={modelOptions as any} /></div>
        </div>
    );
};

const ModelTestControl = ({ provider, modelId, type, getKeys, allModels, fallbackModels = [] }: any) => {
    const { t, apiConfig } = useAppContext();
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);

    const modelDetails = fallbackModels.find((m: any) => m.id === modelId) || allModels.find((m: any) => m.id === modelId);

    const runTest = async () => {
        if (!modelId) return;
        setTesting(true); setResult(null);
        const keys = getKeys();
        let activeKey = (keys as any)[provider] || '';
        if (!activeKey) {
            setResult({
                success: false,
                model: modelId,
                latency: 0,
                timestamp: Date.now(),
                message: t('errApiKeyMissing'),
            });
            setTesting(false);
            return;
        }
        const start = Date.now();
        try {
            let tokens = 0; let outputContent = '';
            if (type === 'text') { const res = await testTextGeneration(modelId, provider as ApiProvider, activeKey); tokens = res.tokens; outputContent = res.output; } 
            else { if (provider === 'replicate') { const res = await testImageGeneration(modelId, activeKey); outputContent = res.base64; } else { const res = await generatePostImage("A futuristic robot head", modelId, { ...apiConfig, geminiKey: activeKey }, "Realistic"); outputContent = res.base64; } }
            setResult({ success: true, model: modelId, latency: Date.now() - start, timestamp: Date.now(), tokens, output: outputContent });
        } catch (e: any) { setResult({ success: false, model: modelId, latency: Date.now() - start, timestamp: Date.now(), message: e.message }); } finally { setTesting(false); }
    };

    return (
        <div className="mt-4 border-t border-[#3e3e42] pt-3">
             <div className="flex justify-between items-center mb-2"><span className="text-[10px] uppercase font-bold text-[#666]">{t('btnTest')}</span><button onClick={runTest} disabled={testing || !modelId} className="flex items-center gap-2 px-3 py-1 bg-[#252526] hover:bg-[#333] border border-[#3e3e42] rounded text-[10px] font-bold text-[#ccc] transition-colors disabled:opacity-50">{testing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}{testing ? t('btnTesting') : t('btnTest')}</button></div>
             {result && (
                 <div className={`p-0 rounded border text-xs animate-fade-in overflow-hidden ${result.success ? 'bg-[#1e1e1e] border-green-500/30' : 'bg-red-900/10 border-red-500/20'}`}>
                     <div className={`flex items-center justify-between px-3 py-2 border-b ${result.success ? 'bg-green-900/10 border-green-500/20' : 'bg-red-900/10 border-red-500/20'}`}><div className="flex items-center gap-2 font-bold">{result.success ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}<span className={result.success ? 'text-green-400' : 'text-red-400'}>{result.success ? t('testSuccess') : t('testFailed')}</span></div><span className="text-[10px] text-[#666] font-mono">{new Date(result.timestamp).toLocaleTimeString()}</span></div>
                     {result.success ? (<div className="flex flex-col"><div className="grid grid-cols-2 gap-px bg-[#3e3e42] text-[10px]"><div className="bg-[#1e1e1e] p-2 flex flex-col gap-1"><span className="text-[#666] font-bold uppercase">{t('testLatency')}</span><div className="flex items-center gap-1.5 font-mono text-white"><Clock className="w-3 h-3 text-[#54a0f8]" />{result.latency}ms</div></div><div className="bg-[#1e1e1e] p-2 flex flex-col gap-1"><span className="text-[#666] font-bold uppercase">{t('testTokens')}</span><div className="flex items-center gap-1.5 font-mono text-white">{type === 'text' ? <HashIcon className="w-3 h-3 text-purple-400" /> : <Coins className="w-3 h-3 text-yellow-400" />}{type === 'text' ? result.tokens : (modelDetails && 'pricing' in modelDetails ? modelDetails.pricing?.prompt : 'Per Gen')}</div></div></div><div className="p-3 bg-[#181818] border-t border-[#3e3e42]">{type === 'text' ? (<div className="bg-[#252526] p-2 rounded border border-[#333] font-mono text-[11px] text-[#ccc] whitespace-pre-wrap max-h-24 overflow-y-auto italic">"{result.output}"</div>) : (<div className="relative w-full aspect-video bg-[#000] rounded overflow-hidden border border-[#333] group"><img src={`data:image/png;base64,${result.output}`} className="w-full h-full object-contain" alt="Test Output" /></div>)}</div></div>) : (<div className="p-3 text-red-300 font-mono text-[10px] break-all">{result.message}</div>)}
                 </div>
             )}
        </div>
    );
};

const ApiConnectionStatus = ({ status }: any) => {
    const { t } = useAppContext();
    if (!status) return null;
    const isSuccess = status.success || (status.isFallback && status.count > 0);
    const dateStr = new Date(status.timestamp).toLocaleTimeString();
    return (
        <div className={`mt-4 rounded-md border p-4 animate-fade-in ${isSuccess ? 'bg-green-900/10 border-green-500/20' : 'bg-red-900/10 border-red-500/20'}`}>
            <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-1 rounded-full ${isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-900/10 border-red-500/20'}`}>{isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}</div>
                <div className="flex-1"><h4 className={`text-sm font-bold mb-1 ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>{isSuccess ? t('testSuccess') : t('testFailed')}</h4>{isSuccess ? (<div className="flex items-center gap-4 mt-2"><div className="flex items-center gap-2 text-[10px] text-[#ccc]"><Database className="w-3.5 h-3.5 text-blue-400" /> {status.count} {t('tabModels').toLowerCase()}</div><div className="text-[10px] text-[#666] ml-auto">{t('benchUpdate')}: {dateStr}</div></div>) : (<p className="text-xs text-[#ccc] mt-1 font-mono">{status.message}</p>)}</div>
            </div>
        </div>
    );
};

export const SettingsPage: React.FC = () => {
  const { 
    telegramConfig, setTelegramConfig, 
    apiKeys, addApiKey, updateApiKey, deleteApiKey, setDefaultApiKey,
    apiConfig, modelConfig, setModelConfig, 
    availableModels, setAvailableModels,
    integrations, addIntegration, removeIntegration,
    t, showToast, user
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('gemini');
  const scrollRef = useRef<HTMLDivElement>(null);

  const getDefaultKeyForProvider = (p: ApiProvider): string => {
      return (
          apiKeys.find(k => k.provider === p && k.isDefault)?.key ||
          apiKeys.find(k => k.provider === p)?.key ||
          ''
      );
  };

  const openWalletForProvider = (p: ApiProvider) => {
      setActiveTab(p as SettingsTab);
      setFetchStatus(null);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Model Assignments (Form local state)
  const [textModel, setTextModel] = useState('');
  const [textProvider, setTextProvider] = useState<ApiProvider>('gemini');
  const [youtubeModel, setYoutubeModel] = useState('');
  const [youtubeProvider, setYoutubeProvider] = useState<ApiProvider>('gemini');
  const [imageModel, setImageModel] = useState('');
  const [imageProvider, setImageProvider] = useState<ImageProvider>('gemini');
  const [systemPrompt, setSystemPrompt] = useState('');
  
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  
  const [showAddIntegration, setShowAddIntegration] = useState(false);
  const [newIntProvider, setNewIntProvider] = useState<IntegrationProvider>('telegram');
  const [newIntName, setNewIntName] = useState('');
  const [newIntCreds, setNewIntCreds] = useState<any>({});
  
  const [showCloudInspector, setShowCloudInspector] = useState(false);
  const [showModelManager, setShowModelManager] = useState(false);

  const runKeyTest = async (provider: ApiProvider, key: string) => {
      if (!key) {
          showToast(t('errApiKeyMissing'), 'warning');
          return;
      }
      
      showToast(t('btnTesting'), 'info');
      try {
          let testModelId = '';
          if (provider === 'gemini') testModelId = 'gemini-2.5-flash';
          else if (provider === 'kie') testModelId = 'deepseek-v3';
          else if (provider === 'openrouter') testModelId = 'google/gemini-flash-1.5';
          else if (provider === 'replicate') {
              await testImageGeneration('black-forest-labs/flux-schnell', key);
              showToast(t('testSuccess'), 'success');
              return;
          }

          if (!testModelId) throw new Error("No test model available for this provider");

          await testTextGeneration(testModelId, provider, key);
          showToast(t('testSuccess'), 'success');
      } catch (e: any) {
          showToast(e.message, 'error');
      }
  };

  const [customReplicateModels, setCustomReplicateModels] = useState<Model[]>(() => {
      try { const saved = localStorage.getItem('autopost_custom_models'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('autopost_custom_models', JSON.stringify(customReplicateModels)); }, [customReplicateModels]);

  const [fetchStatus, setFetchStatus] = useState<{ provider: string; count: number; success: boolean; message?: string; timestamp: number; isFallback?: boolean; } | null>(null);

  useEffect(() => {
    setTextModel(modelConfig.textModel || '');
    setTextProvider(modelConfig.textProvider || 'gemini');
    setYoutubeModel(modelConfig.youtubeModel || '');
    setYoutubeProvider(modelConfig.youtubeProvider || 'gemini');
    setImageProvider(modelConfig.imageProvider || 'gemini');
    setImageModel(modelConfig.imageModel || '');
    setSystemPrompt(modelConfig.systemPrompt || '');
  }, [modelConfig]);

  const runTelegramTest = async (int?: Integration) => {
      const configToTest = int ? (int.credentials as any) : telegramConfig;
      if (!configToTest.botToken || !configToTest.channelId) { showToast(t('authError'), 'warning'); return; }
      try { await testTelegramConnection(configToTest); showToast(t('testSuccess'), 'success'); } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleFetchModels = async (p: ApiProvider, key: string) => {
        if (!key) { showToast(t('errApiKeyMissing'), 'warning'); return; }
    setIsFetchingModels(true); setFetchStatus(null); 
    try {
      let newModels: Model[] = [];
      if (p === 'replicate') {
          await new Promise(resolve => setTimeout(resolve, 500));
          const combined = [...REPLICATE_IMAGE_MODELS, ...customReplicateModels.map(m => ({...m, description: 'Custom saved model'}))];
          newModels = combined.map(m => ({ id: m.id, name: m.name, provider: 'replicate', description: m.description, isFree: false, created: Date.now() / 1000, contextLength: 0 }));
      } else {
          newModels = await getAvailableModels({ ...apiConfig, [p === 'kie' ? 'kieKey' : (p === 'openrouter' ? 'openRouterKey' : 'geminiKey')]: key }, p);
      }
      setAvailableModels((prev) => { const filtered = prev.filter(m => m.provider !== p); return [...filtered, ...newModels]; });

            // Autopick first valid model for roles that depend on provider p
            if (p !== 'replicate' && newModels.length > 0) {
                    const firstId = newModels[0]?.id || '';
                    if (textProvider === p && !newModels.some(m => m.id === textModel)) {
                            setTextModel(firstId);
                    }
                    if (youtubeProvider === p && !newModels.some(m => m.id === youtubeModel)) {
                            setYoutubeModel(firstId);
                    }
            }

      setFetchStatus({ provider: p, count: newModels.length, success: newModels.length > 0, timestamp: Date.now(), isFallback: p === 'kie' });
    } catch (e: any) {
      setFetchStatus({ provider: p, count: 0, success: false, message: e.message, timestamp: Date.now() });
    } finally { setIsFetchingModels(false); }
  };

  const handleSaveGlobal = () => {
    setModelConfig({ textModel, textProvider, youtubeModel, youtubeProvider, imageProvider, imageModel, systemPrompt });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  const handleAddIntegration = () => {
      if (!newIntName) return;
      addIntegration({ provider: newIntProvider, name: newIntName, credentials: newIntCreds, isActive: true });
      setShowAddIntegration(false); setNewIntName(''); setNewIntCreds({}); setNewIntProvider('telegram');
  };

  const handleAddCustomModel = (id: string) => {
      if (customReplicateModels.find(m => m.id === id)) return;
      setCustomReplicateModels(prev => [...prev, { id: id, name: id, provider: 'replicate' }]);
      setImageModel(id);
  };

  const getModelsByProvider = (p: ApiProvider) => availableModels.filter(m => m.provider === p);
  const getFilteredImageModels = (provider: string) => provider === 'gemini' ? GEMINI_IMAGE_MODELS : [...REPLICATE_IMAGE_MODELS, ...customReplicateModels];

  const NavItem = ({ id, icon: Icon, label, colorClass }: any) => (
      <button
          onClick={() => { setActiveTab(id); setFetchStatus(null); }}
          className={`w-full text-left p-3 rounded-md mb-2 flex items-center gap-3 transition-all border ${activeTab === id ? `bg-[#37373d] text-white border-l-4 ${String(colorClass || '').startsWith('text-') ? String(colorClass).replace('text-', 'border-') : ''} border-t-transparent border-r-transparent border-b-transparent shadow-sm` : 'text-[#969696] border-transparent hover:bg-[#2a2d2e] hover:text-[#e0e0e0]'}`}
      >
         <Icon className={`w-5 h-5 ${activeTab === id ? colorClass : ''}`} />
         <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </button>
  );

  return (
    <div className="flex h-full bg-[#1e1e1e] text-slate-300 overflow-hidden font-sans select-none animate-fade-in">
      <div className="w-64 bg-[#252526] border-r border-[#1e1e1e] flex flex-col shrink-0">
          <div className="h-14 flex items-center px-6 border-b border-[#1e1e1e]"><span className="text-xs font-bold uppercase tracking-widest text-[#cccccc] flex items-center gap-2"><Sliders className="w-4 h-4" /> {t('lblIntegrations')}</span></div>
          <div className="p-4 flex-1 overflow-y-auto">
              <NavItem id="gemini" icon={Globe} label={t('providerGeminiTitle')} colorClass="text-blue-400" />
              <NavItem id="kie" icon={HardDrive} label={t('providerKieTitle')} colorClass="text-green-400" />
              <NavItem id="openrouter" icon={Server} label={t('providerOpenRouterTitle')} colorClass="text-purple-400" />
              <NavItem id="replicate" icon={Palette} label={t('providerReplicateTitle')} colorClass="text-orange-400" />
              <div className="h-px bg-[#3e3e42] my-4 mx-2"></div>
              <NavItem id="telegram" icon={Share2} label={t('providerTelegramTitle')} colorClass="text-sky-400" />
          </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        <div className="h-14 flex items-center justify-between px-8 border-b border-[#252526] bg-[#1e1e1e] shrink-0">
            <h2 className="text-lg font-medium text-white flex items-center gap-3"><Settings className="w-5 h-5 text-[#858585]" /> {t('configTitle')}</h2>
            <button onClick={handleSaveGlobal} className={`flex items-center gap-2 px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all transform active:scale-95 shadow-lg ${saveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-[#0e639c] hover:bg-[#1177bb] text-white'}`}>
                {saveStatus === 'saved' ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}{saveStatus === 'saved' ? t('savedConfig') : t('saveConfig')}
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar" ref={scrollRef}>
            <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-20">
                <div className="min-h-[200px]">
                    {activeTab !== 'telegram' && (
                        <div className="bg-[#252526] p-6 rounded border border-[#3e3e42] animate-slide-up">
                            <div className="flex items-center gap-3 mb-6">
                                {activeTab === 'gemini' && <Globe className="w-8 h-8 text-blue-400" />}
                                {activeTab === 'kie' && <HardDrive className="w-8 h-8 text-green-400" />}
                                {activeTab === 'openrouter' && <Server className="w-8 h-8 text-purple-400" />}
                                {activeTab === 'replicate' && <Palette className="w-8 h-8 text-orange-400" />}
                                <div><h3 className="text-lg font-bold text-white capitalize">{activeTab.toUpperCase()} {t('walletTitle')}</h3><p className="text-xs text-[#999]">{t('walletDesc')}</p></div>
                                <div className="ml-auto">
                                    <button onClick={() => runKeyTest(activeTab, apiKeys.find(k => k.provider === activeTab && k.isDefault)?.key || '')} className="text-[10px] bg-[#3e3e42] hover:bg-[#4e4e55] text-white px-3 py-1.5 rounded transition-all font-bold uppercase">{t('btnVerifyKey')}</button>
                                </div>
                            </div>
                            <ApiWallet 
                                provider={activeTab as ApiProvider}
                                keys={apiKeys}
                                onAdd={addApiKey}
                                onUpdate={updateApiKey}
                                onDelete={deleteApiKey}
                                onSetDefault={setDefaultApiKey}
                                onFetch={handleFetchModels}
                            />
                            {fetchStatus && fetchStatus.provider === activeTab && <ApiConnectionStatus status={fetchStatus} />}
                        </div>
                    )}

                    {activeTab === 'telegram' && (
                        <div className="bg-[#252526] p-6 rounded border border-[#3e3e42] animate-slide-up">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3"><Share2 className="w-8 h-8 text-sky-400" /><div><h3 className="text-lg font-bold text-white">{t('integrationsTitle')}</h3><p className="text-xs text-[#999]">{t('integrationsDesc')}</p></div></div>
                                <div className="flex gap-2">
                                     <button onClick={() => runTelegramTest()} className="bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-2 border border-[#3e3e42]"><Activity className="w-3 h-3" /> {t('btnTestLegacy')}</button>
                                     <button onClick={() => setShowCloudInspector(true)} disabled={!user} className="bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-2 border border-[#3e3e42] disabled:opacity-50"><Eye className="w-3 h-3 text-purple-400" /> {t('btnCloudViewer')}</button>
                                    <button onClick={() => setShowAddIntegration(true)} className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-2"><Plus className="w-3 h-3" /> {t('btnAddIntegration')}</button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {integrations.length === 0 && <div className="text-sm text-[#666] italic bg-[#1e1e1e] p-4 rounded text-center">{t('noIntegrations')}</div>}
                                {integrations.map(int => (
                                    <div key={int.id} className="bg-[#1e1e1e] border border-[#3e3e42] rounded p-4 flex items-center justify-between group hover:border-[#505050] transition-colors">
                                        <div className="flex items-center gap-3"><div className={`p-2 rounded-full ${int.provider === 'telegram' ? 'bg-sky-500/10 text-sky-400' : 'bg-blue-600/10 text-blue-400'}`}>{int.provider === 'telegram' ? <MessageSquare className="w-5 h-5" /> : <Facebook className="w-5 h-5" />}</div><div><h4 className="text-sm font-bold text-white">{int.name}</h4><div className="flex items-center gap-2 text-[10px] text-[#666]"><span className="uppercase">{int.provider}</span><span>•</span><span>ID: {int.id.substring(0, 8)}...</span></div></div></div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => runTelegramTest(int)} className="p-2 hover:bg-[#333] text-[#858585] hover:text-[#54a0f8] rounded" title={t('btnDiagnosticCheck')}><Activity className="w-4 h-4" /></button><button onClick={() => removeIntegration(int.id)} className="p-2 hover:bg-red-500/20 text-[#666] hover:text-red-400 rounded" title={t('ctxDelete')}><Trash2 className="w-4 h-4" /></button></div>
                                    </div>
                                ))}
                            </div>
                            {showAddIntegration && (
                                <div className="mt-6 border-t border-[#3e3e42] pt-6 animate-fade-in"><h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">{t('btnAddIntegration')}</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><label className="text-[10px] font-bold text-[#666] uppercase mb-1 block">{t('lblIntegrationProvider')}</label><select value={newIntProvider} onChange={e => setNewIntProvider(e.target.value as IntegrationProvider)} className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-white outline-none"><option value="telegram">Telegram Bot</option></select></div><div><label className="text-[10px] font-bold text-[#666] uppercase mb-1 block">{t('lblIntegrationName')}</label><input value={newIntName} onChange={e => setNewIntName(e.target.value)} className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-white outline-none" placeholder={t('phIntegrationName')} /></div></div><div className="space-y-3 bg-[#1e1e1e] p-4 rounded border border-[#333] mb-4"><div><label className="text-[10px] font-bold text-[#666] uppercase mb-1 block">{t('botTokenLabel')}</label><input value={newIntCreds.botToken || ''} onChange={e => setNewIntCreds({...newIntCreds, botToken: e.target.value})} className="w-full bg-[#252526] border border-[#3e3e42] rounded px-3 py-2 text-sm text-white outline-none" type="password" /></div><div><label className="text-[10px] font-bold text-[#666] uppercase mb-1 block">{t('channelIdLabel')}</label><input value={newIntCreds.channelId || ''} onChange={e => setNewIntCreds({...newIntCreds, channelId: e.target.value})} className="w-full bg-[#252526] border border-[#3e3e42] rounded px-3 py-2 text-sm text-white outline-none" placeholder="@channel" /></div></div><div className="flex justify-end gap-2"><button onClick={() => setShowAddIntegration(false)} className="px-4 py-2 text-xs text-[#858585] hover:text-white">{t('btnCancel')}</button><button onClick={handleAddIntegration} disabled={!newIntName} className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-4 py-2 rounded text-xs font-bold">{t('btnSave')}</button></div></div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 border-t border-[#3e3e42] pt-8">
                    <div className="flex items-center justify-between mb-6"><h3 className="text-sm font-bold text-[#858585] uppercase tracking-widest flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> {t('lblGlobalAssignments')}</h3></div>
                    <div className="flex flex-col gap-6">
                        <ModelAssignmentRow
                            title={t('assignText')}
                            description={t('providerGeminiDesc')}
                            icon={Brain}
                            iconColor="text-blue-400"
                            provider={textProvider}
                            setProvider={setTextProvider}
                            getFirstModelId={(p: ApiProvider) => getModelsByProvider(p)[0]?.id || ''}
                            providerOptions={[{ value: 'gemini', label: 'Google Gemini' }, { value: 'kie', label: 'Kie.ai' }, { value: 'openrouter', label: 'OpenRouter' }]}
                            model={textModel}
                            setModel={setTextModel}
                            modelOptions={getModelsByProvider(textProvider)}
                            type="text"
                            availableModels={availableModels}
                            getKeys={() => ({
                                gemini: getDefaultKeyForProvider('gemini'),
                                kie: getDefaultKeyForProvider('kie'),
                                openrouter: getDefaultKeyForProvider('openrouter'),
                                replicate: getDefaultKeyForProvider('replicate'),
                            })}
                            onOpenWallet={(p: ApiProvider) => openWalletForProvider(p)}
                            onSyncModels={(p: ApiProvider) => handleFetchModels(p, getDefaultKeyForProvider(p))}
                            onOpenManager={() => setShowModelManager(true)}
                        />
                        <ModelAssignmentRow
                            title={t('assignYoutube')}
                            description={t('providerKieDesc')}
                            icon={Youtube}
                            iconColor="text-red-500"
                            provider={youtubeProvider}
                            setProvider={setYoutubeProvider}
                            getFirstModelId={(p: ApiProvider) => getModelsByProvider(p)[0]?.id || ''}
                            providerOptions={[{ value: 'gemini', label: 'Google Gemini' }, { value: 'kie', label: 'Kie.ai' }, { value: 'openrouter', label: 'OpenRouter' }]}
                            model={youtubeModel}
                            setModel={setYoutubeModel}
                            modelOptions={getModelsByProvider(youtubeProvider)}
                            type="text"
                            availableModels={availableModels}
                            getKeys={() => ({
                                gemini: getDefaultKeyForProvider('gemini'),
                                kie: getDefaultKeyForProvider('kie'),
                                openrouter: getDefaultKeyForProvider('openrouter'),
                                replicate: getDefaultKeyForProvider('replicate'),
                            })}
                            onOpenWallet={(p: ApiProvider) => openWalletForProvider(p)}
                            onSyncModels={(p: ApiProvider) => handleFetchModels(p, getDefaultKeyForProvider(p))}
                            onOpenManager={() => setShowModelManager(true)}
                        />
                        <ModelAssignmentRow
                            title={t('assignImage')}
                            description={t('providerReplicateDesc')}
                            icon={ImageIcon}
                            iconColor="text-purple-400"
                            provider={imageProvider}
                            setProvider={setImageProvider}
                            getFirstModelId={(p: ImageProvider) => getFilteredImageModels(p)[0]?.id || ''}
                            providerOptions={[{ value: 'gemini', label: 'Google Gemini' }, { value: 'replicate', label: 'Replicate' }]}
                            model={imageModel}
                            setModel={setImageModel}
                            modelOptions={getFilteredImageModels(imageProvider)}
                            type="image"
                            availableModels={availableModels}
                            getKeys={() => ({
                                gemini: getDefaultKeyForProvider('gemini'),
                                kie: getDefaultKeyForProvider('kie'),
                                openrouter: getDefaultKeyForProvider('openrouter'),
                                replicate: getDefaultKeyForProvider('replicate'),
                            })}
                            onOpenWallet={(p: ApiProvider) => openWalletForProvider(p)}
                            onSyncModels={(p: ApiProvider) => handleFetchModels(p, getDefaultKeyForProvider(p))}
                            onAddCustomModel={handleAddCustomModel}
                            onOpenManager={() => setShowModelManager(true)}
                        />
                    </div>
                    <div className="mt-6"><label className="text-xs font-bold text-[#ccc] mb-2 block flex items-center gap-2"><Terminal className="w-3.5 h-3.5" />{t('systemPromptLabel')}</label><textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} className="w-full bg-[#252526] border border-[#3e3e42] rounded p-3 text-xs text-[#ccc] font-mono outline-none focus:border-[#007acc] h-24 resize-none" placeholder={t('systemPromptPlaceholder')} /></div>
                </div>
            </div>
        </div>
        <CloudInspectorModal isOpen={showCloudInspector} onClose={() => setShowCloudInspector(false)} userId={user?.id} />
        <ModelManagerModal isOpen={showModelManager} onClose={() => setShowModelManager(false)} />
      </div>
    </div>
  );
};