
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Sparkles } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="absolute top-6 right-6 z-10">
        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md">
          <X size={24} />
        </button>
      </div>

      <div className="relative w-full max-w-2xl aspect-[3/4] sm:aspect-video bg-slate-900 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-8 text-center">
            <Camera size={48} className="mb-4 text-slate-500" />
            <p className="text-lg font-bold mb-2">{error}</p>
            <button onClick={startCamera} className="bg-indigo-600 px-6 py-2 rounded-xl">Try Again</button>
          </div>
        ) : capturedImage ? (
          <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover scale-x-[-1]" 
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-8 flex items-center gap-8">
        {!capturedImage ? (
          <button 
            onClick={takePhoto}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform border-8 border-white/20"
          >
            <div className="w-14 h-14 bg-white border-2 border-slate-200 rounded-full" />
          </button>
        ) : (
          <>
            <button 
              onClick={retake}
              className="w-16 h-16 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all"
            >
              <RefreshCw size={24} />
            </button>
            <button 
              onClick={confirmPhoto}
              className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <Check size={32} />
            </button>
          </>
        )}
      </div>

      {capturedImage && (
        <div className="mt-4 text-white/60 text-sm font-medium flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-400" />
          Perfect! Ready to share with the family.
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
