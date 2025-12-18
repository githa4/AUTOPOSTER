import React, { useEffect, useMemo, useState } from 'react';
import {
  Boxes,
  RefreshCw,
  Search,
  ExternalLink,
  Info,
  Cpu,
  Image as ImageIcon,
  Video,
  Mic,
  Code,
  MessageSquare,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { fetchOpenRouterModels, OpenRouterModel } from '../../services/openRouterModelsService';

type OpenRouterCategory =
  | 'all'
  | 'text'
  | 'coding'
  | 'image'
  | 'video'
  | 'audio'
  | 'multimodal';

type SortKey = 'rank' | 'created' | 'context' | 'priceIn' | 'priceOut';

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9/_\-.]/g, '');

const toPerM = (perToken: string | undefined): number | undefined => {
  if (!perToken) return undefined;
  const parsed = Number.parseFloat(perToken);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed * 1_000_000;
};

const formatContext = (n?: number) => {
  if (!n) return '—';
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
};

const formatUsdPerM = (value?: number) => {
  if (!value) return '—';
  return `$${value.toFixed(2)}/1M`;
};

const formatDate = (unixSeconds?: number) => {
  if (!unixSeconds) return '—';
  return new Date(unixSeconds * 1000).toLocaleDateString();
};

const detectCategory = (model: OpenRouterModel): OpenRouterCategory => {
  const modality = normalize(model.architecture?.modality ?? '');
  const id = normalize(model.id);
  const name = normalize(model.name);

  const isVideo = modality.includes('video') || id.includes('video') || name.includes('video');
  if (isVideo) return 'video';

  const isAudio = modality.includes('audio') || id.includes('audio') || name.includes('audio');
  if (isAudio) return 'audio';

  const isImage = modality.includes('image') || id.includes('image') || name.includes('image');

  const isText = modality.includes('text') || modality.includes('llm') || modality === '';
  const isMulti = isImage && isText;
  if (isMulti) return 'multimodal';
  if (isImage) return 'image';

  const isCoding =
    id.includes('code') ||
    name.includes('code') ||
    id.includes('coder') ||
    name.includes('coder') ||
    id.includes('coding') ||
    name.includes('coding');
  if (isCoding) return 'coding';

  return 'text';
};

const Badge: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase border bg-[#252526] text-[#ccc] border-[#3e3e42]">
    {label}
  </span>
);

export const OpenRouterExplorer: React.FC = () => {
  const { t } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [category, setCategory] = useState<OpenRouterCategory>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOpenRouterModels();
      setModels(data);
      setLastUpdated(Date.now());
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const enriched = useMemo(() => {
    return models.map(m => {
      const inputPerM = toPerM(m.pricing?.prompt);
      const outputPerM = toPerM(m.pricing?.completion);
      const cat = detectCategory(m);

      return {
        model: m,
        category: cat,
        inputPerM,
        outputPerM,
        context:
          m.context_length ??
          m.top_provider?.context_length ??
          m.per_request_limits?.max_input_tokens,
      };
    });
  }, [models]);

  const filtered = useMemo(() => {
    const q = normalize(search);

    const list = enriched.filter(x => {
      if (category !== 'all' && x.category !== category) return false;

      if (!q) return true;
      const hay = `${x.model.id} ${x.model.name} ${x.model.canonical_slug ?? ''}`;
      return normalize(hay).includes(q);
    });

    const cmp = (a: typeof list[number], b: typeof list[number]) => {
      if (sortKey === 'rank') {
        const aScore = (a.model.pricing?.prompt ? 0 : 1) + (a.context ? 0 : 1);
        const bScore = (b.model.pricing?.prompt ? 0 : 1) + (b.context ? 0 : 1);
        if (aScore !== bScore) return aScore - bScore;
        return a.model.id.localeCompare(b.model.id);
      }

      if (sortKey === 'created') return (b.model.created ?? 0) - (a.model.created ?? 0);
      if (sortKey === 'context') return (b.context ?? 0) - (a.context ?? 0);
      if (sortKey === 'priceIn') return (a.inputPerM ?? Number.POSITIVE_INFINITY) - (b.inputPerM ?? Number.POSITIVE_INFINITY);
      if (sortKey === 'priceOut') return (a.outputPerM ?? Number.POSITIVE_INFINITY) - (b.outputPerM ?? Number.POSITIVE_INFINITY);
      return 0;
    };

    return [...list].sort(cmp);
  }, [category, enriched, search, sortKey]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return enriched.find(x => x.model.id === selectedId) ?? null;
  }, [enriched, selectedId]);

  const categories: Array<{
    key: OpenRouterCategory;
    icon: React.ElementType;
    label: string;
  }> = [
    { key: 'all', icon: Boxes, label: t('orCategoryAll') },
    { key: 'text', icon: MessageSquare, label: t('orCategoryText') },
    { key: 'coding', icon: Code, label: t('orCategoryCoding') },
    { key: 'image', icon: ImageIcon, label: t('orCategoryImage') },
    { key: 'video', icon: Video, label: t('orCategoryVideo') },
    { key: 'audio', icon: Mic, label: t('orCategoryAudio') },
    { key: 'multimodal', icon: Cpu, label: t('orCategoryMultimodal') },
  ];

  return (
    <div className="mt-6 border border-[#3e3e42] rounded-lg bg-[#1e1e1e] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#252526] bg-[#1e1e1e] flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <Boxes className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {t('orTitle')}
                </h3>
                <a
                  href="https://openrouter.ai/models"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#007acc] hover:underline text-xs flex items-center gap-1"
                >
                  {t('orOpenOfficial')} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-[#858585]">{t('orDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#666] hidden md:block">
              {t('benchUpdate')}: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
            <button
              onClick={load}
              disabled={loading}
              className="p-2 bg-[#252526] hover:bg-[#333] rounded border border-[#3e3e42] text-[#ccc] transition-colors"
              title={t('orRefresh')}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all border ${
                  category === key
                    ? 'bg-[#37373d] text-white border-[#3e3e42]'
                    : 'bg-[#252526] text-[#858585] border-[#3e3e42] hover:text-[#ccc]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#666]" />
              <input
                type="text"
                placeholder={t('orSearchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#252526] border border-[#3e3e42] rounded px-3 py-2 pl-9 text-xs text-white outline-none focus:border-[#007acc]"
              />
            </div>

            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              className="bg-[#252526] border border-[#3e3e42] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#007acc]"
              aria-label={t('orSort')}
            >
              <option value="rank">{t('orSortSmart')}</option>
              <option value="created">{t('orSortCreated')}</option>
              <option value="context">{t('orSortContext')}</option>
              <option value="priceIn">{t('orSortPriceIn')}</option>
              <option value="priceOut">{t('orSortPriceOut')}</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="mt-1 p-3 bg-[#252526] border border-red-500/30 rounded text-xs">
            <div className="text-red-400 font-bold">{t('lblError')}</div>
            <div className="text-red-300 break-words">{error}</div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0">
        <div className="overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#252526] text-[10px] font-bold text-[#858585] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b border-[#3e3e42]">{t('orColModel')}</th>
                <th className="p-4 border-b border-[#3e3e42] w-28">{t('orColType')}</th>
                <th className="p-4 border-b border-[#3e3e42] w-28">{t('hubColContext')}</th>
                <th className="p-4 border-b border-[#3e3e42] w-40">{t('hubColCost')}</th>
                <th className="p-4 border-b border-[#3e3e42] w-28 hidden md:table-cell">{t('orColCreated')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d2e]">
              {loading && models.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-56 bg-[#333] rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-[#333] rounded" /></td>
                    <td className="p-4"><div className="h-4 w-12 bg-[#333] rounded" /></td>
                    <td className="p-4"><div className="h-4 w-28 bg-[#333] rounded" /></td>
                    <td className="p-4 hidden md:table-cell"><div className="h-4 w-16 bg-[#333] rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#666] text-xs italic">
                    {t('benchNoMatches').replace('{query}', search)}
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 120).map(x => (
                  <tr
                    key={x.model.id}
                    className={`hover:bg-[#252526] transition-colors cursor-pointer ${
                      selectedId === x.model.id ? 'bg-[#252526]' : ''
                    }`}
                    onClick={() => setSelectedId(x.model.id)}
                  >
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-white">
                          {x.model.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#858585] break-all">
                          {x.model.id}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {x.model.pricing?.web_search && x.model.pricing.web_search !== '0' ? (
                            <Badge label="web" />
                          ) : null}
                          {x.model.pricing?.image && x.model.pricing.image !== '0' ? (
                            <Badge label="image" />
                          ) : null}
                          {x.model.pricing?.audio && x.model.pricing.audio !== '0' ? (
                            <Badge label="audio" />
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge label={x.category} />
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-[#ccc]">{formatContext(x.context)}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-[10px] text-[#ccc] font-mono">
                        <div>in: {formatUsdPerM(x.inputPerM)}</div>
                        <div>out: {formatUsdPerM(x.outputPerM)}</div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-xs text-[#ccc]">{formatDate(x.model.created)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="px-6 py-3 border-t border-[#252526] text-[10px] text-[#858585] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#007acc] mt-0.5 shrink-0" />
            <div>
              <div>{t('orLimitNote')}</div>
              <div className="mt-1">
                {t('hubShowing')
                  .replace('{count}', String(Math.min(filtered.length, 120)))
                  .replace('{total}', String(filtered.length))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-[#252526] bg-[#1e1e1e]">
          <div className="px-6 py-4 border-b border-[#252526]">
            <div className="text-[10px] text-[#858585] uppercase tracking-wider font-bold">
              {t('orDetails')}
            </div>
          </div>

          {selected ? (
            <div className="px-6 py-4 space-y-4">
              <div>
                <div className="text-sm font-bold text-white break-words">
                  {selected.model.name}
                </div>
                <a
                  href={`https://openrouter.ai/models/${selected.model.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#007acc] hover:underline text-xs flex items-center gap-1 mt-1 break-all"
                >
                  {selected.model.id} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {selected.model.description ? (
                <div className="text-[11px] text-[#ccc] leading-relaxed">
                  {selected.model.description}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                  <div className="text-[9px] text-[#858585] font-bold uppercase">{t('hubColContext')}</div>
                  <div className="text-xs font-mono text-white mt-1">{formatContext(selected.context)}</div>
                </div>
                <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                  <div className="text-[9px] text-[#858585] font-bold uppercase">{t('orCreated')}</div>
                  <div className="text-xs font-mono text-white mt-1">{formatDate(selected.model.created)}</div>
                </div>
              </div>

              <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                <div className="text-[9px] text-[#858585] font-bold uppercase">{t('hubColCost')}</div>
                <div className="text-xs font-mono text-white mt-1">
                  in: {formatUsdPerM(selected.inputPerM)}
                </div>
                <div className="text-xs font-mono text-white mt-1">
                  out: {formatUsdPerM(selected.outputPerM)}
                </div>
              </div>

              {selected.model.supported_parameters?.length ? (
                <div>
                  <div className="text-[10px] text-[#858585] uppercase tracking-wider font-bold">
                    {t('orSupportedParams')}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selected.model.supported_parameters.slice(0, 18).map(p => (
                      <Badge key={p} label={p} />
                    ))}
                  </div>
                </div>
              ) : null}

              {(selected.model.per_request_limits?.max_input_tokens ||
                selected.model.per_request_limits?.max_output_tokens) ? (
                <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                  <div className="text-[10px] text-[#858585] uppercase tracking-wider font-bold">
                    {t('orLimits')}
                  </div>
                  <div className="text-xs font-mono text-[#ccc] mt-2">
                    in: {selected.model.per_request_limits?.max_input_tokens ?? '—'}
                  </div>
                  <div className="text-xs font-mono text-[#ccc] mt-1">
                    out: {selected.model.per_request_limits?.max_output_tokens ?? '—'}
                  </div>
                </div>
              ) : null}

              <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                <div className="text-[10px] text-[#858585] uppercase tracking-wider font-bold">
                  {t('hubRaw')}
                </div>
                <pre className="mt-2 text-[10px] text-[#ccc] whitespace-pre-wrap break-words max-h-60 overflow-auto custom-scrollbar">
{JSON.stringify(selected.model, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="px-6 py-10 text-center text-[#666] text-xs italic">
              {t('orPickModel')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
