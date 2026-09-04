import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  X, 
  RotateCw, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ScanLine,
  Image as ImageIcon,
  ArrowRight
} from 'lucide-react';
import { 
  parseAnySyncInput, 
  scanImageForQr, 
  playScanSuccessBeep, 
  CompactSyncDelta 
} from '../utils/syncHelper';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (delta: CompactSyncDelta) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'paste'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [pasteInput, setPasteInput] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Handle successful payload detection
  const handlePayloadFound = useCallback((rawPayload: string) => {
    const delta = parseAnySyncInput(rawPayload);
    if (delta && delta.p && delta.p.name) {
      playScanSuccessBeep();
      stopCamera();
      onScanSuccess(delta);
      onClose();
    } else {
      setParseError('The scanned code is not a valid CBSE 12 Tracker sync code. Please check that you scanned the correct QR code.');
    }
  }, [stopCamera, onScanSuccess, onClose]);

  // Start video stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setParseError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser. Please use the "Upload QR Image" tab instead.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);

        // Frame scanning loop
        const scanFrame = () => {
          if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
            animationFrameRef.current = requestAnimationFrame(scanFrame);
            return;
          }

          const video = videoRef.current;
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });

            if (code && code.data) {
              handlePayloadFound(code.data);
              return;
            }
          }

          animationFrameRef.current = requestAnimationFrame(scanFrame);
        };

        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: unknown) {
      console.warn('Camera start error:', err);
      const message = err instanceof Error ? err.message : 'Camera access was blocked or is unavailable.';
      setCameraError(message);
      setIsScanning(false);
    }
  }, [facingMode, handlePayloadFound, stopCamera]);

  // Manage camera on modal open/tab switch
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode, startCamera, stopCamera]);

  if (!isOpen) return null;

  // Toggle front/back camera
  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle uploaded image file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageProcessing(true);
    setParseError(null);

    try {
      const qrData = await scanImageForQr(file);
      if (qrData) {
        handlePayloadFound(qrData);
      } else {
        setParseError('No QR code found in this image. Please take a clear screenshot or photo of the QR code and try again.');
      }
    } catch (err) {
      console.error(err);
      setParseError('Failed to process image. Please try another image.');
    } finally {
      setImageProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle manual paste
  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteInput.trim()) return;
    handlePayloadFound(pasteInput.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-600/30 text-white">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Scan QR / Sync Data</h3>
              <p className="text-xs text-slate-400">Transfer student records between devices</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Input Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'camera'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'paste'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Paste Link</span>
          </button>
        </div>

        {/* Error Alert */}
        {parseError && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <p className="flex-1">{parseError}</p>
          </div>
        )}

        {/* TAB 1: LIVE CAMERA */}
        {activeTab === 'camera' && (
          <div className="space-y-3">
            <div className="relative w-full aspect-square max-h-[300px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {cameraError ? (
                <div className="p-4 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">{cameraError}</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload QR Screenshot Instead</span>
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />

                  {/* Scanning Target Viewfinder */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                    <div className="relative w-48 h-48 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                      {/* Animated Laser Scanning Line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-bounce mt-20" />
                    </div>
                  </div>

                  {/* Camera Switch Button */}
                  <button
                    onClick={toggleFacingMode}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 backdrop-blur border border-slate-700 text-white hover:bg-slate-800 transition"
                    title="Switch Camera (Front / Back)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900/90 backdrop-blur rounded-full text-[10px] text-emerald-300 font-semibold border border-emerald-500/30">
                    Align QR code within box
                  </span>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Point your camera at the QR code on your laptop screen or another phone.
            </p>
          </div>
        )}

        {/* TAB 2: UPLOAD IMAGE / SCREENSHOT */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500/80 bg-slate-950/60 hover:bg-slate-950 rounded-2xl p-8 text-center cursor-pointer transition space-y-3 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto transition">
                {imageProcessing ? (
                  <RotateCw className="w-7 h-7 animate-spin" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">
                  {imageProcessing ? 'Scanning Image...' : 'Click to Upload QR Screenshot'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Select a screenshot or photo of the QR code (PNG, JPG, WebP)
                </p>
              </div>

              <span className="inline-block px-3 py-1 bg-slate-800 rounded-full text-[11px] font-semibold text-slate-300">
                Browse Files / Gallery
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <strong className="text-emerald-400 block">💡 Transfer Phone ➔ Laptop:</strong>
              <p className="text-[11px] text-slate-400">
                1. On phone, open QR Sync and tap <strong>"Save QR Image"</strong> or take a screenshot.
              </p>
              <p className="text-[11px] text-slate-400">
                2. Send the image to your laptop (WhatsApp Web, Email, or Drive).
              </p>
              <p className="text-[11px] text-slate-400">
                3. Click above to select the image and sync instantly!
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: PASTE LINK OR CODE */}
        {activeTab === 'paste' && (
          <form onSubmit={handlePasteSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Paste Sync URL or Code:
              </label>
              <textarea
                value={pasteInput}
                onChange={e => setPasteInput(e.target.value)}
                placeholder="https://abhishta-h-mallaya.github.io/cbse-12-tracker/#sync=..."
                className="w-full h-24 p-3 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none custom-scrollbar font-mono resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!pasteInput.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-950/40 flex items-center justify-center gap-1.5 transition"
            >
              <span>Sync Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer Close */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
