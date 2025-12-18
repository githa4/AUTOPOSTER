import { fetchOpenRouterModels, OpenRouterModel } from '../openRouterModelsService';
import { BenchmarkEntry } from '../benchmarkService';

export type OpenRouterPricingPerM = {
  inputPerM?: number;
  outputPerM?: number;
};

export type EnrichedBenchmarkEntry = BenchmarkEntry & {
  openRouterId?: string;
  openRouterCreatedAt?: number;
  openRouterContextLength?: number;
  openRouterModality?: string;
  openRouterPricingPerM?: OpenRouterPricingPerM;
};

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9/_\-.]/g, '');

const pickBestMatch = (
  query: string,
  candidates: OpenRouterModel[],
): OpenRouterModel | undefined => {
  if (!query) return undefined;
  if (candidates.length === 0) return undefined;

  const scored = candidates
    .map(model => {
      const hay = [model.id, model.canonical_slug ?? '', model.name]
        .filter(Boolean)
        .map(normalize)
        .join('|');

      const idx = hay.indexOf(query);

      // Lower is better.
      // Prefer exact-ish matches and earlier occurrences.
      const penalty = idx === -1 ? 1_000_000 : idx;
      const lengthPenalty = hay.length;

      return {
        model,
        score: penalty * 10_000 + lengthPenalty,
      };
    })
    .sort((a, b) => a.score - b.score);

  const best = scored[0];
  if (!best) return undefined;

  const bestHay = [best.model.id, best.model.canonical_slug ?? '', best.model.name]
    .filter(Boolean)
    .map(normalize)
    .join('|');

  if (!bestHay.includes(query)) return undefined;
  return best.model;
};

const toPerM = (perToken: string | undefined): number | undefined => {
  if (!perToken) return undefined;
  const parsed = Number.parseFloat(perToken);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed * 1_000_000;
};

export const enrichBenchmarksWithOpenRouter = async (
  entries: BenchmarkEntry[],
): Promise<EnrichedBenchmarkEntry[]> => {
  const models = await fetchOpenRouterModels();

  // Pre-index to reduce O(n*m) scans.
  const normalizedIndex = models.map(model => ({
    model,
    id: normalize(model.id),
    slug: normalize(model.canonical_slug ?? ''),
    name: normalize(model.name),
  }));

  return entries.map(entry => {
    const query = normalize(entry.model);

    const candidates = normalizedIndex
      .filter(x => x.id.includes(query) || x.slug.includes(query) || x.name.includes(query))
      .map(x => x.model);

    const best = pickBestMatch(query, candidates);

    if (!best) return entry;

    const inputPerM = toPerM(best.pricing?.prompt);
    const outputPerM = toPerM(best.pricing?.completion);

    const enriched: EnrichedBenchmarkEntry = {
      ...entry,
      openRouterId: best.id,
      openRouterCreatedAt: best.created,
      openRouterContextLength: best.context_length,
      openRouterModality: best.architecture?.modality,
      openRouterPricingPerM:
        inputPerM || outputPerM
          ? {
              inputPerM,
              outputPerM,
            }
          : undefined,
    };

    return enriched;
  });
};
