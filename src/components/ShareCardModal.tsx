import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2 } from 'lucide-react';
import { WorkoutLog, Exercise } from '../types';
import { saveImage, canNativeShare, shareCanvas } from '../utils/shareCanvas';
import { renderProgressCard, renderWorkoutCard, ShareVariant, ProgressCardData } from '../utils/shareCards';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalWorkouts: number;
    totalSetsLogged: number;
    totalKgLifted: number;
    streak: number;
    longestStreak: number;
  };
  timeStats: { totalSeconds: number };
  formatDuration: (totalSeconds: number) => string;
  // Datos para la versión COMPLETA de "Mi progreso".
  muscleDistribution?: ProgressCardData['muscleDistribution'];
  recentPrs?: ProgressCardData['recentPrs'];
  topExercises?: ProgressCardData['topExercises'];
  // Último entrenamiento finalizado, para poder compartir también su resumen.
  lastWorkout?: WorkoutLog | null;
  lastWorkoutExercises?: Exercise[];
  lastWorkoutHasRecord?: boolean;
}

export default function ShareCardModal({
  isOpen,
  onClose,
  stats,
  timeStats,
  formatDuration,
  muscleDistribution,
  recentPrs,
  topExercises,
  lastWorkout,
  lastWorkoutExercises,
  lastWorkoutHasRecord,
}: ShareCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [nativeOk, setNativeOk] = useState(false);
  const [mode, setMode] = useState<'progress' | 'workout'>('progress');
  const [variant, setVariant] = useState<ShareVariant>('compact');

  // Al abrir, se vuelve a la vista por defecto (progreso, compacta).
  useEffect(() => {
    if (isOpen) {
      setMode('progress');
      setVariant('compact');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setNativeOk(canNativeShare());
    setPreviewUrl('');

    let cancelled = false;
    const done = (url: string) => {
      if (!cancelled) setPreviewUrl(url);
    };

    if (mode === 'workout' && lastWorkout) {
      renderWorkoutCard(canvas, {
        log: lastWorkout,
        exercises: lastWorkoutExercises ?? [],
        hasRecord: !!lastWorkoutHasRecord,
        variant,
      }).then(done);
    } else {
      renderProgressCard(canvas, {
        stats,
        timeStats,
        formatDuration,
        variant,
        muscleDistribution,
        recentPrs,
        topExercises,
      }).then(done);
    }
    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    mode,
    variant,
    stats,
    timeStats,
    formatDuration,
    muscleDistribution,
    recentPrs,
    topExercises,
    lastWorkout,
    lastWorkoutExercises,
    lastWorkoutHasRecord,
  ]);

  const fileName = mode === 'workout' ? 'kookyecatgym-entrenamiento.png' : 'kookyecatgym-progreso.png';
  const shareTitle = mode === 'workout' ? 'Mi entrenamiento en KookyeCatGym' : 'Mi Progreso en KookyeCatGym';

  const handleDownload = () => {
    if (previewUrl && canvasRef.current) saveImage(canvasRef.current, fileName, shareTitle, previewUrl);
  };
  const handleShare = () => {
    if (canvasRef.current) shareCanvas(canvasRef.current, fileName, shareTitle, previewUrl);
  };

  const segBtn = (active: boolean) =>
    `flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
      active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col max-h-[92dvh]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
              <h3 className="font-extrabold text-white text-sm">Compartir</h3>
              <button
                type="button"
                onClick={onClose}
                title="Cerrar"
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Qué compartir (solo si hay un último entrenamiento) */}
            {lastWorkout && (
              <div className="flex gap-1.5 p-1.5 mx-5 mt-4 bg-slate-950 border border-slate-850 rounded-xl">
                <button type="button" onClick={() => setMode('progress')} className={segBtn(mode === 'progress')}>
                  Mi progreso
                </button>
                <button type="button" onClick={() => setMode('workout')} className={segBtn(mode === 'workout')}>
                  Último entrenamiento
                </button>
              </div>
            )}

            {/* Versión: compacta o completa */}
            <div className="flex gap-1.5 p-1.5 mx-5 mt-3 bg-slate-950 border border-slate-850 rounded-xl">
              <button type="button" onClick={() => setVariant('compact')} className={segBtn(variant === 'compact')}>
                Compacta
              </button>
              <button type="button" onClick={() => setVariant('full')} className={segBtn(variant === 'full')}>
                Completa
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                <canvas ref={canvasRef} className="hidden" />
                {previewUrl ? (
                  <img id="share-card-preview" src={previewUrl} alt="Tarjeta KookyeCatGym" className="w-full h-auto block" />
                ) : (
                  <div className="aspect-[4/5] flex items-center justify-center text-slate-500 text-xs font-semibold">
                    Generando tarjeta…
                  </div>
                )}
              </div>

              <div className="flex gap-2.5">
                {nativeOk && (
                  <button
                    id="btn-native-share"
                    type="button"
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Compartir
                  </button>
                )}
                <button
                  id="btn-download-share-card"
                  type="button"
                  onClick={handleDownload}
                  className={`flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer ${nativeOk ? 'px-4' : 'flex-1'}`}
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
