
import { TelegramConfig, InlineButton } from "../types";

const sanitizeTelegramHtml = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, '\n') // Replace <br>, <br/>, <br /> with newline
    .replace(/<\/p>/gi, '\n')       // Replace </p> with newline
    .replace(/<p>/gi, '')           // Remove <p>
    .replace(/&nbsp;/g, ' ');       // Replace non-breaking spaces
};

// Helper to sleep/delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const sendRequest = async (url: string, body: FormData) => {
    const response = await fetch(url, { method: 'POST', body: body });
    const result = await response.json();
    if (!result.ok) {
        throw new Error(result.description || "Telegram API Error");
    }
    return result;
};

/**
 * Diagnostic tool to verify bot credentials and channel access
 */
export const testTelegramConnection = async (config: TelegramConfig): Promise<boolean> => {
    if (!config.botToken || !config.channelId) throw new Error("Credentials incomplete");
    
    const baseUrl = `https://api.telegram.org/bot${config.botToken}`;
    const formData = new FormData();
    formData.set('chat_id', config.channelId);
    if (config.messageThreadId) formData.set('message_thread_id', config.messageThreadId);
    
    formData.set('text', `🔧 <b>AutoPost.ai: Диагностика</b>\n\nСвязь установлена успешно! Бот имеет права на публикацию в этом канале.\n\nВремя: ${new Date().toLocaleTimeString()}`);
    formData.set('parse_mode', 'HTML');
    
    try {
        await sendRequest(`${baseUrl}/sendMessage`, formData);
        return true;
    } catch (e: any) {
        throw new Error(e.message);
    }
};

export const sendToTelegram = async (
  config: TelegramConfig, 
  text: string, 
  imageSource: string | null, // Base64 OR URL
  options?: {
    isSilent?: boolean;
    inlineButtons?: InlineButton[];
  }
): Promise<boolean> => {
  if (!config.botToken || !config.channelId) {
    throw new Error("Telegram configuration missing");
  }

  const cleanText = sanitizeTelegramHtml(text);
  const baseUrl = `https://api.telegram.org/bot${config.botToken}`;
  
  // LIMITS
  const MAX_CAPTION_LENGTH = 1000; // Safe margin (limit is 1024)
  const MAX_TEXT_LENGTH = 4000;    // Safe margin (limit is 4096)

  // --- LOGIC: SMART SPLITTING ---
  if (imageSource) {
      if (cleanText.length <= MAX_CAPTION_LENGTH) {
          return await sendPhoto(baseUrl, config.channelId, imageSource, cleanText, options, config.messageThreadId);
      } 
      else {
          const titleMatch = cleanText.match(/<b>(.*?)<\/b>/);
          const imageCaption = titleMatch ? `${titleMatch[0]}\n\n👇 <i>(Read full post below)</i>` : `👇 <i>(Read full post below)</i>`;
          await sendPhoto(baseUrl, config.channelId, imageSource, imageCaption, { isSilent: options?.isSilent }, config.messageThreadId);
          await delay(200);
          return await sendLongText(baseUrl, config.channelId, cleanText, options, config.messageThreadId);
      }
  } 
  else {
      return await sendLongText(baseUrl, config.channelId, cleanText, options, config.messageThreadId);
  }
};

const sendPhoto = async (baseUrl: string, chatId: string, imageSource: string, caption: string, options?: any, threadId?: string) => {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('parse_mode', 'HTML');
    formData.append('caption', caption);
    
    if (threadId) formData.append('message_thread_id', threadId);
    if (options?.isSilent) formData.append('disable_notification', 'true');
    if (options?.inlineButtons && options.inlineButtons.length > 0) {
        const inlineKeyboard = options.inlineButtons.map((btn: any) => ([{ text: btn.text, url: btn.url }]));
        formData.append('reply_markup', JSON.stringify({ inline_keyboard: inlineKeyboard }));
    }

    let blob: Blob;
    if (imageSource.startsWith('http')) {
        try {
            const resp = await fetch(imageSource);
            blob = await resp.blob();
        } catch (e) {
            throw new Error("Failed to download image from URL for sending.");
        }
    } else {
        const byteCharacters = atob(imageSource);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        blob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/png' });
    }

    formData.append('photo', blob, 'image.png');
    await sendRequest(`${baseUrl}/sendPhoto`, formData);
    return true;
};

const sendLongText = async (baseUrl: string, chatId: string, fullText: string, options?: any, threadId?: string) => {
    const MAX_LEN = 4000;
    const chunks = [];
    let remaining = fullText;
    while (remaining.length > 0) {
        if (remaining.length <= MAX_LEN) {
            chunks.push(remaining);
            break;
        } else {
            let splitIndex = remaining.lastIndexOf('\n', MAX_LEN);
            if (splitIndex === -1) splitIndex = MAX_LEN;
            chunks.push(remaining.substring(0, splitIndex));
            remaining = remaining.substring(splitIndex).trim();
        }
    }

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const isLastChunk = i === chunks.length - 1;
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('parse_mode', 'HTML');
        formData.append('text', chunk);
        if (threadId) formData.append('message_thread_id', threadId);
        if (options?.isSilent) formData.append('disable_notification', 'true');
        if (isLastChunk && options?.inlineButtons && options.inlineButtons.length > 0) {
             const inlineKeyboard = options.inlineButtons.map((btn: any) => ([{ text: btn.text, url: btn.url }]));
             formData.append('reply_markup', JSON.stringify({ inline_keyboard: inlineKeyboard }));
        }
        await sendRequest(`${baseUrl}/sendMessage`, formData);
        if (!isLastChunk) await delay(300);
    }
    return true;
};
