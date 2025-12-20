/**
 * Artificial Analysis Rating
 * 
 * Таблица-лидерборд с TOP моделями по данным artificialanalysis.ai
 * Показывает: Intelligence Index, Price, Speed, Value Ratio
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Brain, 
    DollarSign, 
    Zap, 
    TrendingUp, 
    Image as ImageIcon,
    Video,
    ExternalLink, 
    RefreshCw,
    Trophy,
    Sparkles,
    Lock,
    Unlock,
    Star,
    Timer,
    Info,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { 
    AAModelData, 
    fetchAAModels
} from '../../services/modelRating/providers/artificialAnalysisProvider';
import { useAppContext } from '../../context/AppContext';

type SortKey = 'rank' | 'intelligence' | 'price' | 'speed' | 'context' | 'valueRatio';
type SortDirection = 'asc' | 'desc';

type ViewMode = 'quality' | 'value' | 'speed' | 'imageVideo' | 'outputTokens';

const LS_AA_VIEW_MODE = 'autopost_aa_view_mode';

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

const IntelligenceBar: React.FC<{ value: number; max?: number }> = ({ value, max = 100 }) => {
    const percent = (value / max) * 100;
    const color = value >= 65 ? 'from-purple-500 to-pink-500' 
                : value >= 50 ? 'from-blue-500 to-cyan-500' 
                : value >= 35 ? 'from-green-500 to-emerald-500'
                : 'from-yellow-500 to-orange-500';
    
    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                <div 
                    className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                />
            </div>
            <span className="text-xs font-mono font-bold text-white w-7 text-right">{value}</span>
        </div>
    );
};


export const ArtificialAnalysisRating: React.FC = () => {
    const { t } = useAppContext();
    const [allModels, setAllModels] = useState<AAModelData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOnlyOpen, setShowOnlyOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('quality');
    const [sortKey, setSortKey] = useState<SortKey>('intelligence');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_AA_VIEW_MODE);
            if (raw === 'quality' || raw === 'value' || raw === 'speed' || raw === 'imageVideo' || raw === 'outputTokens') {
                setViewMode(raw);
            }
        } catch {
            // ignore
        }
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

    const formatContext = (n?: number) => {
        if (!n) return '—';
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
        return `${n}`;
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection(key === 'price' ? 'asc' : 'desc');
        }
    };

    const setMode = (mode: ViewMode) => {
        setViewMode(mode);
        try {
            localStorage.setItem(LS_AA_VIEW_MODE, mode);
        } catch {
            // ignore
        }

        if (mode === 'quality') {
            setSortKey('intelligence');
            setSortDirection('desc');
        }
        if (mode === 'value') {
            setSortKey('valueRatio');
            setSortDirection('desc');
        }
        if (mode === 'speed' || mode === 'outputTokens') {
            setSortKey('speed');
            setSortDirection('desc');
        }
    };

    const sortedModels = useMemo(() => {
        if (viewMode === 'imageVideo') return [];
        let models = showOnlyOpen ? allModels.filter(m => m.isOpenWeights) : [...allModels];
        
        models.sort((a, b) => {
            let aVal: number;
            let bVal: number;
            
            switch (sortKey) {
                case 'intelligence':
                    aVal = a.intelligenceIndex;
                    bVal = b.intelligenceIndex;
                    break;
                case 'price':
                    aVal = a.pricePerMTokens;
                    bVal = b.pricePerMTokens;
                    break;
                case 'speed':
                    aVal = a.outputSpeed || 0;
                    bVal = b.outputSpeed || 0;
                    break;
                case 'context':
                    aVal = a.contextWindow || 0;
                    bVal = b.contextWindow || 0;
                    break;
                case 'valueRatio':
                    aVal = a.pricePerMTokens > 0 ? a.intelligenceIndex / a.pricePerMTokens : 0;
                    bVal = b.pricePerMTokens > 0 ? b.intelligenceIndex / b.pricePerMTokens : 0;
                    break;
                default:
                    return 0;
            }
            
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return models;
    }, [allModels, showOnlyOpen, sortKey, sortDirection, viewMode]);

    const SortIcon: React.FC<{ columnKey: SortKey }> = ({ columnKey }) => {
        if (sortKey !== columnKey) {
            return <ArrowUpDown className="w-3 h-3 opacity-30" />;
        }
        return sortDirection === 'asc' 
            ? <ArrowUp className="w-3 h-3 text-[#007acc]" />
            : <ArrowDown className="w-3 h-3 text-[#007acc]" />;
    };

    return (
        <div className="p-6 bg-[#1e1e1e] rounded-xl border border-[#3e3e42]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-500/20">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">🏆 Рейтинг Artificial Analysis</h2>
                        <p className="text-xs text-[#888]">
                            5 режимов: качество / цена-качество / скорость / image+video / output tokens
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowOnlyOpen(!showOnlyOpen)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                            showOnlyOpen 
                                ? 'bg-green-900/40 text-green-400 border-green-500/50' 
                                : 'bg-[#252526] text-[#888] border-[#3e3e42] hover:border-[#555]'
                        }`}
                    >
                        <Unlock className="w-3.5 h-3.5" />
                        Open Source
                    </button>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="p-2 bg-[#252526] hover:bg-[#333] rounded-lg border border-[#3e3e42] text-[#ccc] transition-colors disabled:opacity-50"
                        title="Обновить"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <a
                        href="https://artificialanalysis.ai/?intelligence=agentic-index"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#252526] hover:bg-[#333] rounded-lg border border-[#3e3e42] text-xs text-[#ccc] transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">artificialanalysis.ai</span>
                    </a>
                </div>
            </div>

            {/* Mode tabs */}
            <div className="flex flex-col gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-[#252526] p-1 rounded-lg border border-[#3e3e42]">
                        <button
                            onClick={() => setMode('quality')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                                viewMode === 'quality'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                    : 'text-[#888] hover:text-white'
                            }`}
                            title="Сортировка по Intelligence Index"
                        >
                            <Brain className="w-3.5 h-3.5" />
                            TOP по качеству
                        </button>
                        <button
                            onClick={() => setMode('value')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                                viewMode === 'value'
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                                    : 'text-[#888] hover:text-white'
                            }`}
                            title="Максимальный IQ/$ ratio"
                        >
                            <TrendingUp className="w-3.5 h-3.5" />
                            Цена/качество
                        </button>
                        <button
                            onClick={() => setMode('speed')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                                viewMode === 'speed'
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                                    : 'text-[#888] hover:text-white'
                            }`}
                            title="Сортировка по Output Speed"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            Самые быстрые
                        </button>
                        <button
                            onClick={() => setMode('imageVideo')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                                viewMode === 'imageVideo'
                                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg'
                                    : 'text-[#888] hover:text-white'
                            }`}
                            title="Открыть отдельные лидерборды Image & Video"
                        >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <Video className="w-3.5 h-3.5" />
                            Image/Video
                        </button>
                        <button
                            onClick={() => setMode('outputTokens')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                                viewMode === 'outputTokens'
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                    : 'text-[#888] hover:text-white'
                            }`}
                            title="Output tokens (tok/s)"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            Output tokens
                        </button>
                    </div>

                    <button
                        onClick={() => setShowOnlyOpen(!showOnlyOpen)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                            showOnlyOpen
                                ? 'bg-green-900/40 text-green-400 border-green-500/50'
                                : 'bg-[#252526] text-[#888] border-[#3e3e42] hover:border-[#555]'
                        }`}
                    >
                        <Unlock className="w-3.5 h-3.5" />
                        Open Source
                    </button>
                </div>
            </div>

            {/* Table / Panels */}
            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-16 bg-[#252526] rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : viewMode === 'imageVideo' ? (
                <div className="bg-[#252526] border border-[#3e3e42] rounded-lg p-5">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#1e1e1e] rounded-lg border border-[#333]">
                            <ImageIcon className="w-4 h-4 text-sky-400" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-white">Image & Video Leaderboards</div>
                            <div className="text-xs text-[#888] mt-1">
                                У Artificial Analysis отдельные лидерборды для изображений и видео. Я не подтягиваю их данные в приложение, чтобы не раздувать загрузку — но даю быстрые ссылки.
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <a
                                    href="https://artificialanalysis.ai/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] hover:bg-[#2a2d2e] border border-[#333] rounded-lg text-xs font-bold text-white transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                                    Открыть лидерборды (AA)
                                </a>
                                <a
                                    href="https://artificialanalysis.ai/?intelligence=agentic-index"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] hover:bg-[#2a2d2e] border border-[#333] rounded-lg text-xs font-bold text-white transition-colors"
                                >
                                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                                    Вернуться к моделям (Agentic Index)
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border border-[#3e3e42] rounded-lg overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#3e3e42] sticky top-0 z-10 bg-[#1e1e1e]/95 backdrop-blur">
                                <th className="text-left py-3 px-3 text-[10px] font-bold text-[#888] uppercase tracking-wider">
                                    #
                                </th>
                                <th className="text-left py-3 px-3 text-[10px] font-bold text-[#888] uppercase tracking-wider min-w-[200px]">
                                    Модель
                                </th>
                                <th 
                                    className="text-left py-3 px-3 text-[10px] font-bold text-[#888] uppercase tracking-wider cursor-pointer hover:text-white transition-colors group"
                                    onClick={() => handleSort('intelligence')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Brain className="w-3.5 h-3.5" />
                                        {viewMode === 'quality' ? 'Качество (Index)' : 'Intelligence'}
                                        <SortIcon columnKey="intelligence" />
                                    </div>
                                </th>
                                <th 
                                    className="text-left py-3 px-3 text-[10px] font-bold text-[#888] uppercase tracking-wider cursor-pointer hover:text-white transition-colors group"
                                    onClick={() => handleSort('price')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        Цена
                                        <SortIcon columnKey="price" />
                                    </div>
                                </th>
                                <th 
                                    className="text-left py-3 px-3 text-[10px] font-bold text-[#888] uppercase tracking-wider cursor-pointer hover:text-white transition-colors group"
                                    onClick={() => handleSort('speed')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5" />
                                        {viewMode === 'outputTokens' ? 'Output tok/s' : 'Скорость'}
                                        <SortIcon columnKey="speed" />
                                    </div>
                                </th>
                                <th 
                                    className="text-left py-3 px-3 text-[10px] font-bold text-[#888] uppercase tracking-wider cursor-pointer hover:text-white transition-colors group"
                                    onClick={() => handleSort('context')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Timer className="w-3.5 h-3.5" />
                                        Контекст
                                        <SortIcon columnKey="context" />
                                    </div>
                                </th>
                                <th 
                                    className="text-left py-3 px-3 text-[10px] font-bold text-[#888] uppercase tracking-wider cursor-pointer hover:text-white transition-colors group"
                                    onClick={() => handleSort('valueRatio')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-3.5 h-3.5" />
                                        {viewMode === 'value' ? 'IQ/$ (лучшее)' : 'IQ/$'}
                                        <SortIcon columnKey="valueRatio" />
                                    </div>
                                </th>
                                <th className="text-right py-3 px-3 text-[10px] font-bold text-[#888] uppercase tracking-wider">
                                    Детали
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedModels.map((model, index) => {
                                const rank = index + 1;
                                const valueRatio = model.pricePerMTokens > 0 
                                    ? (model.intelligenceIndex / model.pricePerMTokens).toFixed(1) 
                                    : '∞';

                                const rowHref = `https://artificialanalysis.ai${model.detailsUrl}`;
                                
                                return (
                                    <tr 
                                        key={model.name}
                                        onClick={() => window.open(rowHref, '_blank', 'noopener,noreferrer')}
                                        className={`
                                            group border-b border-[#2a2d2e] transition-all cursor-pointer
                                            ${index % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#1b1b1b]'}
                                            hover:bg-[#252526]
                                            ${rank === 1 ? 'shadow-[inset_3px_0_0_0_rgba(234,179,8,0.6)]' : ''}
                                            ${rank === 2 ? 'shadow-[inset_3px_0_0_0_rgba(148,163,184,0.6)]' : ''}
                                            ${rank === 3 ? 'shadow-[inset_3px_0_0_0_rgba(249,115,22,0.6)]' : ''}
                                        `}
                                    >
                                        {/* Rank */}
                                        <td className="py-3 px-3">
                                            <RankBadge rank={rank} />
                                        </td>
                                        
                                        {/* Model name + org + badges */}
                                        <td className="py-3 px-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                                                        {model.name}
                                                    </span>
                                                    {model.isReasoning && (
                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-900/40 text-purple-300 text-[9px] font-bold rounded border border-purple-500/30">
                                                            <Sparkles className="w-2.5 h-2.5" />
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
                                                <span className="text-[11px] text-[#888]">{model.organization}</span>
                                            </div>
                                        </td>

                                        {/* Intelligence */}
                                        <td className="py-3 px-3">
                                            <div className="w-40">
                                                <IntelligenceBar value={model.intelligenceIndex} />
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="py-3 px-3">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-bold text-white text-sm">
                                                    ${model.pricePerMTokens.toFixed(2)}
                                                </span>
                                                <span className="text-[10px] text-[#666]">/1M tok</span>
                                            </div>
                                        </td>

                                        {/* Speed */}
                                        <td className="py-3 px-3">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-bold text-white text-sm">
                                                    {model.outputSpeed || '—'}
                                                </span>
                                                <span className="text-[10px] text-[#666]">tok/s</span>
                                            </div>
                                        </td>

                                        {/* Context */}
                                        <td className="py-3 px-3">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-bold text-white text-sm">
                                                    {formatContext(model.contextWindow)}
                                                </span>
                                                <span className="text-[10px] text-[#666]">токенов</span>
                                            </div>
                                        </td>

                                        {/* Value Ratio */}
                                        <td className="py-3 px-3">
                                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 text-xs font-bold rounded border border-green-500/30">
                                                {valueRatio}
                                            </div>
                                        </td>

                                        {/* Details link */}
                                        <td className="py-3 px-3 text-right">
                                            <a 
                                                href={rowHref}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 p-1.5 text-[#666] hover:text-[#007acc] transition-colors"
                                                title="Подробнее на Artificial Analysis"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            {/* Footer info */}
            <div className="mt-6 flex items-start gap-2 p-3 bg-[#252526] border border-[#3e3e42] rounded-lg text-[10px] text-[#888]">
                <Info className="w-4 h-4 text-[#007acc] mt-0.5 shrink-0" />
                <div>
                    <p>
                        <strong className="text-white">Intelligence Index</strong> — комплексная метрика от Artificial Analysis (MMLU-Pro, GPQA, LiveCodeBench, AIME 2025 и др.)
                    </p>
                    <p className="mt-1">
                        <strong className="text-white">Цена</strong> — средневзвешенная input/output в соотношении 3:1. 
                        <strong className="text-white ml-2">IQ/$</strong> — соотношение качества к цене (выше = выгоднее).
                    </p>
                </div>
            </div>
        </div>
    );
};
