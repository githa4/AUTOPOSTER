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

type SortKey =
  | 'rank'
  | 'name'
  | 'created'
  | 'context'
  | 'priceIn'
  | 'priceOut'
  | 'priceImage'
  | 'priceAudio'
  | 'priceRequest'
  | 'priceWebSearch'
  | 'priceCacheRead'
  | 'supportedParams';

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

const formatUsd = (valueRaw?: string) => {
  if (!valueRaw || valueRaw === '0') return '—';
  const parsed = Number.parseFloat(valueRaw);
  if (!Number.isFinite(parsed)) return '—';
  return `$${parsed}`;
};

const parseModality = (
  modalityRaw: string | undefined,
): { inputs: Set<string>; outputs: Set<string> } => {
  const modality = (modalityRaw ?? '').toLowerCase().trim();
  const [left, right] = modality.split('->');

  const parseSide = (side: string | undefined): Set<string> => {
    const set = new Set<string>();
    if (!side) return set;
    for (const part of side.split('+')) {
      const token = part.trim();
      if (!token) continue;
      set.add(token);
    }
    return set;
  };

  return {
    inputs: parseSide(left),
    outputs: parseSide(right),
  };
};

const detectCategory = (model: OpenRouterModel): OpenRouterCategory => {
  const modalityRaw = model.architecture?.modality;
  const { inputs, outputs } = parseModality(modalityRaw);
  const modality = normalize(modalityRaw ?? '');
  const id = normalize(model.id);
  const name = normalize(model.name);

  // Prefer explicit I/O modality from API.
  if (outputs.has('video') || inputs.has('video') || modality.includes('video')) return 'video';
  if (outputs.has('audio') || inputs.has('audio') || modality.includes('audio')) return 'audio';

  // Models that can OUTPUT images should show up under Image.
  // Vision-only models (image input -> text output) go to Multimodal.
  const outputsImage = outputs.has('image');
  const inputsImage = inputs.has('image');
  if (outputsImage) return 'image';
  if (inputsImage) return 'multimodal';

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

const AccentBadge: React.FC<{
  label: string;
  variant: 'new' | 'free';
}> = ({ label, variant }) => {
  const cls =
    variant === 'new'
      ? 'border-blue-500/30 bg-blue-900/20 text-blue-200'
      : 'border-green-500/30 bg-green-900/20 text-green-200';

  return (
    <span
      className={
        `inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${cls}`
      }
    >
      {label}
    </span>
  );
};

export const OpenRouterExplorer: React.FC = () => {
  const { t } = useAppContext();

  const LS_RIGHT_WIDTH = 'autopost_or_details_width_px';

  const [detailsWidthPx, setDetailsWidthPx] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(LS_RIGHT_WIDTH);
      const parsed = raw ? Number.parseInt(raw, 10) : NaN;
      return Number.isFinite(parsed) ? parsed : 360;
    } catch {
      return 360;
    }
  });

  const [isResizing, setIsResizing] = useState(false);
  const [isWideLayout, setIsWideLayout] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(min-width: 1024px)').matches;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [category, setCategory] = useState<OpenRouterCategory>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [onlyFree, setOnlyFree] = useState(false);
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
    const NEW_DAYS = 30;
    const nowMs = Date.now();

    return models.map(m => {
      const inputPerM = toPerM(m.pricing?.prompt);
      const outputPerM = toPerM(m.pricing?.completion);
      const imagePerM = toPerM(m.pricing?.image);
      const audioPerM = toPerM(m.pricing?.audio);
      const requestPerM = toPerM(m.pricing?.request);
      const webSearchPerM = toPerM(m.pricing?.web_search);
      const cacheReadPerM = toPerM(m.pricing?.input_cache_read);
      const cat = detectCategory(m);

      const idLower = (m.id ?? '').toLowerCase();
      const nameLower = (m.name ?? '').toLowerCase();
      const slugLower = (m.canonical_slug ?? '').toLowerCase();
      const isFree = idLower.includes(':free') || nameLower.includes('free') || slugLower.includes('free');

      const isNew =
        typeof m.created === 'number'
          ? nowMs - m.created * 1000 <= NEW_DAYS * 24 * 60 * 60 * 1000
          : false;

      return {
        model: m,
        category: cat,
        inputPerM,
        outputPerM,
        imagePerM,
        audioPerM,
        requestPerM,
        webSearchPerM,
        cacheReadPerM,
        supportedParamsCount: m.supported_parameters?.length ?? 0,
        isFree,
        isNew,
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
      if (onlyFree && !x.isFree) return false;

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

      if (sortKey === 'name') return a.model.name.localeCompare(b.model.name);

      if (sortKey === 'created') return (b.model.created ?? 0) - (a.model.created ?? 0);
      if (sortKey === 'context') return (b.context ?? 0) - (a.context ?? 0);
      if (sortKey === 'priceIn') return (a.inputPerM ?? Number.POSITIVE_INFINITY) - (b.inputPerM ?? Number.POSITIVE_INFINITY);
      if (sortKey === 'priceOut') return (a.outputPerM ?? Number.POSITIVE_INFINITY) - (b.outputPerM ?? Number.POSITIVE_INFINITY);
      if (sortKey === 'priceImage') return (a.imagePerM ?? Number.POSITIVE_INFINITY) - (b.imagePerM ?? Number.POSITIVE_INFINITY);
      if (sortKey === 'priceAudio') return (a.audioPerM ?? Number.POSITIVE_INFINITY) - (b.audioPerM ?? Number.POSITIVE_INFINITY);
      if (sortKey === 'priceRequest') return (a.requestPerM ?? Number.POSITIVE_INFINITY) - (b.requestPerM ?? Number.POSITIVE_INFINITY);
      if (sortKey === 'priceWebSearch') return (a.webSearchPerM ?? Number.POSITIVE_INFINITY) - (b.webSearchPerM ?? Number.POSITIVE_INFINITY);
      if (sortKey === 'priceCacheRead') return (a.cacheReadPerM ?? Number.POSITIVE_INFINITY) - (b.cacheReadPerM ?? Number.POSITIVE_INFINITY);
      if (sortKey === 'supportedParams') return (b.supportedParamsCount ?? 0) - (a.supportedParamsCount ?? 0);
      return 0;
    };

    return [...list].sort(cmp);
  }, [category, enriched, onlyFree, search, sortKey]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return enriched.find(x => x.model.id === selectedId) ?? null;
  }, [enriched, selectedId]);

  const apiGroups = useMemo(() => {
    if (!selected) return [] as Array<{ title: string; rows: Array<[string, string]> }>;

    const m = selected.model;

    const pushRows = (rows: Array<[string, string]>, label: string, value: unknown) => {
      if (value === null || value === undefined) return;
      const str = typeof value === 'string' ? value : JSON.stringify(value);
      if (!str || str === '""') return;
      rows.push([label, str]);
    };

    const idRows: Array<[string, string]> = [];
    pushRows(idRows, 'id', m.id);
    pushRows(idRows, 'name', m.name);
    pushRows(idRows, 'canonical_slug', m.canonical_slug);
    pushRows(idRows, 'hugging_face_id', m.hugging_face_id);
    pushRows(idRows, 'created', m.created ? String(m.created) : undefined);
    pushRows(idRows, 'created_date', m.created ? formatDate(m.created) : undefined);

    const archRows: Array<[string, string]> = [];
    pushRows(archRows, 'architecture.modality', m.architecture?.modality);
    pushRows(archRows, 'architecture.tokenizer', m.architecture?.tokenizer);
    pushRows(archRows, 'architecture.instruct_type', m.architecture?.instruct_type);

    const ctxRows: Array<[string, string]> = [];
    pushRows(ctxRows, 'context_length', m.context_length);
    pushRows(ctxRows, 'top_provider.context_length', m.top_provider?.context_length);
    pushRows(ctxRows, 'top_provider.max_completion_tokens', m.top_provider?.max_completion_tokens);
    pushRows(ctxRows, 'top_provider.is_moderated', m.top_provider?.is_moderated);
    pushRows(ctxRows, 'per_request_limits.max_input_tokens', m.per_request_limits?.max_input_tokens);
    pushRows(ctxRows, 'per_request_limits.max_output_tokens', m.per_request_limits?.max_output_tokens);

    const pricingRows: Array<[string, string]> = [];
    const addPricing = (key: string, raw?: string) => {
      if (!raw || raw === '0') return;
      const perM = toPerM(raw);
      const perMText = perM ? ` (${formatUsdPerM(perM)})` : '';
      pricingRows.push([`pricing.${key}`, `${formatUsd(raw)}${perMText}`]);
    };
    addPricing('prompt', m.pricing?.prompt);
    addPricing('completion', m.pricing?.completion);
    addPricing('image', m.pricing?.image);
    addPricing('audio', m.pricing?.audio);
    addPricing('request', m.pricing?.request);
    addPricing('web_search', m.pricing?.web_search);
    addPricing('internal_reasoning', m.pricing?.internal_reasoning);
    addPricing('input_cache_read', m.pricing?.input_cache_read);

    const paramsRows: Array<[string, string]> = [];
    pushRows(paramsRows, 'supported_parameters', m.supported_parameters?.length ? m.supported_parameters.join(', ') : undefined);
    pushRows(paramsRows, 'default_parameters', m.default_parameters);

    const groups: Array<{ title: string; rows: Array<[string, string]> }> = [];
    if (idRows.length) groups.push({ title: t('orApiIdentity'), rows: idRows });
    if (archRows.length) groups.push({ title: t('orApiArchitecture'), rows: archRows });
    if (ctxRows.length) groups.push({ title: t('orApiLimitsProvider'), rows: ctxRows });
    if (pricingRows.length) groups.push({ title: t('orApiPricing'), rows: pricingRows });
    if (paramsRows.length) groups.push({ title: t('orApiParams'), rows: paramsRows });

    return groups;
  }, [selected, t]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_RIGHT_WIDTH, String(detailsWidthPx));
    } catch {
      // ignore
    }
  }, [detailsWidthPx]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsWideLayout(mq.matches);
    onChange();

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }

    // Safari fallback
    // @ts-expect-error legacy MediaQueryList
    mq.addListener(onChange);
    // @ts-expect-error legacy MediaQueryList
    return () => mq.removeListener(onChange);
  }, []);

  const startResize = (e: React.PointerEvent) => {
    if (!isWideLayout) return;

    e.preventDefault();
    setIsResizing(true);

    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const startX = e.clientX;
    const startWidth = detailsWidthPx;

    const MIN = 280;
    const MAX = 860;

    const onMove = (ev: PointerEvent) => {
      const dx = startX - ev.clientX; // dragging left increases panel width
      const next = Math.max(MIN, Math.min(MAX, startWidth + dx));
      setDetailsWidthPx(next);
    };

    const onUp = () => {
      setIsResizing(false);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevUserSelect;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

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

            <button
              onClick={() => setOnlyFree(v => !v)}
              className={
                `px-3 py-2 rounded border text-xs font-bold transition-colors ` +
                (onlyFree
                  ? 'bg-green-900/20 text-green-200 border-green-500/30'
                  : 'bg-[#252526] text-[#ccc] border-[#3e3e42] hover:bg-[#333]')
              }
              title={t('orFilterFree')}
            >
              {t('orFilterFree')}
            </button>

            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              className="bg-[#252526] border border-[#3e3e42] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#007acc]"
              aria-label={t('orSort')}
            >
              <option value="rank">{t('orSortSmart')}</option>
              <option value="name">{t('orSortName')}</option>
              <option value="created">{t('orSortCreated')}</option>
              <option value="context">{t('orSortContext')}</option>
              <option value="priceIn">{t('orSortPriceIn')}</option>
              <option value="priceOut">{t('orSortPriceOut')}</option>
              <option value="priceImage">{t('orSortPriceImage')}</option>
              <option value="priceAudio">{t('orSortPriceAudio')}</option>
              <option value="priceRequest">{t('orSortPriceRequest')}</option>
              <option value="priceWebSearch">{t('orSortPriceWebSearch')}</option>
              <option value="priceCacheRead">{t('orSortPriceCacheRead')}</option>
              <option value="supportedParams">{t('orSortSupportedParams')}</option>
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

      <div className="flex flex-col lg:flex-row">
        <div className="overflow-auto custom-scrollbar lg:flex-1 lg:min-w-0">
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
                          {x.isNew ? (
                            <AccentBadge label={t('orBadgeNew')} variant="new" />
                          ) : null}
                          {x.isFree ? (
                            <AccentBadge label={t('orBadgeFree')} variant="free" />
                          ) : null}
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

        {/* Resize handle (desktop) */}
        <div className="hidden lg:block">
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={t('orDetails')}
            onPointerDown={startResize}
            onDoubleClick={() => setDetailsWidthPx(360)}
            className={
              `w-3 cursor-col-resize relative transition-colors ` +
              (isResizing ? 'bg-[#2a2d2e]' : 'bg-transparent hover:bg-[#252526]')
            }
            style={{
              touchAction: 'none',
            }}
          >
            <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#3e3e42]" />
            <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 -ml-[3px] w-px bg-[#3e3e42]/70" />
            <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 ml-[3px] w-px bg-[#3e3e42]/70" />
          </div>
        </div>

        <div
          className="border-t lg:border-t-0 lg:border-l border-[#252526] bg-[#1e1e1e]"
          style={{
            width: isWideLayout ? detailsWidthPx : '100%',
            flex: '0 0 auto',
          }}
        >
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
                {selected.model.pricing?.image && selected.model.pricing.image !== '0' ? (
                  <div className="text-xs font-mono text-white mt-1">
                    img: {formatUsdPerM(selected.imagePerM)}
                  </div>
                ) : null}
                {selected.model.pricing?.audio && selected.model.pricing.audio !== '0' ? (
                  <div className="text-xs font-mono text-white mt-1">
                    audio: {formatUsdPerM(selected.audioPerM)}
                  </div>
                ) : null}
              </div>

              {apiGroups.length ? (
                <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                  <div className="text-[10px] text-[#858585] uppercase tracking-wider font-bold">
                    {t('orApiFieldsTitle')}
                  </div>

                  <div className="mt-3 space-y-3">
                    {apiGroups.map(g => (
                      <div key={g.title}>
                        <div className="text-[9px] text-[#858585] font-bold uppercase">
                          {g.title}
                        </div>
                        <div className="mt-2 space-y-1">
                          {g.rows.map(([k, v]) => (
                            <div key={`${g.title}:${k}`} className="text-[10px] text-[#ccc]">
                              <span className="font-mono text-[#858585]">{k}</span>
                              <span className="mx-2 text-[#666]">—</span>
                              <span className="font-mono text-white break-words">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

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
