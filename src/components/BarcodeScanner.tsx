import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (code: string) => void;
    onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string>('');
    const hasScannedRef = useRef(false)

    useEffect(() => {
        startScanner();
        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        try {
            const scanner = new Html5Qrcode('barcode-reader');
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' }, // 背面カメラ
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    // バーコード読み取り成功(1回だけ)
                    if (hasScannedRef.current) return;

                    hasScannedRef.current = true;
                    stopScanner();
                    onScan(decodedText);
                },
                (errorMessage) => {
                    // エラーは無視(継続的にスキャン中)
                }
            );
            setIsScanning(true);
        } catch (err) {
            setError('カメラの起動に失敗しました。カメラの権限を許可してください。');
            console.error(err);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current = null;
                setIsScanning(false);
            } catch (err) {
                console.error('Scanner stop error:', err);
            }
        }
    };

    const handleClose = async () => {
        await stopScanner();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* ヘッダー */}
            <div className="bg-black/80 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white">
                    <Camera size={24} />
                    <h2 className="text-lg font-bold">バーコードスキャン</h2>
                </div>
                <button
                    onClick={handleClose}
                    className="text-white p-2"
                    aria-label="閉じる"
                >
                    <X size={24} />
                </button>
            </div>

            {/* スキャナー表示エリア */}
            <div className="flex-1 flex items-center justify-center">
                {error ? (
                    <div className="text-white text-center p-6">
                        <p className="mb-4">{error}</p>
                        <button
                            onClick={handleClose}
                            className="bg-white text-black px-6 py-2 rounded-lg font-bold"
                        >
                            閉じる
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-md">
                        <div id="barcode-reader" className="w-full"></div>
                        <p className="text-white text-center mt-4 text-sm">
                            バーコードをカメラに映してください
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}