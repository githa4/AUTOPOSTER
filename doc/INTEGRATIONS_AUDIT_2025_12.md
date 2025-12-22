# Аудит страницы «Интеграции/Настройки» (autopost.ai)

Дата: 2025-12-21

Цель: найти нестыковки/мусор/дубляж на странице настроек и подготовить к переносу в `admin-panel/web` (другой стек).

## Где сейчас живёт функциональность

- UI: `autopost.ai/components/SettingsPage.tsx` (≈1200 строк, монолит)
- Состояние и хранение: `autopost.ai/context/AppContext.tsx`
  - LocalStorage ключи: `autopost_api_wallet`, `autopost_model_config`, `autopost_tg_config`, `autopost_favorite_models`, …
- Сервисы:
  - `services/modelRegistryService` (модели/кэш)
  - `services/geminiService` (дефолтные промпты + тесты)
  - `services/telegramService` (тест Telegram)
  - `services/replicateService` (тест image generation)

## Основные нестыковки/риски

1) **Монолит + смешение ответственностей**
- В одном файле одновременно: кошелёк ключей, выбор моделей, тесты, интеграции, промпты, supabase-инспектор.
- Для переноса это неудобно: сложно выделять секции и переиспользовать логику.

2) **Слабая типизация / `any` и касты**
- В `SettingsPage.tsx` много `any` (например `SearchableSelect`, `ModelTestControl`, данные профиля/интеграций, `credentials as any`).
- Это повышает шанс скрытых рантайм-ошибок и усложняет порт на строгую типизацию (Zod/TS) в админке.

3) **Legacy-форматы и «скрытые» миграции**
- В `AppContext.tsx` есть миграция `systemPrompt -> textSystemPrompt`.
- При переносе в админку важно учесть эту миграцию (иначе пользователь потеряет настройки).

4) **Хранение секретов в LocalStorage**
- Ключи API лежат локально (LS). Для админки это почти наверняка нужно перенести в БД/секрет-хранилище.

## Дубляж/мусор (что уже улучшено)

- `GEMINI_IMAGE_MODELS` вынесен в общий файл, убран дубль из `SettingsPage.tsx`.
- Удалён неиспользуемый `components/SettingsModal.tsx`.

## Что переносить в admin-panel/web (минимальный срез)

- API Wallet (CRUD ключей + default-per-provider)
- ModelConfig:
  - выбор провайдеров/моделей
  - избранные модели
  - промпты (text/image/youtube)
- Telegram:
  - конфиг
  - «тест подключения»

Документ по переносу: `admin-panel/web/src/modules/integrations/PORTING.md`.

## Рекомендации по дальнейшим шагам (без поломки текущего UX)

1) **Не трогать UX в autopost.ai**, пока не готов API/хранилище в админке.
2) В `SettingsPage.tsx` делать только безопасные изменения:
   - выносить константы/хелперы,
   - уменьшать `any` там, где легко типизировать,
   - убирать очевидно мёртвый код после проверки usages.
3) В админке начать с backend-эндпоинтов и хранения:
   - ключи (маскирование + default)
   - modelConfig (включая миграцию legacy)
   - telegramConfig
4) После появления API — переносить UI секциями.
