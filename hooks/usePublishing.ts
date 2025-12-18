
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { publishContent } from '../services/publishService';
import { LoadingState, InlineButton } from '../types';

const SPLIT_DELIMITER = "\n\n===SPLIT===\n\n";

export const usePublishing = () => {
    const { 
        integrations, 
        telegramConfig, 
        setCurrentView, 
        updateDraftStatus, 
        showToast, 
        t 
    } = useAppContext();

    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);

    const publish = async (params: {
        text: string;
        image: string | null;
        draftId: string | null;
        charCount: number;
        isSilent: boolean;
        inlineButtons: InlineButton[];
    }) => {
        if (!params.text) return;

        if (params.charCount > 5000) {
            showToast(
                t('toastTooLongTelegram')
                    .replace('{max}', '5000')
                    .replace('{current}', String(params.charCount)),
                'error'
            );
            return;
        }

        let activeIntegrations = integrations.filter(i => i.isActive);

        // Legacy fallback
        if (activeIntegrations.length === 0) {
            if (telegramConfig.botToken && telegramConfig.channelId) {
                activeIntegrations.push({
                    id: 'legacy',
                    provider: 'telegram',
                    name: 'Legacy Telegram',
                    credentials: telegramConfig,
                    isActive: true
                });
            } else {
                setCurrentView('settings');
                showToast(t('toastNoIntegrationsAddDestination'), 'warning');
                return;
            }
        }

        setLoadingState(LoadingState.PUBLISHING);
        
        const parts = params.text.split(SPLIT_DELIMITER);
        let successCount = 0;
        
        try {
            for (const integration of activeIntegrations) {
                for (let i = 0; i < parts.length; i++) {
                    const partText = parts[i].trim();
                    if (!partText) continue;

                    const isFirst = i === 0;
                    const success = await publishContent(
                        integration, 
                        partText, 
                        isFirst ? params.image : null, 
                        {
                            isSilent: params.isSilent,
                            inlineButtons: isFirst ? params.inlineButtons : []
                        }
                    );

                    if (success) successCount++;
                    
                    if (i < parts.length - 1) {
                        await new Promise(r => setTimeout(r, 500));
                    }
                }
            }

            if (successCount > 0) {
                if (params.draftId && !params.draftId.startsWith('temp') && !params.draftId.startsWith('new')) {
                    updateDraftStatus(params.draftId, 'published', undefined);
                }
                showToast(
                    t('toastPublishedToDestinations').replace(
                        '{count}',
                        String(activeIntegrations.length)
                    ),
                    'success'
                );
            } else {
                showToast(t('toastPublishFailedAnyDestination'), 'error');
            }
        
        } catch (err: any) {
            console.error(err);
            showToast(t('errorPub'), 'error');
        } finally {
            setLoadingState(LoadingState.IDLE);
        }
    };

    return {
        publish,
        loadingState
    };
};
