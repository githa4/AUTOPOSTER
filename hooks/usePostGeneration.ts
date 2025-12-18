
import { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { generatePostContent, generatePostImage, rewritePostSegment } from '../services/geminiService';
import { generateReplicateImage, removeBackground, upscaleImage } from '../services/replicateService';
import { createTelegraphPage } from '../services/telegraphService';
import { uploadPostImage } from '../lib/supabaseClient';
import { LoadingState, PostDraft, GenerationStats, SourceType, PostMode, ImageProvider } from '../types';

const SPLIT_DELIMITER = "\n\n===SPLIT===\n\n";

export const usePostGeneration = () => {
    const { 
        apiConfig, 
        modelConfig, 
        user, 
        addToHistory, 
        incrementQuota, 
        showToast, 
        t 
    } = useAppContext();

    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const abortController = useRef<AbortController | null>(null);

    const stopGeneration = () => {
        if (abortController.current) {
            abortController.current.abort();
            setLoadingState(LoadingState.CANCELLED);
            showToast(t('toastGenerationStopped'), 'info');
        }
    };

    const runMagicTool = async (
        text: string, 
        selectionStart: number, 
        selectionEnd: number, 
        action: string
    ) => {
        const selectedText = text.substring(selectionStart, selectionEnd);
        if (!selectedText.trim()) {
            showToast(t('magicSelectionRequired'), 'warning');
            return null;
        }

        setLoadingState(LoadingState.GENERATING_TEXT);
        try {
            const rewritten = await rewritePostSegment(selectedText, action, modelConfig.textModel, apiConfig);
            incrementQuota();
            showToast(t('toastMagicApplied'), 'success');
            return {
                before: text.substring(0, selectionStart),
                rewritten,
                after: text.substring(selectionEnd)
            };
        } catch (e: any) {
            showToast(t('toastMagicFailed').replace('{message}', e.message), 'error');
            return null;
        } finally {
            setLoadingState(LoadingState.IDLE);
        }
    };

    const processImage = async (
        currentImage: string | null, 
        action: 'rembg' | 'upscale'
    ) => {
        if (!currentImage) return null;
        if (!apiConfig.replicateKey) {
            showToast(t('toastAddReplicateKey'), 'warning');
            return null;
        }

        if (currentImage.startsWith('http')) {
            showToast(t('toastCannotProcessCloudImage'), 'warning');
            return null;
        }

        setLoadingState(LoadingState.GENERATING_IMAGE);
        try {
            let newImage = '';
            if (action === 'rembg') {
                newImage = await removeBackground(currentImage, apiConfig);
            } else if (action === 'upscale') {
                newImage = await upscaleImage(currentImage, apiConfig);
            }
            showToast(t('toastImageProcessed'), 'success');
            return newImage;
        } catch (e: any) {
            console.error(e);
            showToast(t('toastReplicateError').replace('{message}', e.message), 'error');
            return null;
        } finally {
            setLoadingState(LoadingState.IDLE);
        }
    };

    const generate = async (params: {
        topic: string;
        sourceType: SourceType;
        language: string;
        tone: string;
        imageStyle: string;
        postCount: number;
        postMode: PostMode;
        includeLongRead: boolean;
        isTextEnabled: boolean;
        isImageEnabled: boolean;
        customSystemPrompt: string;
        currentImagePrompt: string;
        scheduledAt: string;
        activeFolderId: string | null | undefined;
    }) => {
        if (!params.topic.trim()) return null;
        
        abortController.current = new AbortController();
        setErrorMsg(null);
        
        let result = {
            generatedText: '',
            generatedImage: null as string | null,
            imagePrompt: '',
            textStats: null as GenerationStats | null,
            imageStats: null as GenerationStats | null,
            newDraftId: null as string | null
        };

        try {
            const baseTextSystemPrompt =
                modelConfig.textSystemPrompt || modelConfig.systemPrompt || '';

            let effectiveTextSystemPrompt =
                params.customSystemPrompt || baseTextSystemPrompt;

            if (params.sourceType === 'youtube' && modelConfig.youtubeSystemPrompt) {
                effectiveTextSystemPrompt = `${effectiveTextSystemPrompt}\n\nYouTube Context: ${modelConfig.youtubeSystemPrompt}`;
            }

            const activeTextModel = params.sourceType === 'youtube' ? modelConfig.youtubeModel : modelConfig.textModel;
            const activeProvider = params.sourceType === 'youtube' ? modelConfig.youtubeProvider : modelConfig.textProvider;

            let content: any = null;
            let combinedText = '';

            // 1. Generate Text
            if (params.isTextEnabled) {
                setLoadingState(LoadingState.GENERATING_TEXT);

                content = await generatePostContent(
                    params.topic, 
                    params.language, 
                    activeTextModel, 
                    apiConfig, 
                    params.tone, 
                    params.imageStyle, 
                    effectiveTextSystemPrompt,
                    params.postCount, 
                    params.sourceType, 
                    params.postMode,
                    params.includeLongRead,
                    activeProvider,
                    abortController.current.signal,
                    modelConfig.temperature,
                    modelConfig.maxTokens
                );
                
                combinedText = content.posts.map((p: any) => 
                    `<b>${p.headline}</b>\n\n${p.body}`
                ).join(SPLIT_DELIMITER) + (content.hashtags.length > 0 ? `\n\n${content.hashtags.join(' ')}` : '');

                result.generatedText = combinedText;
                result.imagePrompt = content.imagePrompt;
                if (content.textStats) result.textStats = content.textStats;
                incrementQuota();
            }

            if (abortController.current.signal.aborted) {
                setLoadingState(LoadingState.CANCELLED);
                return null;
            }

            // 2. Generate Image
            if (params.isImageEnabled) {
                setLoadingState(LoadingState.GENERATING_IMAGE);
                
                const promptToUse = (params.isTextEnabled && content?.imagePrompt) ? content.imagePrompt : (params.currentImagePrompt || params.topic);
                
                if (promptToUse) {
                    const imgResult = modelConfig.imageProvider === 'replicate' 
                        ? await generateReplicateImage(promptToUse, modelConfig.imageModel, apiConfig, params.imageStyle, abortController.current.signal, modelConfig.imageSystemPrompt)
                        : await generatePostImage(promptToUse, modelConfig.imageModel, apiConfig, params.imageStyle, abortController.current.signal, modelConfig.imageSystemPrompt);
                    
                    // 2.1 Auto Upload
                    if (user && imgResult.base64) {
                        setLoadingState(LoadingState.UPLOADING);
                        const publicUrl = await uploadPostImage(user.id, imgResult.base64);
                        result.generatedImage = publicUrl || imgResult.base64;
                    } else {
                        result.generatedImage = imgResult.base64;
                    }

                    if (imgResult.stats) result.imageStats = imgResult.stats;
                    incrementQuota();
                }
            }

            // 3. Telegraph
            if (params.isTextEnabled && params.includeLongRead && content?.longReadRaw) {
                try {
                    const longReadUrl = await createTelegraphPage(
                        content.posts[0].headline || t('longReadDefaultTitle'),
                        content.longReadRaw,
                        "AutoPost.ai",
                        result.generatedImage 
                    );
                    
                    const linkHtml = `\n\n🔗 <b>${t('longReadLinkLabel')}:</b> <a href="${longReadUrl}">${t('longReadReadHere')}</a>`;
                    const parts = combinedText.split(SPLIT_DELIMITER);
                    parts[parts.length - 1] += linkHtml;
                    result.generatedText = parts.join(SPLIT_DELIMITER);
                    
                    showToast(t('toastInstantViewCreated'), 'success');
                } catch (e: any) {
                    console.error("Failed to generate Telegraph page", e);
                    showToast(t('toastTelegraphError').replace('{message}', e.message), 'warning');
                }
            }

            // 4. Save Draft
            const newDraft: PostDraft = {
                id: crypto.randomUUID(),
                folderId: params.activeFolderId || undefined,
                topic: params.topic,
                content: result.generatedText,
                imageUrl: result.generatedImage?.startsWith('http') ? result.generatedImage : null,
                imageBase64: result.generatedImage?.startsWith('http') ? null : result.generatedImage,
                imagePrompt: content?.imagePrompt || params.currentImagePrompt || (params.isImageEnabled ? params.topic : ''),
                customSystemPrompt: effectiveTextSystemPrompt,
                createdAt: Date.now(),
                scheduledAt: params.scheduledAt ? new Date(params.scheduledAt).getTime() : null,
                status: params.scheduledAt ? 'scheduled' : 'draft',
                postCount: params.postCount,
                stats: { 
                    text: result.textStats || { modelName: 'Skipped', latencyMs: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0 }, 
                    image: result.imageStats || null
                }
            };
            
            addToHistory(newDraft);
            result.newDraftId = newDraft.id;
            setLoadingState(LoadingState.SUCCESS);
            showToast(t('toastGenerationComplete'), 'success');

            return result;

        } catch (err: any) {
            if (abortController.current?.signal.aborted || err?.name === 'AbortError') {
                setLoadingState(LoadingState.CANCELLED);
                return null;
            }
            console.error(err);
            setErrorMsg(t('errorGen'));
            setLoadingState(LoadingState.ERROR);
            showToast(t('toastGenerationFailed'), 'error');
            return null;
        }
    };

    const regenerateImage = async (
        currentImagePrompt: string, 
        topic: string, 
        style: string
    ) => {
        const promptToUse = currentImagePrompt || (topic ? `A detailed image about ${topic} in ${style} style` : '');
        if (!promptToUse) return null;

        abortController.current = new AbortController();
        setLoadingState(LoadingState.GENERATING_IMAGE);
        
        try {
            const imgResult = modelConfig.imageProvider === 'replicate' 
                ? await generateReplicateImage(
                      promptToUse,
                      modelConfig.imageModel,
                      apiConfig,
                      style,
                      abortController.current.signal,
                      modelConfig.imageSystemPrompt
                  )
                : await generatePostImage(
                      promptToUse,
                      modelConfig.imageModel,
                      apiConfig,
                      style,
                      abortController.current.signal,
                      modelConfig.imageSystemPrompt
                  );

            let finalImage = imgResult.base64;

            if (user) {
                setLoadingState(LoadingState.UPLOADING);
                const publicUrl = await uploadPostImage(user.id, imgResult.base64);
                if (publicUrl) finalImage = publicUrl;
            }

            incrementQuota();
            setLoadingState(LoadingState.SUCCESS);
            return {
                image: finalImage,
                stats: imgResult.stats
            };
        } catch (err: any) {
            if (abortController.current?.signal.aborted || err?.name === 'AbortError') {
                setLoadingState(LoadingState.CANCELLED);
                return null;
            }
            setErrorMsg(t('errorImageRegen'));
            setLoadingState(LoadingState.ERROR);
            showToast(t('toastImageGenerationFailed'), 'error');
            return null;
        }
    };

    const uploadImage = async (file: File) => {
        return new Promise<{image: string, stats: GenerationStats} | null>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                let finalImage = base64String;
                
                if (user) {
                    setLoadingState(LoadingState.UPLOADING);
                    const publicUrl = await uploadPostImage(user.id, base64String);
                    if (publicUrl) finalImage = publicUrl;
                    setLoadingState(LoadingState.IDLE);
                }
                
                showToast(t('toastImageUploaded'), 'success');
                resolve({
                    image: finalImage,
                    stats: { modelName: 'Upload', latencyMs: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0 }
                });
            };
            reader.readAsDataURL(file);
        });
    };

    return {
        generate,
        regenerateImage,
        stopGeneration,
        runMagicTool,
        processImage,
        uploadImage,
        loadingState,
        errorMsg
    };
};
