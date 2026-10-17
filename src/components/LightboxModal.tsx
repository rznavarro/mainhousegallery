import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Check, Calendar, Folder } from 'lucide-react';
import { FotoItem } from '../types';
import { resolvePhotoUrl } from '../services/imageUtils';
import { getCategoryDisplayName } from '../services/exportService';

interface LightboxModalProps {
  foto: FotoItem | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalFotos: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDownloadPhoto: (foto: FotoItem) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  foto,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  currentIndex,
  totalFotos,
  isSelected,
  onToggleSelect,
  onDownloadPhoto
}) => {
  useEffect(() => {
    if (!foto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [foto, onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!foto) return null;

  const photoUrl = resolvePhotoUrl(foto.archivo);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-b from-black/80 to-transparent text-white z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Foto {currentIndex + 1} de {totalFotos}
          </span>
          <span className="text-white/30">|</span>
          <span className="text-xs text-white/90 font-medium">
            {foto.proyecto}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Select Toggle in Header */}
          <button
            onClick={onToggleSelect}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isSelected
                ? 'bg-[#8B1E2D] text-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${isSelected ? 'stroke-[3]' : 'opacity-60'}`} />
            <span>{isSelected ? 'Seleccionada' : 'Seleccionar'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Cerrar visor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Image Viewport */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none">
        {/* Previous Button */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-3 sm:left-6 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* The Image */}
        <div className="relative max-w-full max-h-[72vh] flex items-center justify-center">
          <img
            src={photoUrl}
            alt={foto.titulo}
            className="max-w-full max-h-[72vh] object-contain rounded-md shadow-2xl"
          />
        </div>

        {/* Next Button */}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-3 sm:right-6 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95"
            aria-label="Siguiente foto"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Metadata & Download Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 sm:px-8 py-4 text-white z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {foto.titulo}
            </h2>

            {/* Clean metadata without pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="text-[#e27380] font-semibold">{foto.proyecto}</span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Folder className="w-3 h-3 text-slate-400" />
                {getCategoryDisplayName(foto.categoria)}
              </span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {foto.fecha}
              </span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {foto.archivo}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => onDownloadPhoto(foto)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#8B1E2D] hover:bg-[#a02334] text-white text-sm font-semibold shadow-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Descargar esta foto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
