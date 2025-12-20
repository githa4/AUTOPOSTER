/**
 * Типы для мульти-провайдерного рейтинга моделей
 */

export type ModelCategory =
  | 'all'
  | 'text'
  | 'coding'
  | 'image'
  | 'video'
  | 'audio'
  | 'multimodal';

export type ProviderType = 'official' | 'unofficial';

export interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  enabled: boolean;
  apiKeyRequired: boolean;
  apiKeyEnvName?: string;
  siteUrl: string;
  docsUrl?: string;
  description: string;
  warningText?: string; // Для неофициальных провайдеров
}

export interface UnifiedPricing {
  inputPerM?: number;  // Цена за 1M входных токенов
  outputPerM?: number; // Цена за 1M выходных токенов
  imagePerUnit?: number; // Цена за 1 изображение
  audioPerMinute?: number; // Цена за минуту аудио
  videoPerSecond?: number; // Цена за секунду видео
  requestFixed?: number; // Фиксированная цена за запрос
}

export interface UnifiedModel {
  // Идентификация
  id: string;
  name: string;
  providerId: string; // ID провайдера (openrouter, together, etc.)
  providerModelId: string; // Оригинальный ID модели у провайдера
  
  // Ссылка на каноническую модель
  canonicalId?: string; // ID из canonicalModels.ts
  
  // Категория
  category: ModelCategory;
  
  // Характеристики
  contextLength?: number;
  maxOutputTokens?: number;
  pricing: UnifiedPricing;
  
  // ELO рейтинг (из Artificial Analysis)
  elo?: number;
  
  // Мета
  description?: string;
  createdAt?: number; // Unix timestamp
  isFree?: boolean;
  isNew?: boolean;
  
  // Флаг: модель в топ-рейтинге Artificial Analysis
  inLeaderboard?: boolean;
  
  // Модальность
  modality?: string;
  
  // Вендор (разработчик модели)
  vendor?: string;
  
  // Семейство модели
  family?: string;
  
  // Доступность
  accessUrl?: string;
}

export interface ProviderModelsResult {
  providerId: string;
  models: UnifiedModel[];
  lastUpdated: number;
  error?: string;
}

export interface AggregatedModel extends UnifiedModel {
  // Для отображения в общей вкладке
  providerName: string;
  providerType: ProviderType;
  isCheapest?: boolean; // Самая дешёвая версия этой модели
  alternativeProviders?: Array<{
    providerId: string;
    providerName: string;
    pricing: UnifiedPricing;
  }>;
}
