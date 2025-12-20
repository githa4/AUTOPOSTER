/**
 * BenchmarksPage - Страница аналитики моделей AI
 * 
 * Содержит:
 * - ArtificialAnalysisRating: TOP моделей по Intelligence Index от AA
 * - MultiProviderExplorer: цены от 9+ провайдеров
 * - OpenRouterExplorer: детальный просмотр OpenRouter каталога
 */

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart2, Brain, Boxes, Server } from 'lucide-react';

type BenchTab = 'aa' | 'providers' | 'openrouter';

const LS_BENCH_TAB = 'autopost_benchmarks_active_tab';

const safeLoadTab = (): BenchTab => {
    try {
        const raw = localStorage.getItem(LS_BENCH_TAB);
        if (raw === 'aa' || raw === 'providers' || raw === 'openrouter') return raw;
    } catch {
        // ignore
    }
    return 'aa';
};

const LoadingPanel: React.FC<{ label?: string }> = ({ label }) => (
    <div className="bg-[#252526] border border-[#3e3e42] rounded p-6 animate-fade-in">
        <div className="text-xs text-[#888]">{label || 'Загрузка…'}</div>
        <div className="mt-4 h-2 bg-[#333] rounded overflow-hidden">
            <div className="h-full w-1/3 bg-[#007acc] animate-[shimmer_1.5s_infinite]" />
        </div>
    </div>
);

const LazyArtificialAnalysisRating = React.lazy(async () => {
    const mod = await import('./benchmarks/ArtificialAnalysisRating');
    return { default: mod.ArtificialAnalysisRating };
});

const LazyMultiProviderExplorer = React.lazy(async () => {
    const mod = await import('./benchmarks/MultiProviderExplorer');
    return { default: mod.MultiProviderExplorer };
});

const LazyOpenRouterExplorer = React.lazy(async () => {
    const mod = await import('./benchmarks/OpenRouterExplorer');
    return { default: mod.OpenRouterExplorer };
});

export const BenchmarksPage: React.FC = () => {
    const { t } = useAppContext();
    const [activeTab, setActiveTab] = useState<BenchTab>(safeLoadTab);

    useEffect(() => {
        try {
            localStorage.setItem(LS_BENCH_TAB, activeTab);
        } catch {
            // ignore
        }
    }, [activeTab]);

    const contentTitle = useMemo(() => {
        if (activeTab === 'aa') return 'Artificial Analysis рейтинг';
        if (activeTab === 'providers') return 'Цены у провайдеров';
        return 'OpenRouter каталог';
    }, [activeTab]);

    const NavItem = ({
        id,
        icon: Icon,
        label,
        colorClass,
    }: {
        id: BenchTab;
        icon: any;
        label: string;
        colorClass: string;
    }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full text-left p-3 rounded-md mb-2 flex items-center gap-3 transition-all border ${
                activeTab === id
                    ? `bg-[#37373d] text-white border-l-4 ${String(colorClass || '').startsWith('text-') ? String(colorClass).replace('text-', 'border-') : ''} border-t-transparent border-r-transparent border-b-transparent shadow-sm`
                    : 'text-[#969696] border-transparent hover:bg-[#2a2d2e] hover:text-[#e0e0e0]'
            }`}
        >
            <Icon className={`w-5 h-5 ${activeTab === id ? colorClass : ''}`} />
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </button>
    );

    return (
        <div className="flex h-full bg-[#1e1e1e] text-slate-300 overflow-hidden font-sans select-none animate-fade-in flex-col">
            
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-8 border-b border-[#252526] bg-[#1e1e1e] shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-900/20 rounded-lg border border-blue-500/20">
                        <BarChart2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">{t('benchTitle')}</h2>
                        <p className="text-xs text-[#858585]">{t('benchDesc')}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
                <div className="w-64 bg-[#252526] border-r border-[#1e1e1e] flex flex-col shrink-0">
                    <div className="h-14 flex items-center px-6 border-b border-[#1e1e1e]">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#cccccc] flex items-center gap-2">
                            <BarChart2 className="w-4 h-4" /> {t('benchTitle')}
                        </span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                        <NavItem id="aa" icon={Brain} label="Artificial Analysis" colorClass="text-purple-400" />
                        <NavItem id="providers" icon={Boxes} label="Провайдеры" colorClass="text-blue-400" />
                        <NavItem id="openrouter" icon={Server} label="OpenRouter" colorClass="text-sky-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="w-full flex flex-col gap-6 pb-20">
                        <div className="flex items-center gap-2 text-xs text-[#888]">
                            <span className="font-bold text-white">{contentTitle}</span>
                            <span className="opacity-50">•</span>
                            <span className="opacity-80">Только выбранная вкладка загружается и рендерится</span>
                        </div>

                        <Suspense fallback={<LoadingPanel label="Загружаю модуль…" />}>
                            {activeTab === 'aa' && <LazyArtificialAnalysisRating />}
                            {activeTab === 'providers' && <LazyMultiProviderExplorer />}
                            {activeTab === 'openrouter' && <LazyOpenRouterExplorer />}
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
};
