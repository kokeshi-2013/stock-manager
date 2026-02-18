import { useState, useEffect } from 'react';
import { Icon } from '../common/Icon';

export function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // PWAとして起動している場合は表示しない
        const isPWA = window.matchMedia('(display-mode: standalone)').matches;
        if (isPWA) return;

        // 以前に閉じた場合は24時間表示しない
        const lastDismissed = localStorage.getItem('installPromptDismissed');
        if (lastDismissed) {
            const hoursSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60);
            if (hoursSinceDismissed < 24) return;
        }

        // インストールプロンプトイベントをキャッチ
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // iOS Safari の場合は手動で表示
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

        if (isIOS && !isInStandaloneMode) {
            setTimeout(() => setShowPrompt(true), 3000); // 3秒後に表示
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setShowPrompt(false);
            }
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem('installPromptDismissed', Date.now().toString());
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
            <div className="bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3">
                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">📱 アプリとして使えます!</h3>
                    <p className="text-sm text-white/90 mb-3">
                        {isIOS
                            ? '下部の共有ボタン(□↑)から「ホーム画面に追加」でアプリのように使えます'
                            : 'ホーム画面に追加して、いつでも素早くアクセス!'}
                    </p>
                    {!isIOS && deferredPrompt && (
                        <button
                            onClick={handleInstall}
                            className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition"
                        >
                            インストール
                        </button>
                    )}
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-white/80 hover:text-white transition"
                    aria-label="閉じる"
                >
                    <Icon name="close" size={20} />
                </button>
            </div>
        </div>
    );
}