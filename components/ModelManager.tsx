
import React, { useState, useMemo } from 'react';
import { Model, ModelSpecs } from '../types';
import { 
    Search, Filter, Star, Info, Code, Globe, 
    Server, HardDrive, Palette, X, ChevronDown, 
    CheckCircle2, AlertCircle, Terminal, 
    Calendar, Video, Music, FunctionSquare,
    Image as ImageIcon, Cpu, Coins
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// --- SUB-COMPONENT: MODEL INSPECTOR ---
const ModelInspector = ({ model, onClose }: { model: Model, onClose: () => void }) => {
    const { t } = useAppContext();
    const [tab, setTab] = useState<'specs' | 'raw'>('specs');
    
    const specs = model.specs || {
        maxOutputTokens: model.contextLength || 4096,
        temperatureRange: { min: 0, max: 2, default: 1 },
        supportsImages: model.supportedInputs?.includes('image') || false,
        supportsVideo: model.supportedInputs?.includes('video') || false,
        supportsAudio: model.supportedInputs?.includes('audio') || false,
        supportsJsonMode: false,
        supportsFunctionCalling: false,
        supportsSystemPrompt: true,
        knowledgeCutoff: "Unknown"
    };

    const FeatureBadge = ({ supported, label, icon: Icon }: any) => (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase border ${supported ? 'bg-green-900/10 border-green-500/20 text-green-400' : 'bg-[#2a2d2e] border-transparent text-[#666] opacity-30'}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#181818] border border-[#3e3e42] rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-in">
                
                <div className="p-6 border-b border-[#3e3e42] flex justify-between items-start bg-[#1e1e1e]">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-white">{model.name}</h3>
                            {model.isFree && <span className="bg-green-900/30 text-green-400 border border-green-500/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{t('badgeFree')}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs text-[#666] bg-[#2a2d2e] px-1.5 py-0.5 rounded">{model.id}</span>
                            <span className="text-xs text-[#858585]">•</span>
                            <span className="text-xs text-[#858585]">{model.provider}</span>
                        </div>
                        <p className="text-sm text-[#ccc] mt-3 leading-relaxed">{model.description}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-[#333] rounded text-[#666] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex border-b border-[#3e3e42] bg-[#1e1e1e]">
                    <button onClick={() => setTab('specs')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'specs' ? 'border-b-2 border-[#007acc] text-white bg-[#252526]' : 'text-[#666] hover:text-[#ccc]'}`}>{t('hubSpecs')}</button>
                    <button onClick={() => setTab('raw')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'raw' ? 'border-b-2 border-purple-500 text-white bg-[#252526]' : 'text-[#666] hover:text-[#ccc]'}`}>{t('hubRaw')}</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-[#181818] custom-scrollbar">
                    {tab === 'specs' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-4 gap-4 p-4 bg-[#252526] rounded border border-[#3e3e42]">
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-[#666]">{t('hubContext')}</div>
                                    <div className="text-sm font-mono text-white mt-1">{model.contextLength ? `${(model.contextLength / 1000).toFixed(0)}k` : '?'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-[#666]">{t('hubReleased')}</div>
                                    <div className="text-sm font-mono text-white mt-1">{model.created ? new Date(model.created * 1000).toLocaleDateString() : 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-[#666]">{t('hubCostIn')}</div>
                                    <div className="text-sm font-mono text-green-400 mt-1">{model.pricing?.prompt || '?'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-[#666]">{t('hubCostOut')}</div>
                                    <div className="text-sm font-mono text-green-400 mt-1">{model.pricing?.completion || '?'}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-[#858585] uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Terminal className="w-3.5 h-3.5" /> {t('hubTools')}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    <FeatureBadge supported={specs.supportsImages} label={t('hubVision')} icon={ImageIcon} />
                                    <FeatureBadge supported={specs.supportsVideo} label={t('hubVideo')} icon={Video} />
                                    <FeatureBadge supported={specs.supportsAudio} label={t('hubAudio')} icon={Music} />
                                    <FeatureBadge supported={specs.supportsJsonMode} label="JSON" icon={Code} />
                                    <FeatureBadge supported={specs.supportsFunctionCalling} label={t('hubTools')} icon={FunctionSquare} />
                                    <FeatureBadge supported={specs.supportsSystemPrompt} label={t('hubPrompt')} icon={Terminal} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#1e1e1e] p-4 rounded border border-[#333]">
                                    <h4 className="text-xs font-bold text-[#858585] uppercase tracking-widest mb-3">{t('hubParam')}</h4>
                                    <div className="space-y-2 text-xs font-mono">
                                        <div className="flex justify-between border-b border-[#2d2d2d] pb-1"><span className="text-[#54a0f8]">temp</span><span className="text-[#ccc]">{specs.temperatureRange.min}-{specs.temperatureRange.max}</span></div>
                                        <div className="flex justify-between"><span className="text-[#54a0f8]">max_out</span><span className="text-[#ccc]">{specs.maxOutputTokens}</span></div>
                                    </div>
                                </div>
                                <div className="bg-[#1e1e1e] p-4 rounded border border-[#333]">
                                    <h4 className="text-xs font-bold text-[#858585] uppercase tracking-widest mb-3">{t('hubCutoff')}</h4>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-[#dcb67a]" />
                                        <div className="text-sm text-white font-mono">{specs.knowledgeCutoff}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {tab === 'raw' && (
                        <pre className="text-[10px] font-mono text-blue-300 whitespace-pre-wrap break-all bg-[#0d0d0d] p-4 rounded border border-[#333]">
                            {JSON.stringify(model.raw || model, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ModelManagerModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { t, availableModels, favoriteModelIds, toggleFavoriteModel } = useAppContext();
    const [search, setSearch] = useState('');
    const [filterProvider, setFilterProvider] = useState<string>('all');
    const [filterContext, setFilterContext] = useState<string>('all');
    const [onlyFavorites, setOnlyFavorites] = useState(false);
    const [inspectedModel, setInspectedModel] = useState<Model | null>(null);

    const filteredModels = useMemo(() => {
        return availableModels.filter(m => {
            const nameMatch = (m.name || '').toLowerCase().includes(search.toLowerCase());
            const idMatch = m.id.toLowerCase().includes(search.toLowerCase());
            const matchesSearch = nameMatch || idMatch;
            const matchesProvider = filterProvider === 'all' || m.provider === filterProvider;
            const matchesFav = !onlyFavorites || favoriteModelIds.includes(m.id);
            let matchesContext = true;
            if (filterContext === '128k') matchesContext = (m.contextLength || 0) >= 128000;
            if (filterContext === '1m') matchesContext = (m.contextLength || 0) >= 1000000;
            return matchesSearch && matchesProvider && matchesFav && matchesContext;
        });
    }, [availableModels, search, filterProvider, filterContext, onlyFavorites, favoriteModelIds]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-[#1e1e1e] border border-[#3e3e42] rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
                
                <div className="p-5 border-b border-[#3e3e42] flex justify-between items-center bg-[#252526]">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Server className="w-5 h-5 text-purple-400" />{t('hubTitle')}</h2>
                        <p className="text-xs text-[#858585]">{t('hubDesc')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#333] rounded-full text-[#ccc] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-4 border-b border-[#3e3e42] bg-[#1e1e1e] flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#666]" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('hubSearch')} className="w-full bg-[#252526] border border-[#3e3e42] rounded pl-9 pr-3 py-2 text-sm text-white focus:border-[#007acc] outline-none placeholder-[#555]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)} className="bg-[#252526] border border-[#3e3e42] text-xs text-[#ccc] rounded px-3 py-2 outline-none cursor-pointer">
                            <option value="all">{t('hubAllProviders')}</option>
                            <option value="gemini">Gemini</option>
                            <option value="openrouter">OpenRouter</option>
                            <option value="kie">Kie.ai</option>
                            <option value="replicate">Replicate</option>
                        </select>
                        <select value={filterContext} onChange={e => setFilterContext(e.target.value)} className="bg-[#252526] border border-[#3e3e42] text-xs text-[#ccc] rounded px-3 py-2 outline-none cursor-pointer">
                            <option value="all">{t('hubAnyContext')}</option>
                            <option value="128k">128k+</option>
                            <option value="1m">1m+</option>
                        </select>
                        <button onClick={() => setOnlyFavorites(!onlyFavorites)} className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold border transition-colors ${onlyFavorites ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-[#252526] border-[#3e3e42] text-[#858585] hover:text-[#ccc]'}`}>
                            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />{t('hubFavOnly')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#252526] border-b border-[#3e3e42] text-[10px] font-bold text-[#858585] uppercase tracking-wider">
                    <div className="col-span-5">{t('hubColName')}</div>
                    <div className="col-span-2">{t('hubColProvider')}</div>
                    <div className="col-span-2">{t('hubColContext')}</div>
                    <div className="col-span-2">{t('hubColCost')}</div>
                    <div className="col-span-1 text-center">{t('hubColActions')}</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#1e1e1e]">
                    {filteredModels.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#666]">
                            <Filter className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">{t('hubNoModels')}</p>
                        </div>
                    ) : (
                        filteredModels.map((m, idx) => {
                            const isFav = favoriteModelIds.includes(m.id);
                            const ProviderIcon = m.provider === 'gemini' ? Globe : m.provider === 'replicate' ? Palette : m.provider === 'kie' ? HardDrive : Server;
                            const providerColor = m.provider === 'gemini' ? 'text-blue-400' : m.provider === 'replicate' ? 'text-orange-400' : m.provider === 'kie' ? 'text-green-400' : 'text-purple-400';
                            return (
                                <div key={`${m.id}-${idx}`} className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#2a2d2e] items-center hover:bg-[#252526] transition-colors group">
                                    <div className="col-span-5 flex flex-col min-w-0 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-[#e0e0e0] truncate" title={m.name}>{m.name}</span>
                                            {m.isFree && <span className="text-[9px] bg-green-900/30 text-green-400 px-1.5 rounded border border-green-500/20">{t('badgeFree').toUpperCase()}</span>}
                                        </div>
                                        <span className="text-[10px] text-[#666] font-mono truncate">{m.id}</span>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <ProviderIcon className={`w-3.5 h-3.5 ${providerColor}`} />
                                        <span className={`text-xs capitalize ${providerColor}`}>{m.provider}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-1.5 text-xs text-[#ccc]">
                                            <Cpu className="w-3 h-3 text-[#54a0f8]" />
                                            {m.contextLength ? <span className="font-mono">{(m.contextLength / 1000).toFixed(0)}k</span> : <span className="text-[#666]">-</span>}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex flex-col gap-0.5 text-[10px] font-mono text-[#858585]">
                                            <span>{t('hubCostInShort')}: <span className="text-[#ccc]">{m.pricing?.prompt || '?'}</span></span>
                                            <span>{t('hubCostOutShort')}: <span className="text-[#ccc]">{m.pricing?.completion || '?'}</span></span>
                                        </div>
                                    </div>
                                    <div className="col-span-1 flex justify-center gap-2">
                                        <button onClick={() => toggleFavoriteModel(m.id)} className={`p-1.5 rounded transition-all ${isFav ? 'text-yellow-400 bg-yellow-900/20' : 'text-[#666] hover:text-yellow-400 hover:bg-[#333]'}`}><Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} /></button>
                                        <button onClick={() => setInspectedModel(m)} className="p-1.5 rounded text-[#666] hover:text-[#007acc] hover:bg-[#333] transition-all"><Info className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-3 border-t border-[#3e3e42] bg-[#252526] flex justify-between items-center text-[10px] text-[#666]">
                    <div>{t('hubShowing').replace('{count}', filteredModels.length.toString()).replace('{total}', availableModels.length.toString())}</div>
                    <div>{t('hubEsc')}</div>
                </div>

                {inspectedModel && <ModelInspector model={inspectedModel} onClose={() => setInspectedModel(null)} />}
            </div>
        </div>
    );
};
