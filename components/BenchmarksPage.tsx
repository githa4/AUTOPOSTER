
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { fetchBenchmarks, BenchmarkEntry } from '../services/benchmarkService';
import { 
    BarChart2, 
    RefreshCw, 
    Trophy, 
    Code, 
    MessageSquare, 
    Search,
    Info,
    ExternalLink,
    Lock,
    Unlock
} from 'lucide-react';

const RankBadge = ({ rank }: { rank: number }) => {
    if (rank === 1) return <div className="w-6 h-6 rounded bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-xs border border-yellow-500/50">1</div>;
    if (rank === 2) return <div className="w-6 h-6 rounded bg-slate-300/20 text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-300/50">2</div>;
    if (rank === 3) return <div className="w-6 h-6 rounded bg-orange-700/20 text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-700/50">3</div>;
    return <div className="w-6 h-6 rounded bg-[#2a2d2e] text-[#666] flex items-center justify-center font-mono text-xs">{rank}</div>;
};

const EloBar = ({ score, maxScore }: { score: number, maxScore: number }) => {
    // Normalize logic: Assume roughly 1300 is the baseline for "good" models now.
    // Calculate percentage relative to the gap between ~1300 and maxScore
    const min = 1350;
    const percent = Math.max(5, ((score - min) / (maxScore - min)) * 100);
    
    return (
        <div className="flex items-center gap-2 w-full max-w-[140px]">
            <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-500" 
                    style={{ width: `${percent}%` }}
                />
            </div>
            <span className="text-[10px] font-mono text-[#ccc] w-8 text-right">{score}</span>
        </div>
    );
};

export const BenchmarksPage: React.FC = () => {
    const { t } = useAppContext();
    const [category, setCategory] = useState<'text' | 'code'>('text');
    const [data, setData] = useState<BenchmarkEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await fetchBenchmarks(category);
            setData(result.data);
            setLastUpdated(result.timestamp);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [category]);

    const filteredData = data.filter(item => 
        item.model.toLowerCase().includes(search.toLowerCase()) || 
        item.organization.toLowerCase().includes(search.toLowerCase())
    );

    const maxScore = Math.max(...data.map(d => d.score));

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
                
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#666] hidden md:block">
                        {t('benchUpdate')}: {new Date(lastUpdated).toLocaleTimeString()}
                    </span>
                    <button 
                        onClick={loadData}
                        disabled={loading}
                        className="p-2 bg-[#252526] hover:bg-[#333] rounded border border-[#3e3e42] text-[#ccc] transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="px-8 py-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex bg-[#252526] p-1 rounded-lg border border-[#3e3e42]">
                    <button 
                        onClick={() => setCategory('text')}
                        className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${category === 'text' ? 'bg-[#37373d] text-white shadow-sm' : 'text-[#858585] hover:text-[#ccc]'}`}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {t('benchText')}
                    </button>
                    <button 
                        onClick={() => setCategory('code')}
                        className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${category === 'code' ? 'bg-[#37373d] text-white shadow-sm' : 'text-[#858585] hover:text-[#ccc]'}`}
                    >
                        <Code className="w-3.5 h-3.5" />
                        {t('benchCode')}
                    </button>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#666]" />
                    <input 
                        type="text" 
                        placeholder={t('benchFilterPlaceholder')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-[#252526] border border-[#3e3e42] rounded px-3 py-2 pl-9 text-xs text-white outline-none focus:border-[#007acc]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto px-8 pb-8 custom-scrollbar">
                <div className="border border-[#3e3e42] rounded-lg bg-[#1e1e1e] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#252526] text-[10px] font-bold text-[#858585] uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="p-4 border-b border-[#3e3e42] w-16 text-center">{t('benchRank')}</th>
                                <th className="p-4 border-b border-[#3e3e42]">{t('benchModel')}</th>
                                <th className="p-4 border-b border-[#3e3e42] w-48">{t('benchScore')}</th>
                                <th className="p-4 border-b border-[#3e3e42] hidden md:table-cell">{t('benchVotes')}</th>
                                <th className="p-4 border-b border-[#3e3e42] hidden sm:table-cell">{t('benchOrganization')}</th>
                                <th className="p-4 border-b border-[#3e3e42] w-24 text-center">{t('benchLicense')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2d2e]">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-6 w-6 bg-[#333] rounded mx-auto"></div></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-[#333] rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-[#333] rounded"></div></td>
                                        <td className="p-4 hidden md:table-cell"><div className="h-4 w-12 bg-[#333] rounded"></div></td>
                                        <td className="p-4 hidden sm:table-cell"><div className="h-4 w-20 bg-[#333] rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-16 bg-[#333] rounded mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-[#666] text-xs italic">
                                        {t('benchNoMatches').replace('{query}', search)}
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.model} className="hover:bg-[#252526] transition-colors group">
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center"><RankBadge rank={item.rank} /></div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white group-hover:text-[#007acc] transition-colors">
                                                    {item.model}
                                                </span>
                                                {item.rank <= 3 && <Trophy className="w-3 h-3 text-yellow-500 opacity-50" />}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <EloBar score={item.score} maxScore={maxScore} />
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <span className="text-xs font-mono text-[#858585]">{item.votes.toLocaleString()}</span>
                                        </td>
                                        <td className="p-4 hidden sm:table-cell">
                                            <span className="text-xs text-[#ccc]">{item.organization}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div 
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                                    item.isProprietary 
                                                    ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' 
                                                    : 'bg-green-900/20 text-green-400 border-green-500/30'
                                                }`}
                                            >
                                                {item.isProprietary ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                                                {item.isProprietary ? t('benchProprietaryShort') : t('benchOpenShort')}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex items-start gap-2 p-3 bg-[#252526] border border-[#3e3e42] rounded text-[10px] text-[#858585]">
                    <Info className="w-4 h-4 text-[#007acc] mt-0.5 shrink-0" />
                    <div>
                        <p>{t('benchNote')}</p>
                        <a href="https://lmarena.ai" target="_blank" rel="noreferrer" className="text-[#007acc] hover:underline flex items-center gap-1 mt-1">
                            {t('benchVisitOfficial')} <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
