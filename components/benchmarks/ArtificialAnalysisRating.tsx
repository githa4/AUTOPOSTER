/**
 * Artificial Analysis Rating
 * 
 * Простая вкладка с TOP моделями по данным artificialanalysis.ai
 * Показывает: Intelligence Index, Price, Speed, Value Ratio
 */

import React, { useState, useEffect } from 'react';
import { 
    Brain, 
    DollarSign, 
    Zap, 
    TrendingUp, 
    ExternalLink, 
    RefreshCw,
    Trophy,
    Sparkles,
    Lock,
    Unlock,
    Star,
    Timer,
    Info
} from 'lucide-react';
import { 
    AAModelData, 
    fetchAAModels, 
    getTopByIntelligence, 
    getTopByValueRatio, 
    getTopBySpeed 
} from '../../services/modelRating/providers/artificialAnalysisProvider';
import { useAppContext } from '../../context/AppContext';

type ViewMode = 'intelligence' | 'value' | 'speed';

const IntelligenceBar: React.FC<{ value: number; max?: number }> = ({ value, max = 100 }) => {
    const percent = (value / max) * 100;
    const color = value >= 65 ? 'from-purple-500 to-pink-500' 
                : value >= 50 ? 'from-blue-500 to-cyan-500' 
                : value >= 35 ? 'from-green-500 to-emerald-500'
                : 'from-yellow-500 to-orange-500';
    
    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-2 bg-[#333] rounded-full overflow-hidden">
                <div 
                    className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                />
            </div>
            <span className="text-xs font-mono font-bold text-white w-8 text-right">{value}</span>
        </div>
    );
};

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
    if (rank === 1) return (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-yellow-500/20">
            <Trophy className="w-4 h-4" />
        </div>
    );
    if (rank === 2) return (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-300 to-slate-500 text-white flex items-center justify-center font-bold text-sm shadow-lg">
            2
        </div>
    );
    if (rank === 3) return (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-700 text-white flex items-center justify-center font-bold text-sm shadow-lg">
            3
        </div>
    );
    return (
        <div className="w-7 h-7 rounded bg-[#2a2d2e] text-[#888] flex items-center justify-center font-mono text-sm">
            {rank}
        </div>
    );
};

const ValueRatioBadge: React.FC<{ model: AAModelData }> = ({ model }) => {
    const ratio = model.pricePerMTokens > 0 
        ? (model.intelligenceIndex / model.pricePerMTokens).toFixed(1) 
        : '∞';
    
    return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 text-[10px] font-bold rounded border border-green-500/30">
            <Star className="w-3 h-3" />
            {ratio} IQ/$
        </div>
    );
};

const ModelCard: React.FC<{ 
    model: AAModelData; 
    rank: number; 
    viewMode: ViewMode;
}> = ({ model, rank, viewMode }) => {
    const formatContext = (n?: number) => {
        if (!n) return '—';
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
        return `${n}`;
    };

    return (
        <div className={`
            group relative p-4 rounded-xl border transition-all duration-300
            ${rank <= 3 
                ? 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-blue-500/30 hover:border-blue-400/50' 
                : 'bg-[#252526] border-[#3e3e42] hover:border-[#555]'
            }
            hover:shadow-lg hover:shadow-black/20 hover:translate-y-[-2px]
        `}>
            {/* Top row: Rank + Name + Badges */}
            <div className="flex items-start gap-3 mb-3">
                <RankBadge rank={rank} />
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-sm truncate group-hover:text-blue-400 transition-colors">
                            {model.name}
                        </h3>
                        {model.isReasoning && (
                            <span className="px-1.5 py-0.5 bg-purple-900/40 text-purple-300 text-[9px] font-bold rounded border border-purple-500/30">
                                <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />
                                REASONING
                            </span>
                        )}
                        <span className={`
                            inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded border
                            ${model.isOpenWeights 
                                ? 'bg-green-900/30 text-green-400 border-green-500/30' 
                                : 'bg-slate-800/50 text-slate-400 border-slate-600/30'
                            }
                        `}>
                            {model.isOpenWeights ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                            {model.isOpenWeights ? 'OPEN' : 'PROP'}
                        </span>
                    </div>
                    <p className="text-[11px] text-[#888] mt-0.5">{model.organization}</p>
                </div>

                {viewMode === 'value' && <ValueRatioBadge model={model} />}
            </div>

            {/* Main metric: Intelligence Index */}
            <div className="mb-3">
                <div className="flex items-center gap-1.5 text-[10px] text-[#888] mb-1">
                    <Brain className="w-3 h-3" />
                    <span>Intelligence Index</span>
                </div>
                <IntelligenceBar value={model.intelligenceIndex} />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="flex flex-col items-center p-2 bg-[#1e1e1e] rounded-lg border border-[#333]">
                    <DollarSign className="w-3.5 h-3.5 text-green-400 mb-1" />
                    <span className="font-mono font-bold text-white">
                        ${model.pricePerMTokens.toFixed(2)}
                    </span>
                    <span className="text-[#666] text-[9px]">/1M tok</span>
                </div>

                <div className="flex flex-col items-center p-2 bg-[#1e1e1e] rounded-lg border border-[#333]">
                    <Zap className="w-3.5 h-3.5 text-yellow-400 mb-1" />
                    <span className="font-mono font-bold text-white">
                        {model.outputSpeed ? `${model.outputSpeed}` : '—'}
                    </span>
                    <span className="text-[#666] text-[9px]">tok/сек</span>
                </div>

                <div className="flex flex-col items-center p-2 bg-[#1e1e1e] rounded-lg border border-[#333]">
                    <Timer className="w-3.5 h-3.5 text-blue-400 mb-1" />
                    <span className="font-mono font-bold text-white">
                        {formatContext(model.contextWindow)}
                    </span>
                    <span className="text-[#666] text-[9px]">контекст</span>
                </div>
            </div>

            {/* External link */}
            <a 
                href={`https://artificialanalysis.ai${model.detailsUrl}`}
                target="_blank"
                rel="noreferrer"
                className="absolute top-3 right-3 p-1.5 text-[#666] hover:text-[#007acc] transition-colors opacity-0 group-hover:opacity-100"
                title="Подробнее на Artificial Analysis"
            >
                <ExternalLink className="w-3.5 h-3.5" />
            </a>
        </div>
    );
};

export const ArtificialAnalysisRating: React.FC = () => {
    const { t } = useAppContext();
    const [allModels, setAllModels] = useState<AAModelData[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('intelligence');
    const [showOnlyOpen, setShowOnlyOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchAAModels();
            setAllModels(data);
        } catch (e) {
            console.error('Failed to load AA data:', e);
        } finally {
            setLoading(false);
        }
    };

    const getDisplayModels = (): AAModelData[] => {
        let models = showOnlyOpen ? allModels.filter(m => m.isOpenWeights) : allModels;
        
        switch (viewMode) {
            case 'value':
                return getTopByValueRatio(models, 12);
            case 'speed':
                return getTopBySpeed(models, 12);
            case 'intelligence':
            default:
                return getTopByIntelligence(models, 12);
        }
    };

    const displayModels = getDisplayModels();

    return (
        <div className="mt-8 p-6 bg-[#1e1e1e] rounded-xl border border-[#3e3e42]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-500/20">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            🏆 Рейтинг Artificial Analysis
                        </h2>
                        <p className="text-xs text-[#888]">
                            Независимые бенчмарки: Intelligence Index, скорость, цена
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="p-2 bg-[#252526] hover:bg-[#333] rounded-lg border border-[#3e3e42] text-[#ccc] transition-colors"
                        title="Обновить"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <a
                        href="https://artificialanalysis.ai/leaderboards/models"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#252526] hover:bg-[#333] rounded-lg border border-[#3e3e42] text-xs text-[#ccc] transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">artificialanalysis.ai</span>
                    </a>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* View mode tabs */}
                <div className="flex bg-[#252526] p-1 rounded-lg border border-[#3e3e42]">
                    <button
                        onClick={() => setViewMode('intelligence')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            viewMode === 'intelligence' 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                                : 'text-[#888] hover:text-white'
                        }`}
                    >
                        <Brain className="w-3.5 h-3.5" />
                        TOP по качеству
                    </button>
                    <button
                        onClick={() => setViewMode('value')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            viewMode === 'value' 
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                : 'text-[#888] hover:text-white'
                        }`}
                    >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Лучшая цена/качество
                    </button>
                    <button
                        onClick={() => setViewMode('speed')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            viewMode === 'speed' 
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' 
                                : 'text-[#888] hover:text-white'
                        }`}
                    >
                        <Zap className="w-3.5 h-3.5" />
                        Самые быстрые
                    </button>
                </div>

                {/* Open source filter */}
                <button
                    onClick={() => setShowOnlyOpen(!showOnlyOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        showOnlyOpen 
                            ? 'bg-green-900/40 text-green-400 border-green-500/50' 
                            : 'bg-[#252526] text-[#888] border-[#3e3e42] hover:border-[#555]'
                    }`}
                >
                    <Unlock className="w-3.5 h-3.5" />
                    Только Open Source
                </button>
            </div>

            {/* Models grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-48 bg-[#252526] rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayModels.map((model, index) => (
                        <ModelCard 
                            key={model.name} 
                            model={model} 
                            rank={index + 1}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            )}

            {/* Footer info */}
            <div className="mt-6 flex items-start gap-2 p-3 bg-[#252526] border border-[#3e3e42] rounded-lg text-[10px] text-[#888]">
                <Info className="w-4 h-4 text-[#007acc] mt-0.5 shrink-0" />
                <div>
                    <p>
                        <strong>Intelligence Index</strong> — комплексная метрика от Artificial Analysis (MMLU-Pro, GPQA, LiveCodeBench, AIME 2025 и др.)
                    </p>
                    <p className="mt-1">
                        <strong>Цена</strong> — средневзвешенная input/output в соотношении 3:1. 
                        <strong className="ml-2">IQ/$</strong> — соотношение качества к цене (выше = лучше).
                    </p>
                </div>
            </div>
        </div>
    );
};
